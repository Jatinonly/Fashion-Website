import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useOrdersStore } from '@/store/ordersStore'

export function AccountMenu() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const clearOrders = useOrdersStore((state) => state.clear)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) {
    return (
      <Link to="/login" className="label hover:text-muted">
        Log in
      </Link>
    )
  }

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    clearOrders()
    navigate('/')
  }

  const itemClass = 'block w-full px-4 py-2.5 text-left text-xs hover:bg-surface-muted'

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 label hover:text-muted"
      >
        {user.name.split(' ')[0]}
        <ChevronDown className="size-3" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-3 w-48 animate-fade-in rounded-sm border border-line bg-bg py-1 shadow-overlay"
        >
          <p className="truncate px-4 py-2 text-2xs text-muted">{user.email}</p>
          <Link role="menuitem" to="/orders" className={itemClass} onClick={() => setOpen(false)}>
            My orders
          </Link>
          <Link role="menuitem" to="/wishlist" className={itemClass} onClick={() => setOpen(false)}>
            Wishlist
          </Link>
          <button role="menuitem" type="button" className={itemClass} onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
