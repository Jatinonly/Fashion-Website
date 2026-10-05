import { CartItemImage } from '@/components/cart/CartItemImage'
import { PriceBreakdown } from '@/components/cart/PriceBreakdown'
import { formatINR } from '@/lib/format'

export function CheckoutOrderSummary({ items, summary }) {
  return (
    <section aria-labelledby="order-summary-title" className="space-y-5">
      <h2 id="order-summary-title" className="label font-medium">
        Order summary
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative">
              <CartItemImage item={item} className="w-14" />
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-ink font-mono text-2xs text-inverse">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs uppercase">{item.name}</p>
              <p className="text-xs text-muted">
                {item.colour.name} · {item.size}
              </p>
            </div>
            <p className="font-mono text-xs">{formatINR(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <PriceBreakdown summary={summary} />
    </section>
  )
}
