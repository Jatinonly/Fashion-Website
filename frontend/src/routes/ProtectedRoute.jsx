import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { safeRedirect } from '@/lib/navigation'
import { useAuthStore } from '@/store/authStore'

/** Redirects to /login (remembering where the user was going) when signed out. */
export function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  return children
}

/**
 * Keeps signed-in users away from the login / signup screens.
 * Also performs the post-login redirect (to `?redirect=` or home).
 */
export function GuestRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  const [params] = useSearchParams()
  if (user) return <Navigate to={safeRedirect(params.get('redirect'))} replace />
  return children
}
