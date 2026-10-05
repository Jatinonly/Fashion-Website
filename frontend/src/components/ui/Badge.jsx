import { cn } from '@/lib/cn'

const variants = {
  neutral: 'bg-surface-muted text-ink',
  accent: 'bg-accent text-accent-ink',
  sale: 'bg-sale text-inverse',
  dark: 'bg-ink text-inverse',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

export function Badge({ children, variant = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-sm px-2 label whitespace-nowrap',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
