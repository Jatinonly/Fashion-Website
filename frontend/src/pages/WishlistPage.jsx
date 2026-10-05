import { Heart } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useQuery } from '@/hooks/useQuery'
import { pluralize } from '@/lib/format'
import { productService } from '@/services/productService'
import { useWishlistStore } from '@/store/wishlistStore'

export default function WishlistPage() {
  useDocumentTitle('Wishlist')
  const ids = useWishlistStore((state) => state.productIds)
  const { data: products } = useQuery(
    ids.length ? `wishlist:${ids.join(',')}` : null,
    () => productService.getProductsByIds(ids),
    { keepPreviousData: true },
  )

  return (
    <>
      <Breadcrumbs items={[{ label: 'Wishlist' }]} />
      <h1 className="px-3 pb-6 text-3xl font-medium tracking-tight uppercase sm:px-4 sm:text-5xl">
        Wishlist{' '}
        <span className="font-mono text-xl text-muted sm:text-2xl">
          ({pluralize(ids.length, 'item')})
        </span>
      </h1>
      {ids.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it for later."
          action={
            <ButtonLink to="/shop/new" variant="dark">
              Discover new arrivals
            </ButtonLink>
          }
        />
      ) : !products ? (
        <ProductGridSkeleton count={Math.min(ids.length, 8)} />
      ) : (
        <ProductGrid products={products.filter((product) => ids.includes(product.id))} />
      )}
    </>
  )
}
