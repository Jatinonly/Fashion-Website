import { ChevronDown } from 'lucide-react'
import { useId } from 'react'
import { cn } from '@/lib/cn'
import { FormField } from './FormField'
import { controlClasses, describedBy } from './formStyles'

export function Select({
  label,
  options,
  placeholder,
  error,
  hint,
  id,
  className,
  required,
  ...props
}) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <FormField id={selectId} label={label} error={error} hint={hint} required={required}>
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, error, hint)}
          className={cn(
            controlClasses,
            'appearance-none pr-9',
            error ? 'border-danger' : 'border-transparent',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        />
      </div>
    </FormField>
  )
}
