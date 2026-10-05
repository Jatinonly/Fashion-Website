import { cn } from '@/lib/cn'

const base =
  'inline-flex items-center justify-center gap-2 font-sans uppercase tracking-(--tracking-label) transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

const variants = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover rounded-sm',
  dark: 'bg-ink text-inverse hover:bg-ink-soft rounded-sm',
  secondary: 'bg-surface-muted text-ink hover:bg-surface rounded-sm',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-inverse rounded-sm',
  ghost: 'text-ink hover:bg-surface-muted rounded-sm',
  link: 'text-ink underline underline-offset-4 hover:text-muted normal-case tracking-normal',
}

const sizes = {
  sm: 'h-8 px-3 text-2xs',
  md: 'h-10 px-5 text-xs',
  lg: 'h-12 px-6 text-xs',
  icon: 'h-10 w-10 text-xs',
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
} = {}) {
  return cn(
    base,
    variants[variant],
    variant !== 'link' && sizes[size],
    fullWidth && 'w-full',
    className,
  )
}
