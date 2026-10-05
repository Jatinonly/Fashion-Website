import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'

export function Breadcrumbs({ items, className }) {
  const all = [{ label: site.name, to: '/' }, ...items]
  return (
    <nav aria-label="Breadcrumb" className={cn('px-3 py-3 sm:px-4', className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 label">
        {all.map((crumb, index) => {
          const last = index === all.length - 1
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <li>
                {crumb.to && !last ? (
                  <Link to={crumb.to} className="text-muted hover:text-ink">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined}>{crumb.label}</span>
                )}
              </li>
              {!last && (
                <li aria-hidden="true" className="text-muted">
                  •
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
