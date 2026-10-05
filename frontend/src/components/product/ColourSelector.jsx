import { cn } from '@/lib/cn'

export function ColourSelector({ colours, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 label">
        Colour <span className="text-muted">{value.name}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {colours.map((colour) => {
          const selected = colour.name === value.name
          return (
            <label
              key={colour.name}
              className={cn(
                'relative flex size-9 cursor-pointer items-center justify-center rounded-sm ring-1 ring-line transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink',
                selected && 'ring-2 ring-ink',
              )}
            >
              <input
                type="radio"
                name="colour"
                value={colour.name}
                checked={selected}
                onChange={() => onChange(colour)}
                className="sr-only"
              />
              {/* The swatch colour is product data, not a theme colour. */}
              <span className="size-7 rounded-xs" style={{ backgroundColor: colour.hex }} />
              <span className="sr-only">{colour.name}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
