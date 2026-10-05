/**
 * Orders, scoped to the logged-in user. The server re-prices the cart from the database
 * and never trusts prices, totals or payment status sent by the browser.
 */
import { randomBytes } from 'node:crypto'
import { Router } from 'express'
import { config } from '../config.js'
import { query, withTransaction } from '../db/pool.js'
import { HttpError } from '../lib/httpError.js'
import * as v from '../lib/validate.js'
import { requireAuth } from '../middleware/auth.js'

export const ordersRouter = Router()
ordersRouter.use(requireAuth)

const MAX_LINES = 50
const MAX_QUANTITY_PER_LINE = 20

const LOCK_PRODUCTS_SQL = `
  SELECT id, slug, name, price, compare_at_price, sizes, colours, stock, silhouette
  FROM products WHERE id = ANY ($1::text[])
  FOR UPDATE`

const DECREMENT_STOCK_SQL = `
  UPDATE products
  SET stock = jsonb_set(stock, ARRAY[$2::text], to_jsonb((stock ->> $2::text)::int - $3::int))
  WHERE id = $1`

const INSERT_ORDER_SQL = `
  INSERT INTO orders (
    id, user_id, status,
    ship_full_name, ship_phone, ship_email, ship_line1, ship_line2, ship_city, ship_state, ship_pincode,
    item_count, mrp_total, subtotal, savings, shipping, total,
    payment_method, payment_status
  ) VALUES ($1, $2, 'placed', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'pending')`

