import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll to top on route (pathname) changes — query-string changes keep position. */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
