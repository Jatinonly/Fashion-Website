import { useId } from 'react'
import { cn } from '@/lib/cn'
import { FormField } from './FormField'
import { controlClasses, describedBy } from './formStyles'

export function Input({ label, error, hint, id, className, required, ...props }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <FormField id={inputId} label={label} error={error} hint={hint} required={required}>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        className={cn(controlClasses, error ? 'border-danger' : 'border-transparent', className)}
        {...props}
      />
    </FormField>
  )
}
