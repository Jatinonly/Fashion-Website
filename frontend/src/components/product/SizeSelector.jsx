import { cn } from '@/lib/cn'

export function SizeSelector({ sizes, stock, value, onChange, error, onOpenGuide }) {
  const selectedStock = value ? (stock[value] ?? 0) : 0
  return (
    <fieldset aria-describedby={error ? 'size-error' : undefined}>
      <div className="mb-2 flex items-center justify-between">
        <legend className="label">
          Size {value && <span className="text-muted">{value}</span>}
        </legend>
        {onOpenGuide && (
          <button
            type="button"
            onClick={onOpenGuide}
            className="label underline underline-offset-4"
          >
            Size guide
          </button>
        )}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-1.5">
        {sizes.map((size) => {
          const units = stock[size] ?? 0
          const soldOut = units === 0
          const selected = value === size
          return (
            <label
              key={size}
              className={cn(
                'relative flex h-10 items-center justify-center rounded-sm border text-xs transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink',
                selected ? 'border-ink bg-ink text-inverse' : 'border-line bg-bg hover:border-ink',
                soldOut && 'cursor-not-allowed text-muted line-through hover:border-line',
                !soldOut && 'cursor-pointer',
              )}
            >
              <input
                type="radio"
                name="size"
                value={size}
                checked={selected}
                disabled={soldOut}
                onChange={() => onChange(size)}
                className="sr-only"
              />
              {size}
              {soldOut && <span className="sr-only"> (sold out)</span>}
            </label>
          )
        })}
      </div>
      {error ? (
        <p id="size-error" role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      ) : value && selectedStock > 0 && selectedStock <= 3 ? (
        <p className="mt-2 text-xs text-warning">Only {selectedStock} left in this size</p>
      ) : null}
    </fieldset>
  )
}
