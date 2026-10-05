import { cn } from '@/lib/cn'
import { getProductImage } from '@/lib/images'

export function CartItemImage({ item, className }) {
  const image = getProductImage({
    id: item.productId,
    name: item.name,
    silhouette: item.silhouette,
    colourHex: item.colour.hex,
  })
  return (
    <div className={cn('aspect-[3/4] shrink-0 bg-surface', className)}>
      <img src={image.src} alt={image.alt} className="size-full object-contain p-1.5" />
    </div>
  )
}
