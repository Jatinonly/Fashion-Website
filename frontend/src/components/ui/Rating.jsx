import { Star } from 'lucide-react'

export function Rating({ value, count }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="flex" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={
              index < Math.round(value) ? 'size-3.5 fill-ink text-ink' : 'size-3.5 text-line'
            }
          />
        ))}
      </span>
      <span className="sr-only">Rated {value} out of 5</span>
      <span className="font-mono">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted">({count} reviews)</span>}
    </div>
  )
}
