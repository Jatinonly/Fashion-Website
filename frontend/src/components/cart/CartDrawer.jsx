import { ShoppingBag } from 'lucide-react'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatINR } from '@/lib/format'
import { computePriceSummary } from '@/lib/pricing'
import { useCartStore } from '@/store/cartStore'
import { useUiStore } from '@/store/uiStore'
import { CartLineItem } from './CartLineItem'
import { FreeShippingProgress } from './FreeShippingProgress'

export function CartDrawer() {
  const open = useUiStore((state) => state.cartDrawerOpen)
  const setOpen = useUiStore((state) => state.setCartDrawerOpen)
  const items = useCartStore((state) => state.items)
  const summary = computePriceSummary(items)
  const close = () => setOpen(false)

  return (
    <Drawer
      open={open}
      onClose={close}
      title={`Bag (${summary.itemCount})`}
      footer={
        items.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span className="font-mono">{formatINR(summary.subtotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink to="/cart" variant="secondary" onClick={close}>
                View bag
              </ButtonLink>
              <ButtonLink to="/checkout" variant="primary" onClick={close}>
                Checkout
              </ButtonLink>
            </div>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Pieces you add will appear here."
          action={
            <ButtonLink to="/shop/new" variant="dark" onClick={close}>
              Shop new arrivals
            </ButtonLink>
          }
        />
      ) : (
        <div className="px-4 pt-4">
          <FreeShippingProgress subtotal={summary.subtotal} />
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <CartLineItem key={item.id} item={item} compact onNavigate={close} />
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  )
}
