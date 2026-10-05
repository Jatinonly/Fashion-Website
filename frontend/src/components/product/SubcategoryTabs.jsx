import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

/** Horizontal strip of sub-categories (scrolls on mobile), mirrors the reference's tab bar. */
export function SubcategoryTabs({ basePath, subcategories, active, search }) {
  if (subcategories.length < 2) return null
  const href = (sub) => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (sub) params.set('type', sub)
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }
  const items = [
    { label: 'All', value: undefined },
    ...subcategories.map((s) => ({ label: s, value: s })),
  ]

  return (
    <nav aria-label="Sub-categories" className="border-b border-line">
      <ul className="no-scrollbar flex overflow-x-auto">
        {items.map((item) => {
          const current = item.value === active
          return (
            <li key={item.label} className="shrink-0 md:flex-1">
              <Link
                to={href(item.value)}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'relative block px-4 py-3 label whitespace-nowrap transition-colors hover:text-ink md:text-center',
                  current
                    ? 'text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-ink'
                    : 'text-muted',
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
