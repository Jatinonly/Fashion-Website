import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import Razorpay from 'razorpay'
import { config } from '../config.js'
import { withTransaction } from '../db/pool.js'
import { HttpError } from '../lib/httpError.js'
import * as v from '../lib/validate.js'
import { requireAuth } from '../middleware/auth.js'
import { loadOrders } from './orders.js'

export const paymentsRouter = Router()

function createRazorpayClient() {
  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  })
}

// compare the bytes of signature from server to razor pay's signature
function signatureMatches(expected, supplied) {
  if (typeof supplied !== 'string' || !/^[a-f\d]{64}$/i.test(supplied)) return false
  const expectedBuffer = Buffer.from(expected, 'hex')
  const suppliedBuffer = Buffer.from(supplied, 'hex')
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  )
}

// Its job is to calculate the signature that our server expects from Razorpay
function paymentSignature(orderId, paymentId) {
  return createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
}

async function findOwnedOrder(db, orderId, userId, { lock = false } = {}) {
  const { rows } = await db.query(
    `SELECT * FROM orders WHERE id = $1 AND user_id = $2${lock ? ' FOR UPDATE' : ''}`,
    [orderId, userId],
  )
  if (!rows[0]) throw new HttpError(404, 'Order not found')
  return rows[0]
}

/**
 * POST /api/payments/razorpay/webhook
 * Razorpay signs the exact raw request body with the configured webhook secret.
 */
paymentsRouter.post('/razorpay/webhook', async (req, res) => {
  if (config.razorpay.mock) throw new HttpError(404, 'Webhook is disabled in Razorpay mock mode')
  if (!Buffer.isBuffer(req.body)) throw new HttpError(400, 'Webhook body must be raw JSON')

  const signature = req.get('x-razorpay-signature') ?? ''
  const expected = createHmac('sha256', config.razorpay.webhookSecret)
    .update(req.body)
    .digest('hex')
  if (!signatureMatches(expected, signature)) throw new HttpError(400, 'Invalid webhook signature')

  let event
  try {
    event = JSON.parse(req.body.toString('utf8'))
  } catch {
    throw new HttpError(400, 'Webhook body is not valid JSON')
  }
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    throw new HttpError(400, 'Webhook payload is not valid')
  }

  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const payment = event.payload?.payment?.entity
    const razorpayOrderId = payment?.order_id ?? event.payload?.order?.entity?.id
    const razorpayPaymentId = payment?.id ?? null
    if (typeof razorpayOrderId === 'string' && razorpayOrderId) {
      await withTransaction(async (client) => {
        const { rows } = await client.query(
          'SELECT * FROM orders WHERE razorpay_order_id = $1 FOR UPDATE',
          [razorpayOrderId],
        )
        const order = rows[0]
        if (!order || order.payment_method !== 'razorpay' || order.payment_status === 'paid') return
        await client.query(
          `UPDATE orders
           SET payment_status = 'paid', status = 'confirmed',
               razorpay_payment_id = COALESCE($2, razorpay_payment_id)
           WHERE id = $1`,
          [order.id, razorpayPaymentId],
        )
      })
    }
  }

  res.json({ received: true })
})

paymentsRouter.use(requireAuth)

/**
 * POST /api/payments/razorpay/order { orderId }
 * Creates a gateway order using only the amount stored on the user's database order.
 */
paymentsRouter.post('/razorpay/order', async (req, res) => {
  const orderId = v.str(req.body?.orderId, 'Order')
  const result = await withTransaction(async (client) => {
    const order = await findOwnedOrder(client, orderId, req.userId, { lock: true })
    if (order.payment_method !== 'razorpay') {
      throw new HttpError(400, 'This order is not payable with Razorpay')
    }
    if (order.payment_status === 'paid') throw new HttpError(409, 'This order is already paid')
    if (order.payment_status !== 'pending' || order.status === 'cancelled') {
      throw new HttpError(409, 'This order can no longer be paid')
    }

    const amount = Number(order.total) * 100
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new HttpError(400, 'Order total is not a valid payment amount')
    }

    if (config.razorpay.mock) {
      const razorpayOrderId =
        order.razorpay_order_id ?? `order_mock_${randomBytes(10).toString('hex')}`
      if (!order.razorpay_order_id) {
        await client.query('UPDATE orders SET razorpay_order_id = $2 WHERE id = $1', [
          order.id,
          razorpayOrderId,
        ])
      }
      return {
        id: razorpayOrderId,
        amount,
        currency: 'INR',
        keyId: 'mock',
        mock: true,
      }
    }

    if (order.razorpay_order_id?.startsWith('order_mock_')) {
      throw new HttpError(409, 'This order was created in mock mode and cannot use live checkout')
    }
    const keyId = config.razorpay.keyId
    if (order.razorpay_order_id) {
      return {
        id: order.razorpay_order_id,
        amount,
        currency: 'INR',
        keyId,
        mock: false,
      }
    }

    const gatewayOrder = await createRazorpayClient().orders.create({
      amount,
      currency: 'INR',
      receipt: order.id,
    })
    await client.query('UPDATE orders SET razorpay_order_id = $2 WHERE id = $1', [
      order.id,
      gatewayOrder.id,
    ])
    return {
      id: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      keyId,
      mock: false,
    }
  })

  res.status(201).json(result)
})

