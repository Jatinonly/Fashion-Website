import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  label = 'Quantity',
  size = 'md',
}) {
  const buttonClass = cn(
    'flex items-center justify-center hover:bg-surface disabled:opacity-40 disabled:hover:bg-transparent',
    size === 'sm' ? 'size-8' : 'size-10',
  )
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-sm bg-surface-muted"
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <output aria-live="polite" className="w-8 text-center font-mono text-sm">
        {value}
      </output>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
