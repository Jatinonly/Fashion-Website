/**
 * MOCK ONLY — a tiny bridge that lets `paymentService` "open" a simulated
 * Razorpay popup rendered by <MockRazorpayHost /> (see components/checkout).
 * Delete this file once real Razorpay Checkout is enabled.
 */

let current = null
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener(current))
}

export const mockRazorpay = {
  open(options) {
    return new Promise((resolve) => {
      current = {
        options,
        resolve: (outcome) => {
          current = null
          emit()
          resolve(outcome)
        },
      }
      emit()
    })
  },
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getCurrent() {
    return current
  },
}
