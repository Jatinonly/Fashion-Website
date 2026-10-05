import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'

const PRESETS = [
  { label: `Under ${formatINR(5000)}`, max: 5000 },
  { label: `${formatINR(5000)} – ${formatINR(10000)}`, min: 5000, max: 10000 },
  { label: `${formatINR(10000)} – ${formatINR(20000)}`, min: 10000, max: 20000 },
  { label: `Above ${formatINR(20000)}`, min: 20000 },
]

const toNumber = (value) => {
  const parsed = Number(value.replace(/[^\d]/g, ''))
  return value.trim() === '' || Number.isNaN(parsed) ? undefined : parsed
}

/** Re-mount with a `key` derived from min/max to reset the inputs when filters are cleared. */
export function PriceRangeFilter({ min, max, boundsMin, boundsMax, onChange }) {
  const [minInput, setMinInput] = useState(min?.toString() ?? '')
  const [maxInput, setMaxInput] = useState(max?.toString() ?? '')

  const apply = (event) => {
    event.preventDefault()
    let nextMin = toNumber(minInput)
    let nextMax = toNumber(maxInput)
    if (nextMin !== undefined && nextMax !== undefined && nextMin > nextMax) {
      ;[nextMin, nextMax] = [nextMax, nextMin]
    }
    onChange(nextMin, nextMax)
  }

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => {
          const active = preset.min === min && preset.max === max
          return (
            <li key={preset.label}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => (active ? onChange() : onChange(preset.min, preset.max))}
                className={cn(
                  'rounded-sm px-2.5 py-1.5 font-mono text-2xs transition-colors',
                  active ? 'bg-ink text-inverse' : 'bg-surface-muted hover:bg-surface',
                )}
              >
                {preset.label}
              </button>
            </li>
          )
        })}
      </ul>
      <form onSubmit={apply} className="flex items-end gap-2">
        <label className="flex-1">
          <span className="label text-muted">Min ₹</span>
          <input
            inputMode="numeric"
            value={minInput}
            onChange={(event) => setMinInput(event.target.value)}
            placeholder={String(boundsMin)}
            className="mt-1 h-9 w-full rounded-sm bg-surface-muted px-2 font-mono text-xs"
          />
        </label>
        <label className="flex-1">
          <span className="label text-muted">Max ₹</span>
          <input
            inputMode="numeric"
            value={maxInput}
            onChange={(event) => setMaxInput(event.target.value)}
            placeholder={String(boundsMax)}
            className="mt-1 h-9 w-full rounded-sm bg-surface-muted px-2 font-mono text-xs"
          />
        </label>
        <Button type="submit" variant="dark" size="sm" className="h-9">
          Apply
        </Button>
      </form>
    </div>
  )
}