/**
 * POST /api/payments/razorpay/verify
 * { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
paymentsRouter.post('/razorpay/verify', async (req, res) => {
  const orderId = v.str(req.body?.orderId, 'Order')
  const razorpayOrderId = v.str(req.body?.razorpay_order_id, 'Razorpay order')
  const razorpayPaymentId = v.str(req.body?.razorpay_payment_id, 'Razorpay payment')
  const signature = v.str(req.body?.razorpay_signature, 'Payment signature', { max: 128 })

  const validSignature = config.razorpay.mock
    ? razorpayOrderId.startsWith('order_mock_') &&
      razorpayPaymentId.startsWith('pay_mock_') &&
      signature === `mock_sig_${razorpayPaymentId}`
    : signatureMatches(paymentSignature(razorpayOrderId, razorpayPaymentId), signature)
  if (!validSignature) {
    throw new HttpError(400, 'Payment signature is invalid')
  }

  const result = await withTransaction(async (client) => {
    const order = await findOwnedOrder(client, orderId, req.userId, { lock: true })
    if (order.payment_method !== 'razorpay' || order.razorpay_order_id !== razorpayOrderId) {
      throw new HttpError(400, 'Payment does not match this order')
    }
    if (order.payment_status === 'paid') {
      if (order.razorpay_payment_id && order.razorpay_payment_id !== razorpayPaymentId) {
        throw new HttpError(409, 'This order has already been paid')
      }
      if (!order.razorpay_payment_id) {
        await client.query('UPDATE orders SET razorpay_payment_id = $2 WHERE id = $1', [
          order.id,
          razorpayPaymentId,
        ])
      }
    } else {
      if (order.payment_status !== 'pending' || order.status === 'cancelled') {
        throw new HttpError(409, 'This order can no longer be paid')
      }
      await client.query(
        `UPDATE orders
         SET payment_status = 'paid', status = 'confirmed', razorpay_payment_id = $2
         WHERE id = $1`,
        [order.id, razorpayPaymentId],
      )
    }
    const { rows } = await client.query('SELECT * FROM orders WHERE id = $1', [order.id])
    const [updatedOrder] = await loadOrders(rows, client)
    return updatedOrder
  })

  res.json({ verified: true, order: result })
})

/**
 * POST /api/payments/razorpay/fail { orderId }
 * Marks a pending payment as failed and releases its stock reservation once.
 */
paymentsRouter.post('/razorpay/fail', async (req, res) => {
  const orderId = v.str(req.body?.orderId, 'Order')
  const result = await withTransaction(async (client) => {
    const order = await findOwnedOrder(client, orderId, req.userId, { lock: true })
    if (order.payment_method !== 'razorpay') {
      throw new HttpError(400, 'This order is not payable with Razorpay')
    }
    if (order.payment_status === 'paid') throw new HttpError(409, 'A paid order cannot be failed')
    if (order.payment_status === 'failed') return { failed: true }

    const { rows: lines } = await client.query(
      `SELECT product_id, size, SUM(quantity)::int AS quantity
       FROM order_items WHERE order_id = $1 GROUP BY product_id, size`,
      [order.id],
    )
    for (const line of lines) {
      await client.query(
        `UPDATE products
         SET stock = jsonb_set(
           stock,
           ARRAY[$2::text],
           to_jsonb((stock ->> $2::text)::int + $3::int),
           true
         )
         WHERE id = $1`,
        [line.product_id, line.size, line.quantity],
      )
    }
    await client.query(
      `UPDATE orders SET payment_status = 'failed', status = 'cancelled' WHERE id = $1`,
      [order.id],
    )
    return { failed: true }
  })

  res.json(result)
})
