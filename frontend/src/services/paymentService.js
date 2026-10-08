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
 * @property {string} keyId
 * @property {boolean} [mock] Whether checkout should use the simulated popup.
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
 * Step 1 — create a Razorpay order for an existing database order.
 * The amount is only used by mock mode; real payments use the server's stored total.
 * @param {string} orderId
 * @param {number} mockAmountInRupees
 * @returns {Promise<RazorpayOrder>}
 */
export async function createRazorpayOrder(orderId, mockAmountInRupees) {
  if (!env.useMockPayments) {
    return apiRequest('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    })
  }
  await mockDelay(500)
  return {
    id: `order_mock_${Math.random().toString(36).slice(2, 12)}`,
    amount: Math.round(mockAmountInRupees * 100),
    currency: 'INR',
    keyId: getRazorpayKeyId(),
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
  if (env.useMockPayments || options.order.mock) {
    // MOCK: renders <MockRazorpayHost /> which lets you simulate success / failure / dismiss.
    return mockRazorpay.open(options)
  }

  const loaded = await loadRazorpayScript()
  if (!loaded || !window.Razorpay) {
    return { status: 'failed', reason: 'Could not load Razorpay. Check your connection.' }
  }
  const Razorpay = window.Razorpay
  return new Promise((resolve) => {
    const instance = new Razorpay({
      key: options.order.keyId || getRazorpayKeyId(),
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
 * @param {string} orderId
 * @param {RazorpaySuccessPayload} payload
 * @returns {Promise<boolean>}
 */
export async function verifyPayment(orderId, payload) {
  if (!env.useMockPayments) {
    const result = await apiRequest('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId, ...payload }),
    })
    return result.verified
  }
  await mockDelay(400)
  return payload.razorpay_signature.startsWith('mock_sig_')
}

/** Reports a failed or dismissed checkout so the backend can release reserved stock. */
export async function reportPaymentFailure(orderId) {
  if (!env.useMockPayments) {
    return apiRequest('/payments/razorpay/fail', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    })
  }
  await mockDelay(250)
  return { failed: true }
}

/** Convenience wrapper used by checkout: create gateway order → open → verify. */
export async function payWithRazorpay(params) {
  const order = await createRazorpayOrder(params.orderId, params.amount)
  const outcome = await openRazorpayCheckout({
    order,
    prefill: params.prefill,
    description: params.description,
  })
  if (outcome.status !== 'success') return { ...outcome, orderId: params.orderId }

  const verified = await verifyPayment(params.orderId, outcome.payload)
  if (!verified) {
    return { status: 'failed', reason: 'Payment could not be verified.', orderId: params.orderId }
  }
  return { ...outcome, orderId: params.orderId, razorpayOrder: order }
}

export const paymentService = {
  createRazorpayOrder,
  loadRazorpayScript,
  openRazorpayCheckout,
  verifyPayment,
  reportPaymentFailure,
  payWithRazorpay,
  getRazorpayKeyId,
}
