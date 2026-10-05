/**
 * Razorpay payments.
 *
 * Real flow (https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/):
 *   1. Backend creates an order with the Razorpay Orders API using the SECRET key.
 *   2. Frontend loads checkout.js and opens Razorpay Checkout with the public KEY ID + order id.
 *   3. On success Razorpay returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }.
 *   4. Backend verifies the signature: HMAC_SHA256(order_id + "|" + payment_id, KEY_SECRET).
 *   5. Only after verification does the backend mark the order as paid.
 *
 * Right now steps 1, 2 and 4 are simulated. Each place to swap is marked TODO(razorpay).
 * The mock is used whenever `env.useMockPayments` is true (see config/env.js).
 */
import { env } from '@/config/env'
import { site } from '@/config/site'
import { apiRequest, mockDelay } from './http'
import { mockRazorpay } from './mockRazorpay'

/**
 * @typedef {object} RazorpayOrder Returned by POST /payments/razorpay/order.
 * @property {string} id e.g. "order_Nx1y2z", created server-side.
 * @property {number} amount Amount in paise (₹1 = 100 paise).
 * @property {'INR'} currency
 * @property {string} receipt
 */

/**
 * @typedef {{ razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }} RazorpaySuccessPayload
 * @typedef {{ order: RazorpayOrder, prefill: { name?: string, email?: string, contact?: string }, description: string }} CheckoutOptions
 * @typedef {{ status: 'success', payload: RazorpaySuccessPayload } | { status: 'failed', reason: string } | { status: 'dismissed' }} PaymentOutcome
 */

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

export function getRazorpayKeyId() {
  return env.razorpayKeyId || 'rzp_test_mock_key'
}

/**
 * Step 1 — create a Razorpay order for the given amount (in rupees).
 * @param {number} amountInRupees
 * @param {string} receipt
 * @returns {Promise<RazorpayOrder>}
 */
export async function createRazorpayOrder(amountInRupees, receipt) {
  if (!env.useMockPayments) {
    // TODO(razorpay): backend endpoint calls `razorpay.orders.create({ amount, currency: 'INR', receipt })`
    // with the key secret and returns the created order.
    return apiRequest('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({ amount: amountInRupees, receipt }),
    })
  }
  await mockDelay(500)
  return {
    id: `order_mock_${Math.random().toString(36).slice(2, 12)}`,
    amount: Math.round(amountInRupees * 100), // Razorpay works in paise
    currency: 'INR',
    receipt,
  }
}

/** Step 2a — inject checkout.js once. Resolves false if the script can't load (offline, blocked). */
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Step 2b — open the Razorpay popup and resolve with what the customer did.
 * @param {CheckoutOptions} options
 * @returns {Promise<PaymentOutcome>}
 */
export async function openRazorpayCheckout(options) {
  if (env.useMockPayments) {
    // MOCK: renders <MockRazorpayHost /> which lets you simulate success / failure / dismiss.
    return mockRazorpay.open(options)
  }

  // TODO(razorpay): this is the real Checkout integration — enabled once `env.useMockPayments` is false.
  const loaded = await loadRazorpayScript()
  if (!loaded || !window.Razorpay) {
    return { status: 'failed', reason: 'Could not load Razorpay. Check your connection.' }
  }
  const Razorpay = window.Razorpay
  return new Promise((resolve) => {
    const instance = new Razorpay({
      key: getRazorpayKeyId(),
      amount: options.order.amount,
      currency: options.order.currency,
      name: site.name,
      description: options.description,
      order_id: options.order.id,
      prefill: options.prefill,
      handler: (payload) => resolve({ status: 'success', payload }),
      modal: { ondismiss: () => resolve({ status: 'dismissed' }) },
    })
    instance.on('payment.failed', (response) =>
      resolve({ status: 'failed', reason: response.error.description }),
    )
    instance.open()
  })
}

/**
 * Step 4 — ask the backend to verify the payment signature. Never verify on the client.
 * @param {RazorpaySuccessPayload} payload
 * @returns {Promise<boolean>}
 */
export async function verifyPayment(payload) {
  if (!env.useMockPayments) {
    // TODO(razorpay): backend computes HMAC_SHA256(`${order_id}|${payment_id}`, KEY_SECRET)
    // and compares it to razorpay_signature, then marks the order as paid.
    const result = await apiRequest('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return result.verified
  }
  await mockDelay(400)
  return payload.razorpay_signature.startsWith('mock_sig_')
}

/** Convenience wrapper used by the checkout page: create → open → verify. */
export async function payWithRazorpay(params) {
  const order = await createRazorpayOrder(params.amount, params.receipt)
  const outcome = await openRazorpayCheckout({
    order,
    prefill: params.prefill,
    description: params.description,
  })
  if (outcome.status !== 'success') return { ...outcome, orderId: order.id }

  const verified = await verifyPayment(outcome.payload)
  if (!verified) {
    return { status: 'failed', reason: 'Payment could not be verified.', orderId: order.id }
  }
  return { ...outcome, orderId: order.id }
}

export const paymentService = {
  createRazorpayOrder,
  loadRazorpayScript,
  openRazorpayCheckout,
  verifyPayment,
  payWithRazorpay,
  getRazorpayKeyId,
}
