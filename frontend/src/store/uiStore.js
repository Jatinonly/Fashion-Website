import { create } from 'zustand'

/** Transient UI state (drawers / overlays). Not persisted. */
export const useUiStore = create()((set) => ({
  cartDrawerOpen: false,
  searchOpen: false,
  menuOpen: false,
  setCartDrawerOpen: (cartDrawerOpen) => set({ cartDrawerOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}))
