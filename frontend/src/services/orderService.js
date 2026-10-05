/**
 * Orders.
 *
 * API mode — backend/src/routes/orders.js (requires login; the token is sent automatically):
 *   createOrder → POST /orders      (server re-prices the cart and checks stock; client totals are ignored)
 *   listOrders  → GET  /orders      (scoped to the authenticated user)
 *   getOrder    → GET  /orders/:id
 *
 * Mock mode keeps orders in a localStorage table so history survives reloads.
 */
import { env } from '@/config/env'
import { createId } from '@/lib/id'
import { ApiError, apiRequest, mockDelay, mockTable } from './http'

/**
 * @typedef {import('@/store/cartStore').CartItem} CartItem
 * @typedef {import('@/lib/pricing').PriceSummary} PriceSummary
 */

/**
 * @typedef {object} Address
 * @property {string} fullName
 * @property {string} phone
 * @property {string} email
 * @property {string} line1
 * @property {string} line2
 * @property {string} city
 * @property {string} state
 * @property {string} pincode
 */

/**
 * @typedef {object} OrderPayment
 * @property {'razorpay' | 'cod'} method
 * @property {'pending' | 'paid' | 'failed'} status
 * @property {string} [razorpayOrderId]
 * @property {string} [razorpayPaymentId]
 */

/**
 * @typedef {{ userId: string, items: CartItem[], address: Address, summary: PriceSummary, payment: OrderPayment }} CreateOrderInput
 * @typedef {CreateOrderInput & { id: string, status: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled', createdAt: string }} Order
 */

const orders = mockTable('orders')

/**
 * @param {CreateOrderInput} input
 * @returns {Promise<Order>}
 */
export async function createOrder(input) {
  if (!env.useMockApi) {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: input.items.map(({ productId, size, colour, quantity }) => ({
          productId,
          size,
          colour: colour.name,
          quantity,
        })),
        address: input.address,
        payment: { method: input.payment.method },
      }),
    })
  }
  await mockDelay(500)
  const order = {
    ...input,
    id: createId('NOC-'),
    status: input.payment.status === 'paid' ? 'confirmed' : 'placed',
    createdAt: new Date().toISOString(),
  }
  orders.write([order, ...orders.read()])
  return order
}

/**
 * @param {string} userId
 * @returns {Promise<Order[]>}
 */
export async function listOrders(userId) {
  if (!env.useMockApi) return apiRequest('/orders')
  await mockDelay(400)
  return orders
    .read()
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/**
 * @param {string} userId
 * @param {string} orderId
 * @returns {Promise<Order>}
 */
export async function getOrder(userId, orderId) {
  if (!env.useMockApi) return apiRequest(`/orders/${encodeURIComponent(orderId)}`)
  await mockDelay(300)
  const order = orders.read().find((row) => row.id === orderId && row.userId === userId)
  if (!order) throw new ApiError('Order not found', 404)
  return order
}

export const orderService = { createOrder, listOrders, getOrder }
