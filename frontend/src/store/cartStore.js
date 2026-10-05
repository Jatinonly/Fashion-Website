import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * @typedef {object} CartItem
 * @property {string} id `${productId}:${size}:${colourName}`
 * @property {string} productId
 * @property {string} slug
 * @property {string} name
 * @property {number} price
 * @property {number} [compareAtPrice]
 * @property {string} size
 * @property {{ name: string, hex: string }} colour
 * @property {string} silhouette
 * @property {number} quantity
 * @property {number} maxQuantity Stock available for the selected size at time of adding.
 */

export const cartItemId = (productId, size, colourName) => `${productId}:${size}:${colourName}`

export const useCartStore = create()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const id = cartItemId(item.productId, item.size, item.colour.name)
          const existing = state.items.find((line) => line.id === id)
          if (existing) {
            return {
              items: state.items.map((line) =>
                line.id === id
                  ? { ...line, quantity: Math.min(line.quantity + quantity, line.maxQuantity) }
                  : line,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { ...item, id, quantity: Math.min(quantity, item.maxQuantity) },
            ],
          }
        }),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((line) =>
            line.id === id
              ? { ...line, quantity: Math.max(1, Math.min(quantity, line.maxQuantity)) }
              : line,
          ),
        })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((line) => line.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'nocturne:cart', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)

export const selectCartCount = (state) => state.items.reduce((sum, line) => sum + line.quantity, 0)
