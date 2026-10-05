/** Label + control + hint/error wiring shared by Input and Select. */
export function FormField({ id, label, error, hint, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label text-ink-soft">
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
