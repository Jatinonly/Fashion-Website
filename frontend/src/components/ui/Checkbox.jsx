import { Check } from 'lucide-react'
import { useId } from 'react'
import { cn } from '@/lib/cn'

export function Checkbox({ label, id, className, ...props }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <label htmlFor={inputId} className={cn('flex cursor-pointer items-center gap-2.5', className)}>
      <span className="relative inline-flex">
        <input id={inputId} type="checkbox" className="peer sr-only" {...props} />
        <span className="flex size-4 items-center justify-center rounded-xs border border-ink bg-bg peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink [&>svg]:invisible peer-checked:[&>svg]:visible">
          <Check className="size-3 text-inverse" strokeWidth={3} aria-hidden="true" />
        </span>
      </span>
      <span className="text-sm">{label}</span>
    </label>
  )
}
