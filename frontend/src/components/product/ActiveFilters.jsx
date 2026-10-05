import { X } from 'lucide-react'
import { formatINR } from '@/lib/format'
import { selectActiveFilterCount, useFilterStore } from '@/store/filterStore'

function Chip({ label, onRemove }) {
  return (
    <li>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-7 items-center gap-1.5 rounded-sm bg-surface-muted px-2 text-xs hover:bg-surface"
        aria-label={`Remove filter: ${label}`}
      >
        {label}
        <X className="size-3" aria-hidden="true" />
      </button>
    </li>
  )
}

export function ActiveFilters() {
  const filters = useFilterStore()
  if (selectActiveFilterCount(filters) === 0) return null

  const priceLabel =
    filters.minPrice !== undefined && filters.maxPrice !== undefined
      ? `${formatINR(filters.minPrice)} – ${formatINR(filters.maxPrice)}`
      : filters.minPrice !== undefined
        ? `From ${formatINR(filters.minPrice)}`
        : filters.maxPrice !== undefined
          ? `Up to ${formatINR(filters.maxPrice)}`
          : null

  return (
    <ul
      className="flex flex-wrap items-center gap-1.5 px-3 pb-3 sm:px-4"
      aria-label="Active filters"
    >
      {filters.inStockOnly && (
        <Chip label="In stock" onRemove={() => filters.setInStockOnly(false)} />
      )}
      {priceLabel && <Chip label={priceLabel} onRemove={() => filters.setPriceRange()} />}
      {filters.sizes.map((size) => (
        <Chip key={size} label={size} onRemove={() => filters.toggleSize(size)} />
      ))}
      {filters.colours.map((colour) => (
        <Chip key={colour} label={colour} onRemove={() => filters.toggleColour(colour)} />
      ))}
      <li>
        <button
          type="button"
          onClick={filters.reset}
          className="px-2 label underline underline-offset-4"
        >
          Clear all
        </button>
      </li>
    </ul>
  )
}
