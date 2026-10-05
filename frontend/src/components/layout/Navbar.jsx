import { Heart, Menu, Search } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'
import { selectCartCount, useCartStore } from '@/store/cartStore'
import { useUiStore } from '@/store/uiStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { AccountMenu } from './AccountMenu'
import { Logo } from './Logo'

export function Navbar() {
  const cartCount = useCartStore(selectCartCount)
  const wishlistCount = useWishlistStore((state) => state.productIds.length)
  const { setCartDrawerOpen, setSearchOpen, setMenuOpen } = useUiStore()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-3 sm:h-16 sm:px-4">
        {/* Left */}
        <div className="flex items-center gap-1 lg:gap-0">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="-ml-2 rounded-sm p-2 hover:bg-surface-muted lg:hidden"
          >
            <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="rounded-sm p-2 hover:bg-surface-muted lg:hidden"
          >
            <Search className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-5">
              {site.mainNav.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        'py-2 label transition-colors hover:text-muted',
                        'highlight' in link && link.highlight && 'text-sale',
                        isActive && 'underline underline-offset-[6px]',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Centre */}
        <Logo />

        {/* Right */}
        <div className="flex items-center justify-end gap-1 sm:gap-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden label hover:text-muted lg:block"
          >
            Search
          </button>
          <div className="hidden sm:block">
            <AccountMenu />
          </div>
          <Link
            to="/wishlist"
            className="relative rounded-sm p-2 hover:bg-surface-muted sm:p-0 sm:hover:bg-transparent"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <Heart className="size-5 sm:size-4" strokeWidth={1.5} aria-hidden="true" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-0.5 size-2 rounded-full bg-accent ring-2 ring-bg sm:-top-1 sm:-right-1.5" />
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-sm p-2 label hover:text-muted sm:p-0"
            aria-label={`Bag, ${cartCount} items`}
          >
            <span className="hidden sm:inline">Bag</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-xs bg-surface-muted px-1 font-mono">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
