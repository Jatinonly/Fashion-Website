import { buttonClasses } from './buttonStyles'
import { Spinner } from './Spinner'

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner label="Please wait" />}
      {children}
    </button>
  )
}
