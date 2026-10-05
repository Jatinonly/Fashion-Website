import { Heart } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { Rating } from '@/components/ui/Rating'
import { cn } from '@/lib/cn'
import { discountPercent, formatINR } from '@/lib/format'
import { isInStock } from '@/lib/product'
import { useCartStore } from '@/store/cartStore'
import { useUiStore } from '@/store/uiStore'
import { useIsWishlisted, useWishlistStore } from '@/store/wishlistStore'
import { ColourSelector } from './ColourSelector'
import { ProductBadges } from './ProductBadges'
import { ProductInfoTabs } from './ProductInfoTabs'
import { SizeGuideModal } from './SizeGuideModal'
import { SizeSelector } from './SizeSelector'

export function PurchasePanel({ product, colour, onColourChange }) {
  const oneSize = product.sizes.length === 1
  const [size, setSize] = useState(oneSize ? product.sizes[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [sizeError, setSizeError] = useState()
  const [guideOpen, setGuideOpen] = useState(false)

  const addItem = useCartStore((state) => state.addItem)
  const openCart = useUiStore((state) => state.setCartDrawerOpen)
  const wishlisted = useIsWishlisted(product.id)
  const toggleWishlist = useWishlistStore((state) => state.toggle)

  const available = isInStock(product)
  const maxQuantity = size ? Math.min(product.stock[size] ?? 0, 10) : 10
  const discount = discountPercent(product.price, product.compareAtPrice)

  const handleAdd = () => {
    if (!size) {
      setSizeError('Please select a size')
      return
    }
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        size,
        colour,
        silhouette: product.silhouette,
        maxQuantity: product.stock[size] ?? 0,
      },
      quantity,
    )
    openCart(true)
  }

  return (
    <div className="space-y-6 px-3 py-6 sm:px-4 md:px-0 md:py-0">
      <div>
        <div className="mb-3 flex flex-wrap gap-1">
          <ProductBadges product={product} max={3} />
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl leading-tight font-medium tracking-tight uppercase sm:text-3xl">
            {product.name}
          </h1>
          <div className="shrink-0 text-right">
            <p className={cn('font-mono text-xl sm:text-2xl', discount > 0 && 'text-sale')}>
              {formatINR(product.price)}
            </p>
            {discount > 0 && product.compareAtPrice && (
              <p className="font-mono text-xs text-muted">
                <s>{formatINR(product.compareAtPrice)}</s> −{discount}%
              </p>
            )}
          </div>
        </div>
        <p className="mt-1 text-2xs text-muted">Inclusive of all taxes</p>
        <div className="mt-3">
          <Rating value={product.rating} count={product.reviewCount} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.description}</p>
      </div>

      <ColourSelector colours={product.colours} value={colour} onChange={onColourChange} />

      {!oneSize && (
        <SizeSelector
          sizes={product.sizes}
          stock={product.stock}
          value={size}
          onChange={(next) => {
            setSize(next)
            setSizeError(undefined)
            setQuantity((current) => Math.min(current, product.stock[next] ?? 1))
          }}
          error={sizeError}
          onOpenGuide={
            product.category === 'women' || product.category === 'men'
              ? () => setGuideOpen(true)
              : undefined
          }
        />
      )}

      {available && (
        <div className="flex items-center gap-3">
          <span className="label">Quantity</span>
          <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, maxQuantity)} />
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[2fr_1fr]">
        <Button variant="primary" size="lg" onClick={handleAdd} disabled={!available}>
          {available ? (size || oneSize ? 'Add to bag' : 'Select a size') : 'Sold out'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={wishlisted}
        >
          <Heart
            className={cn('size-4', wishlisted && 'fill-ink')}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">{wishlisted ? 'Saved' : 'Wishlist'}</span>
          <span className="sr-only sm:hidden">
            {wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          </span>
        </Button>
      </div>

      <ProductInfoTabs product={product} />
      <SizeGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  )
}
