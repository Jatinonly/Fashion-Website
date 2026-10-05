import { env } from '@/config/env'

/** Simulated network latency for mock services. */
export function mockDelay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class ApiError extends Error {
  status

  constructor(message, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Wired up by the auth store, so services don't import stores (avoids circular imports). */
const authHooks = { getToken: () => null, onUnauthorized: () => {} }

export function configureAuth(hooks) {
  Object.assign(authHooks, hooks)
}

/**
 * Thin fetch wrapper for the Express API (backend/). Sends the logged-in user's token
 * automatically; pass `auth: false` to skip it.
 */
export async function apiRequest(path, init = {}) {
  const { auth = true, headers, ...rest } = init
  const token = auth ? authHooks.getToken() : null
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    // A rejected token means the session is over; log out so the UI sends the user to /login.
    if (response.status === 401 && token) authHooks.onUnauthorized()
    throw new ApiError(body.message ?? response.statusText, response.status)
  }
  if (response.status === 204) return null
  return await response.json()
}

/** `{ a: 1, b: ['x', 'y'], c: undefined }` → "a=1&b=x%2Cy" (skips empty values). */
export function toSearchParams(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === false) continue
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','))
    } else {
      search.set(key, value === true ? '1' : String(value))
    }
  }
  return search.toString()
}

/** Small localStorage-backed table used by the mock services to fake a database. */
export function mockTable(key) {
  const storageKey = `nocturne:mock-db:${key}`
  return {
    read() {
      try {
        return JSON.parse(localStorage.getItem(storageKey) ?? '[]')
      } catch {
        return []
      }
    },
    write(rows) {
      localStorage.setItem(storageKey, JSON.stringify(rows))
    },
  }
}
