import { Link } from 'react-router-dom'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { Price } from '@/components/product/Price'
import { formatINR } from '@/lib/format'
import { productPath } from '@/lib/product'
import { useCartStore } from '@/store/cartStore'
import { CartItemImage } from './CartItemImage'

export function CartLineItem({ item, compact = false, onNavigate }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  return (
    <li className="flex gap-3 py-4 sm:gap-4">
      <Link to={productPath(item)} onClick={onNavigate} tabIndex={-1} aria-hidden="true">
        <CartItemImage item={item} className={compact ? 'w-20' : 'w-24 sm:w-28'} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xs uppercase">
              <Link to={productPath(item)} onClick={onNavigate} className="hover:underline">
                {item.name}
              </Link>
            </h3>
            <p className="mt-1 text-xs text-muted">
              {item.colour.name} · {item.size}
            </p>
          </div>
          <Price
            price={item.price * item.quantity}
            compareAtPrice={item.compareAtPrice ? item.compareAtPrice * item.quantity : undefined}
            className="shrink-0 flex-col items-end text-xs"
          />
        </div>
        {item.quantity > 1 && (
          <p className="mt-1 font-mono text-2xs text-muted">{formatINR(item.price)} each</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={item.maxQuantity}
            onChange={(quantity) => updateQuantity(item.id, quantity)}
            label={`Quantity for ${item.name}`}
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="label text-muted underline underline-offset-4 hover:text-ink"
          >
            Remove<span className="sr-only"> {item.name}</span>
          </button>
        </div>
      </div>
    </li>
  )
}
