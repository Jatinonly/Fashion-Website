export const controlClasses =
  'h-11 w-full rounded-sm border bg-surface-muted px-3 text-sm text-ink placeholder:text-muted transition-colors focus:bg-bg focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink disabled:opacity-60'

export function describedBy(id, error, hint) {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}
