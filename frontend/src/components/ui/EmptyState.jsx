export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-4 py-20 text-center">
      <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-surface-muted">
        <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2 className="text-base font-medium uppercase">{title}</h2>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
