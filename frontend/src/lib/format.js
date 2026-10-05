const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/** Formats rupees for display, e.g. 12499 → "₹12,499". Use this everywhere prices are shown. */
export function formatINR(amount) {
  return inrFormatter.format(amount)
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso) {
  return dateFormatter.format(new Date(iso))
}

export function discountPercent(price, compareAtPrice) {
  if (!compareAtPrice || compareAtPrice <= price) return 0
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}
