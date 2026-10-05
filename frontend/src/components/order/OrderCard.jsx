import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CartItemImage } from '@/components/cart/CartItemImage'
import { formatDate, formatINR, pluralize } from '@/lib/format'
import { OrderStatusBadge } from './OrderStatusBadge'

export function OrderCard({ order }) {
  const preview = order.items.slice(0, 4)
  return (
    <li>
      <Link
        to={`/orders/${order.id}`}
        className="group grid gap-4 border-b border-line py-5 sm:grid-cols-[1fr_auto] sm:items-center"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-sm">{order.id}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-muted">
            {formatDate(order.createdAt)} · {pluralize(order.summary.itemCount, 'item')} ·{' '}
            {order.payment.method === 'cod' ? 'Cash on delivery' : 'Paid online'}
          </p>
          <div className="flex gap-2">
            {preview.map((item) => (
              <CartItemImage key={item.id} item={item} className="w-12" />
            ))}
            {order.items.length > preview.length && (
              <span className="flex w-12 items-center justify-center bg-surface-muted font-mono text-xs">
                +{order.items.length - preview.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="font-mono text-sm">{formatINR(order.summary.total)}</span>
          <span className="flex items-center gap-1 label group-hover:underline">
            Details <ChevronRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </li>
  )
}
