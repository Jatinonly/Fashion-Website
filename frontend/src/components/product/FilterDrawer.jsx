import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { pluralize } from '@/lib/format'
import { useFilterStore } from '@/store/filterStore'
import { FilterPanel } from './FilterPanel'
import { SORT_OPTIONS } from './sortOptions'

/** Mobile / tablet filters, including sort (the toolbar select is hidden on small screens). */
export function FilterDrawer({ open, onClose, facets, resultCount }) {
  const sort = useFilterStore((state) => state.sort)
  const setSort = useFilterStore((state) => state.setSort)
  const reset = useFilterStore((state) => state.reset)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter & sort"
      side="right"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={reset}>
            Clear all
          </Button>
          <Button variant="dark" onClick={onClose}>
            Show {pluralize(resultCount, 'item')}
          </Button>
        </div>
      }
    >
      <section className="border-b border-line px-4 py-5">
        <h3 className="mb-3 label font-medium">Sort by</h3>
        <ul className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                aria-pressed={sort === option.value}
                onClick={() => setSort(option.value)}
                className={
                  sort === option.value
                    ? 'h-9 rounded-sm border border-ink bg-ink px-3 text-xs text-inverse'
                    : 'h-9 rounded-sm border border-line px-3 text-xs hover:border-ink'
                }
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <FilterPanel facets={facets} />
    </Drawer>
  )
}
