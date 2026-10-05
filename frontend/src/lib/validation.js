/** Tiny validation helpers shared by the auth and checkout forms. */

export const required = (label) => (value) => (value.trim() ? undefined : `${label} is required`)

export const email = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? undefined : 'Enter a valid email address'

export const minLength = (label, min) => (value) =>
  value.trim().length >= min ? undefined : `${label} must be at least ${min} characters`

/** Indian mobile number: 10 digits starting with 6–9, optional +91 / 0 prefix. */
export const indianPhone = (value) =>
  /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/.test(value.replace(/\s/g, ''))
    ? undefined
    : 'Enter a valid 10-digit mobile number'

/** Indian PIN code: 6 digits, cannot start with 0. */
export const pincode = (value) =>
  /^[1-9]\d{5}$/.test(value.trim()) ? undefined : 'Enter a valid 6-digit PIN code'

export function validate(values, rules) {
  const errors = {}
  for (const field of Object.keys(rules)) {
    for (const rule of rules[field] ?? []) {
      const message = rule(values[field])
      if (message) {
        errors[field] = message
        break
      }
    }
  }
  return errors
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}
