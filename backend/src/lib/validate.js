/** Small input guards. Each returns the cleaned value or throws a 400. */
import { HttpError } from './httpError.js'

export function str(value, label, { min = 1, max = 500 } = {}) {
  if (typeof value !== 'string') throw new HttpError(400, `${label} is required`)
  const trimmed = value.trim()
  if (trimmed.length < min) {
    throw new HttpError(
      400,
      min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`,
    )
  }
  if (trimmed.length > max) throw new HttpError(400, `${label} is too long`)
  return trimmed
}

export function optionalStr(value, label, { max = 500 } = {}) {
  if (value === undefined || value === null || value === '') return ''
  return str(value, label, { min: 0, max })
}

export function email(value) {
  const cleaned = str(value, 'Email', { max: 254 }).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleaned)) {
    throw new HttpError(400, 'Enter a valid email address')
  }
  return cleaned
}

export function indianPhone(value) {
  const cleaned = str(value, 'Phone', { max: 20 }).replace(/\s/g, '')
  if (!/^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/.test(cleaned)) {
    throw new HttpError(400, 'Enter a valid 10-digit mobile number')
  }
  return cleaned
}

export function pincode(value) {
  const cleaned = str(value, 'PIN code', { max: 6 })
  if (!/^[1-9]\d{5}$/.test(cleaned)) throw new HttpError(400, 'Enter a valid 6-digit PIN code')
  return cleaned
}

export function int(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const number = typeof value === 'string' ? Number(value) : value
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new HttpError(400, `${label} must be a whole number between ${min} and ${max}`)
  }
  return number
}

export function oneOf(value, label, allowed) {
  if (!allowed.includes(value))
    throw new HttpError(400, `${label} must be one of: ${allowed.join(', ')}`)
  return value
}
