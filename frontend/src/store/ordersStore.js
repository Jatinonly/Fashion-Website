import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { orderService } from '@/services/orderService'

export const useOrdersStore = create()(
  persist(
    (set) => ({
      orders: [],
      status: 'idle',
      fetchOrders: async (userId) => {
        set({ status: 'loading' })
        try {
          const orders = await orderService.listOrders(userId)
          set({ orders, status: 'idle' })
        } catch {
          set({ status: 'error' })
        }
      },
      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders.filter((o) => o.id !== order.id)] })),
      clear: () => set({ orders: [], status: 'idle' }),
    }),
    {
      name: 'nocturne:orders',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
)
