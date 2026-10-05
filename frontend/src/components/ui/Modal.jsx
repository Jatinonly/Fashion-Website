import { X } from 'lucide-react'
import { useId } from 'react'
import { createPortal } from 'react-dom'
import { useOverlay } from '@/hooks/useOverlay'
import { cn } from '@/lib/cn'

const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, footer, size = 'md', dismissible = true }) {
  const titleId = useId()
  const panelRef = useOverlay(open, dismissible ? onClose : () => undefined)
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-fade-in bg-overlay"
        onClick={dismissible ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[90dvh] w-full animate-fade-in flex-col bg-bg shadow-overlay sm:rounded-md',
          widths[size],
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-sm font-medium uppercase">
            {title}
          </h2>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-2 rounded-sm p-2 hover:bg-surface-muted"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <footer className="border-t border-line px-5 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
