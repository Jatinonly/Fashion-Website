import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { authService } from '@/services/authService'
import { configureAuth } from '@/services/http'

const errorMessage = (error) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.'

export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      token: null,
      status: 'idle',
      error: null,
      login: async (input) => {
        set({ status: 'loading', error: null })
        try {
          const session = await authService.login(input)
          set({ user: session.user, token: session.token, status: 'idle' })
          return true
        } catch (error) {
          set({ status: 'idle', error: errorMessage(error) })
          return false
        }
      },
      signup: async (input) => {
        set({ status: 'loading', error: null })
        try {
          const session = await authService.signup(input)
          set({ user: session.user, token: session.token, status: 'idle' })
          return true
        } catch (error) {
          set({ status: 'idle', error: errorMessage(error) })
          return false
        }
      },
      logout: async () => {
        await authService.logout()
        set({ user: null, token: null, error: null })
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'nocturne:auth',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
)

configureAuth({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.setState({ user: null, token: null }),
})
