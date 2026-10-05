import { Heart } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useIsWishlisted, useWishlistStore } from '@/store/wishlistStore'

/** Icon-only heart toggle used on product cards. */
export function WishlistButton({ productId, productName, className }) {
  const active = useIsWishlisted(productId)
  const toggle = useWishlistStore((state) => state.toggle)
  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={active}
      aria-label={active ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
      className={cn(
        'flex size-9 items-center justify-center rounded-full transition-colors hover:bg-bg',
        className,
      )}
    >
      <Heart className={cn('size-4', active && 'fill-ink')} strokeWidth={1.5} aria-hidden="true" />
    </button>
  )
}
