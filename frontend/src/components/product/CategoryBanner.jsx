import { Link } from 'react-router-dom'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { cn } from '@/lib/cn'

/** Full-bleed editorial tile with oversized accent title — the signature home-page block. */
export function CategoryBanner({
  title,
  subtitle,
  image,
  to,
  cta = 'Discover now',
  className,
  imageClassName,
}) {
  return (
    <section
      className={cn('relative aspect-[4/5] overflow-hidden bg-ink md:aspect-[3/4]', className)}
    >
      <img
        src={image}
        alt=""
        className={cn('absolute inset-0 size-full object-cover', imageClassName)}
        loading="lazy"
      />
      <div className="relative flex flex-col items-start gap-3 p-3 sm:p-4">
        <h2 className="text-mega font-medium tracking-tight text-accent uppercase">
          {title}
          {subtitle && <span className="sr-only"> — {subtitle}</span>}
        </h2>
        {subtitle && (
          <p aria-hidden="true" className="-mt-1 bg-ink px-1.5 py-0.5 label text-accent">
            {subtitle}
          </p>
        )}
        <Link to={to} className={buttonClasses({ variant: 'primary', className: 'min-w-36' })}>
          {cta}
          <span className="sr-only">: {title}</span>
        </Link>
      </div>
    </section>
  )
}
