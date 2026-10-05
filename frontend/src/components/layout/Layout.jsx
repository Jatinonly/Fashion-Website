import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { MockRazorpayHost } from '@/components/checkout/MockRazorpayHost'
import { AnnouncementBar } from './AnnouncementBar'
import { Footer } from './Footer'
import { MobileMenu } from './MobileMenu'
import { Navbar } from './Navbar'
import { PageLoader } from './PageLoader'
import { ScrollToTop } from './ScrollToTop'
import { SearchOverlay } from './SearchOverlay'

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 bg-ink px-4 py-2 text-inverse focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <AnnouncementBar />
      <Navbar />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <MobileMenu />
      <SearchOverlay />
      <MockRazorpayHost />
    </div>
  )
}
