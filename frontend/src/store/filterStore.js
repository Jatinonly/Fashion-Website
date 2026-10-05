import { create } from 'zustand'

const initialFilters = {
  minPrice: undefined,
  maxPrice: undefined,
  sizes: [],
  colours: [],
  inStockOnly: false,
  sort: 'featured',
}

const toggle = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

/** Listing filters. Intentionally not persisted — they reset per browsing session. */
export const useFilterStore = create()((set) => ({
  ...initialFilters,
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  toggleSize: (size) => set((state) => ({ sizes: toggle(state.sizes, size) })),
  toggleColour: (colour) => set((state) => ({ colours: toggle(state.colours, colour) })),
  setInStockOnly: (inStockOnly) => set({ inStockOnly }),
  setSort: (sort) => set({ sort }),
  reset: () => set(initialFilters),
}))

export const selectActiveFilterCount = (state) =>
  state.sizes.length +
  state.colours.length +
  (state.inStockOnly ? 1 : 0) +
  (state.minPrice !== undefined || state.maxPrice !== undefined ? 1 : 0)
