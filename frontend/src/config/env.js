/** Typed access to Vite env vars. Add new ones to `.env.example` too. */
export const env = {
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID ?? '',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  /** Mock services are used until a backend URL is configured. */
  get useMockApi() {
    return this.apiBaseUrl === ''
  },
  get useMockPayments() {
    return this.useMockApi
  },
}
