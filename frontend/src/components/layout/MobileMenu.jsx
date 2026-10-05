import { NavLink } from 'react-router-dom'
import { Drawer } from '@/components/ui/Drawer'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

export function MobileMenu() {
  const open = useUiStore((state) => state.menuOpen)
  const setOpen = useUiStore((state) => state.setMenuOpen)
  const user = useAuthStore((state) => state.user)
  const close = () => setOpen(false)

  const linkClass = ({ isActive }) =>
    cn('block py-3 text-2xl font-medium uppercase tracking-tight', isActive && 'underline')

  return (
    <Drawer open={open} onClose={close} title="Menu" side="left">
      <nav aria-label="Mobile" className="px-4 py-4">
        <ul className="divide-y divide-line">
          {site.mainNav.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={close}
                className={(state) =>
                  cn(linkClass(state), 'highlight' in link && link.highlight && 'text-sale')
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <ul className="mt-8 space-y-3 text-sm">
          {user ? (
            <>
              <li className="label text-muted">Signed in as {user.name}</li>
              <li>
                <NavLink to="/orders" onClick={close}>
                  My orders
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" onClick={close}>
                  Log in
                </NavLink>
              </li>
              <li>
                <NavLink to="/signup" onClick={close}>
                  Create an account
                </NavLink>
              </li>
            </>
          )}
          <li>
            <NavLink to="/wishlist" onClick={close}>
              Wishlist
            </NavLink>
          </li>
        </ul>
      </nav>
    </Drawer>
  )
}
