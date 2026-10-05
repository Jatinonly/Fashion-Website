import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'

export function Price({ price, compareAtPrice, className }) {
  const discounted = compareAtPrice !== undefined && compareAtPrice > price
  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2 font-mono', className)}>
      <span className={discounted ? 'text-sale' : undefined}>
        <span className="sr-only">{discounted ? 'Sale price ' : 'Price '}</span>
        {formatINR(price)}
      </span>
      {discounted && (
        <s className="text-muted">
          <span className="sr-only">Original price </span>
          {formatINR(compareAtPrice)}
        </s>
      )}
    </p>
  )
}