const INSERT_ITEM_SQL = `
  INSERT INTO order_items (
    order_id, product_id, slug, name, price, compare_at_price,
    size, colour_name, colour_hex, silhouette, quantity
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

const LIST_ORDERS_SQL = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC'
const GET_ORDER_SQL = 'SELECT * FROM orders WHERE id = $1 AND user_id = $2'
const ITEMS_FOR_ORDERS_SQL =
  'SELECT * FROM order_items WHERE order_id = ANY ($1::text[]) ORDER BY id'

function newOrderId() {
  const time = Date.now().toString(36).slice(-4).toUpperCase()
  const random = randomBytes(4).toString('hex').toUpperCase()
  return `NOC-${time}${random}`
}

/** Row(s) → the `Order` shape the frontend uses (see frontend/src/services/orderService.js). */
function toOrder(row, itemRows) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    address: {
      fullName: row.ship_full_name,
      phone: row.ship_phone,
      email: row.ship_email,
      line1: row.ship_line1,
      line2: row.ship_line2,
      city: row.ship_city,
      state: row.ship_state,
      pincode: row.ship_pincode,
    },
    summary: {
      itemCount: row.item_count,
      mrpTotal: row.mrp_total,
      subtotal: row.subtotal,
      savings: row.savings,
      shipping: row.shipping,
      total: row.total,
    },
    payment: {
      method: row.payment_method,
      status: row.payment_status,
      ...(row.razorpay_order_id ? { razorpayOrderId: row.razorpay_order_id } : {}),
      ...(row.razorpay_payment_id ? { razorpayPaymentId: row.razorpay_payment_id } : {}),
    },
    items: itemRows.map((item) => ({
      id: `${item.product_id}:${item.size}:${item.colour_name}`,
      productId: item.product_id,
      slug: item.slug,
      name: item.name,
      price: item.price,
      ...(item.compare_at_price !== null ? { compareAtPrice: item.compare_at_price } : {}),
      size: item.size,
      colour: { name: item.colour_name, hex: item.colour_hex },
      silhouette: item.silhouette,
      quantity: item.quantity,
      maxQuantity: item.quantity,
    })),
  }
}

async function loadOrders(orderRows, db = { query }) {
  if (orderRows.length === 0) return []
  const { rows: itemRows } = await db.query(ITEMS_FOR_ORDERS_SQL, [orderRows.map((row) => row.id)])
  return orderRows.map((row) =>
    toOrder(
      row,
      itemRows.filter((item) => item.order_id === row.id),
    ),
  )
}

function parseAddress(input) {
  if (!input || typeof input !== 'object') throw new HttpError(400, 'Delivery address is required')
  return {
    fullName: v.str(input.fullName, 'Full name', { max: 120 }),
    phone: v.indianPhone(input.phone),
    email: v.email(input.email),
    line1: v.str(input.line1, 'Address line 1', { max: 200 }),
    line2: v.optionalStr(input.line2, 'Address line 2', { max: 200 }),
    city: v.str(input.city, 'City', { max: 100 }),
    state: v.str(input.state, 'State', { max: 100 }),
    pincode: v.pincode(input.pincode),
  }
}

function parseItems(input) {
  if (!Array.isArray(input) || input.length === 0) throw new HttpError(400, 'Your bag is empty')
  if (input.length > MAX_LINES) throw new HttpError(400, 'Too many items in one order')
  return input.map((item) => ({
    productId: v.str(item?.productId, 'Product', { max: 50 }),
    size: v.str(item?.size, 'Size', { max: 30 }),
    // Accept either the cart's `{ name, hex }` object or a plain colour name.
    colourName: v.str(item?.colour?.name ?? item?.colour, 'Colour', { max: 50 }),
    quantity: v.int(item?.quantity, 'Quantity', { min: 1, max: MAX_QUANTITY_PER_LINE }),
  }))
}

/**
 * POST /api/orders
 * { items: [{ productId, size, colour, quantity }], address, payment: { method: 'cod' | 'razorpay' } }
 * → Order
 */
ordersRouter.post('/', async (req, res) => {
  const items = parseItems(req.body?.items)
  const address = parseAddress(req.body?.address)
  const method = v.oneOf(req.body?.payment?.method, 'Payment method', ['cod', 'razorpay'])
  // TODO(razorpay): until /payments/razorpay/verify exists, every order starts as payment "pending".

  const order = await withTransaction(async (client) => {
    const productIds = [...new Set(items.map((item) => item.productId))]
    const { rows: products } = await client.query(LOCK_PRODUCTS_SQL, [productIds])
    const byId = new Map(products.map((product) => [product.id, product]))

    // Stock is tracked per size (not per colour), so add up lines that share a product + size.
    const wanted = new Map()
    const lines = items.map((item) => {
      const product = byId.get(item.productId)
      if (!product) throw new HttpError(400, 'One of the items in your bag is no longer available')
      if (!product.sizes.includes(item.size)) {
        throw new HttpError(400, `${product.name} is not available in size ${item.size}`)
      }
      const colour = product.colours.find((c) => c.name === item.colourName)
      if (!colour)
        throw new HttpError(400, `${product.name} is not available in ${item.colourName}`)
      const key = `${product.id}|${item.size}`
      wanted.set(key, (wanted.get(key) ?? 0) + item.quantity)
      return { product, colour, size: item.size, quantity: item.quantity }
    })

    for (const [key, quantity] of wanted) {
      const [productId, size] = key.split('|')
      const product = byId.get(productId)
      const available = Number(product.stock[size] ?? 0)
      if (available < quantity) {
        throw new HttpError(
          409,
          available === 0
            ? `${product.name} (${size}) has just sold out`
            : `Only ${available} left of ${product.name} (${size})`,
        )
      }
      await client.query(DECREMENT_STOCK_SQL, [productId, size, quantity])
    }

    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
    const mrpTotal = lines.reduce(
      (sum, line) => sum + (line.product.compare_at_price ?? line.product.price) * line.quantity,
      0,
    )
    const shipping = subtotal >= config.shipping.freeThreshold ? 0 : config.shipping.fee

    const id = newOrderId()
    await client.query(INSERT_ORDER_SQL, [
      id,
      req.userId,
      address.fullName,
      address.phone,
      address.email,
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.pincode,
      itemCount,
      mrpTotal,
      subtotal,
      mrpTotal - subtotal,
      shipping,
      subtotal + shipping,
      method,
    ])
    for (const line of lines) {
      await client.query(INSERT_ITEM_SQL, [
        id,
        line.product.id,
        line.product.slug,
        line.product.name,
        line.product.price,
        line.product.compare_at_price,
        line.size,
        line.colour.name,
        line.colour.hex,
        line.product.silhouette,
        line.quantity,
      ])
    }

    const { rows } = await client.query(GET_ORDER_SQL, [id, req.userId])
    const [created] = await loadOrders(rows, client)
    return created
  })

  res.status(201).json(order)
})

/** GET /api/orders → Order[] (newest first) */
ordersRouter.get('/', async (req, res) => {
  const { rows } = await query(LIST_ORDERS_SQL, [req.userId])
  res.json(await loadOrders(rows))
})

/** GET /api/orders/:id → Order */
ordersRouter.get('/:id', async (req, res) => {
  const { rows } = await query(GET_ORDER_SQL, [req.params.id, req.userId])
  if (!rows[0]) throw new HttpError(404, 'Order not found')
  const [order] = await loadOrders(rows)
  res.json(order)
})
