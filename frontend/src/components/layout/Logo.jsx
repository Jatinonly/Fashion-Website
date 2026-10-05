import { Link } from 'react-router-dom'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'

export function Logo({ className }) {
  return (
    <Link
      to="/"
      className={cn('flex flex-col items-center leading-none', className)}
      aria-label={`${site.name} — home`}
    >
      <svg viewBox="0 0 24 24" className="size-4 sm:size-5" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 9 9 7 7 0 1 1-9-9z" fill="currentColor" />
      </svg>
      <span className="mt-0.5 font-display text-base tracking-[0.18em] sm:text-lg">
        {site.logoText}
      </span>
    </Link>
  )
}
