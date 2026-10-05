import { ShieldCheck, ShoppingBag } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CartLineItem } from '@/components/cart/CartLineItem'
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress'
import { PriceBreakdown } from '@/components/cart/PriceBreakdown'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { computePriceSummary } from '@/lib/pricing'
import { useCartStore } from '@/store/cartStore'

export default function CartPage() {
  useDocumentTitle('Bag')
  const items = useCartStore((state) => state.items)
  const clear = useCartStore((state) => state.clear)
  const summary = computePriceSummary(items)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your bag is empty"
        description="Looks like you haven't added anything yet. Start with this season's new arrivals."
        action={
          <ButtonLink to="/shop/new" variant="dark">
            Shop new arrivals
          </ButtonLink>
        }
      />
    )
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Bag' }]} />
      <div className="px-3 pb-16 sm:px-4">
        <h1 className="mb-6 text-3xl font-medium tracking-tight uppercase sm:text-5xl">
          Bag{' '}
          <span className="font-mono text-xl text-muted sm:text-2xl">({summary.itemCount})</span>
        </h1>
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <section aria-label="Items in your bag">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <p className="label text-muted">Item</p>
              <button
                type="button"
                onClick={clear}
                className="label text-muted underline underline-offset-4 hover:text-ink"
              >
                Remove all
              </button>
            </div>
            <ul className="divide-y divide-line border-b border-line">
              {items.map((item) => (
                <CartLineItem key={item.id} item={item} />
              ))}
            </ul>
          </section>

          <aside aria-label="Price summary" className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-5 rounded-sm bg-surface-muted p-5">
              <h2 className="label font-medium">Summary</h2>
              <FreeShippingProgress subtotal={summary.subtotal} />
              <PriceBreakdown summary={summary} />
              <ButtonLink to="/checkout" variant="primary" size="lg" fullWidth>
                Checkout
              </ButtonLink>
              <ButtonLink to="/shop/all" variant="link" className="w-full justify-center">
                Continue shopping
              </ButtonLink>
              <p className="flex items-center gap-2 text-xs text-muted">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Secure payments via Razorpay · Cash on delivery available
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
