import { site } from '@/config/site'
import { formatINR } from '@/lib/format'

export function FreeShippingProgress({ subtotal }) {
  const remaining = site.freeShippingThreshold - subtotal
  const progress = Math.min(100, (subtotal / site.freeShippingThreshold) * 100)
  return (
    <div className="space-y-2">
      <p className="text-xs">
        {remaining > 0 ? (
          <>
            Add <span className="font-mono">{formatINR(remaining)}</span> more for free delivery
          </>
        ) : (
          'You have unlocked free delivery'
        )}
      </p>
      <div
        className="h-1 overflow-hidden rounded-full bg-surface"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Progress towards free delivery"
      >
        <div className="h-full bg-ink transition-[width]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
