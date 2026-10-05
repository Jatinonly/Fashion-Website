import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'

function Row({ label, value, className }) {
  return (
    <div className={cn('flex justify-between gap-4', className)}>
      <dt>{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  )
}

export function PriceBreakdown({ summary }) {
  return (
    <dl className="space-y-2 text-sm">
      <Row label={`Bag total (${summary.itemCount} items)`} value={formatINR(summary.mrpTotal)} />
      {summary.savings > 0 && (
        <Row label="Discount" value={`−${formatINR(summary.savings)}`} className="text-success" />
      )}
      <Row label="Shipping" value={summary.shipping === 0 ? 'Free' : formatINR(summary.shipping)} />
      <Row
        label="Total"
        value={formatINR(summary.total)}
        className="border-t border-line pt-3 text-base font-medium"
      />
      <p className="text-xs text-muted">Prices include GST.</p>
    </dl>
  )
}
