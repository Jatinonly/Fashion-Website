import { site } from '@/config/site'

/**
 * @typedef {object} PriceSummary
 * @property {number} itemCount
 * @property {number} mrpTotal Sum of original (MRP) prices.
 * @property {number} subtotal Sum of selling prices.
 * @property {number} savings
 * @property {number} shipping
 * @property {number} total
 */

/**
 * @param {import('@/store/cartStore').CartItem[]} items
 * @returns {PriceSummary}
 */
export function computePriceSummary(items) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const mrpTotal = items.reduce(
    (sum, item) => sum + (item.compareAtPrice ?? item.price) * item.quantity,
    0,
  )
  const shipping = itemCount === 0 || subtotal >= site.freeShippingThreshold ? 0 : site.shippingFee

  return {
    itemCount,
    mrpTotal,
    subtotal,
    savings: mrpTotal - subtotal,
    shipping,
    total: subtotal + shipping,
  }
}
