import { ChevronDown } from 'lucide-react'
import { useFilterStore } from '@/store/filterStore'
import { SORT_OPTIONS } from './sortOptions'

export function SortSelect() {
  const sort = useFilterStore((state) => state.sort)
  const setSort = useFilterStore((state) => state.setSort)
  return (
    <label className="relative flex items-center gap-2">
      <span className="hidden label text-muted sm:inline">Sort</span>
      <select
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        className="h-9 appearance-none rounded-sm bg-surface-muted pr-8 pl-3 label"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 size-3.5 text-muted"
      />
    </label>
  )
}
