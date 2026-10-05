import { X } from 'lucide-react'
import { useId } from 'react'
import { createPortal } from 'react-dom'
import { useOverlay } from '@/hooks/useOverlay'
import { cn } from '@/lib/cn'

const placement = {
  left: 'inset-y-0 left-0 w-full max-w-sm animate-slide-in-left',
  right: 'inset-y-0 right-0 w-full max-w-md animate-slide-in-right',
  top: 'inset-x-0 top-0 max-h-[85dvh] animate-slide-in-top',
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  hideTitle = false,
  className,
}) {
  const titleId = useId()
  const panelRef = useOverlay(open, onClose)
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-fade-in bg-overlay"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn('absolute flex flex-col bg-bg shadow-overlay', placement[side], className)}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 id={titleId} className={cn('text-xs font-medium uppercase', hideTitle && 'sr-only')}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 ml-auto rounded-sm p-2 hover:bg-surface-muted"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <footer className="shrink-0 border-t border-line p-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
