import { Checkbox } from '@/components/ui/Checkbox'
import { cn } from '@/lib/cn'
import { useFilterStore } from '@/store/filterStore'
import { PriceRangeFilter } from './PriceRangeFilter'

function FilterSection({ title, children }) {
  return (
    <section className="border-b border-line px-4 py-5 last:border-b-0">
      <h3 className="mb-3 label font-medium">{title}</h3>
      {children}
    </section>
  )
}

const chipClass = (active) =>
  cn(
    'flex h-9 min-w-11 items-center justify-center gap-2 rounded-sm border px-2.5 text-xs transition-colors',
    active ? 'border-ink bg-ink text-inverse' : 'border-line hover:border-ink',
  )

export function FilterPanel({ facets }) {
  const filters = useFilterStore()

  return (
    <div>
      <FilterSection title="Availability">
        <Checkbox
          label="In stock only"
          checked={filters.inStockOnly}
          onChange={(event) => filters.setInStockOnly(event.target.checked)}
        />
      </FilterSection>

      <FilterSection title="Price">
        <PriceRangeFilter
          key={`${filters.minPrice ?? ''}-${filters.maxPrice ?? ''}`}
          min={filters.minPrice}
          max={filters.maxPrice}
          boundsMin={facets.priceMin}
          boundsMax={facets.priceMax}
          onChange={filters.setPriceRange}
        />
      </FilterSection>

      {facets.sizes.length > 1 && (
        <FilterSection title="Size">
          <ul className="flex flex-wrap gap-1.5">
            {facets.sizes.map((size) => {
              const active = filters.sizes.includes(size)
              return (
                <li key={size}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => filters.toggleSize(size)}
                    className={chipClass(active)}
                  >
                    {size}
                  </button>
                </li>
              )
            })}
          </ul>
        </FilterSection>
      )}

      <FilterSection title="Colour">
        <ul className="flex flex-wrap gap-1.5">
          {facets.colours.map((colour) => {
            const active = filters.colours.includes(colour.name)
            return (
              <li key={colour.name}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => filters.toggleColour(colour.name)}
                  className={chipClass(active)}
                >
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-full ring-1 ring-line"
                    style={{ backgroundColor: colour.hex }}
                  />
                  {colour.name}
                </button>
              </li>
            )
          })}
        </ul>
      </FilterSection>
    </div>
  )
}
