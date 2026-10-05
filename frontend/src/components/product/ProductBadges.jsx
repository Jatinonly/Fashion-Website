import { Badge } from '@/components/ui/Badge'
import { discountPercent } from '@/lib/format'
import { isInStock } from '@/lib/product'

const TAG_LABELS = {
  new: 'New',
  bestseller: 'Bestseller',
  unisex: 'Unisex',
  limited: 'Limited',
  'online-exclusive': 'Web exclusive',
}

export function ProductBadges({ product, max = 2 }) {
  const discount = discountPercent(product.price, product.compareAtPrice)
  if (!isInStock(product)) return <Badge variant="dark">Sold out</Badge>
  return (
    <>
      {discount > 0 && <Badge variant="sale">−{discount}%</Badge>}
      {product.tags.slice(0, discount > 0 ? max - 1 : max).map((tag) => (
        <Badge key={tag} variant={tag === 'new' ? 'accent' : 'neutral'}>
          {TAG_LABELS[tag]}
        </Badge>
      ))}
    </>
  )
}
