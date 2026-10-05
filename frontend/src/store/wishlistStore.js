import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const useWishlistStore = create()(
  persist(
    (set) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [productId, ...state.productIds],
        })),
      remove: (productId) =>
        set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) })),
      clear: () => set({ productIds: [] }),
    }),
    { name: 'nocturne:wishlist', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)

export const useIsWishlisted = (productId) =>
  useWishlistStore((state) => state.productIds.includes(productId))
