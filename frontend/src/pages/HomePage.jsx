import { CategoryTiles } from '@/components/home/CategoryTiles'
import { Editorial } from '@/components/home/Editorial'
import { OffersStrip } from '@/components/home/OffersStrip'
import { CategoryBanner } from '@/components/product/CategoryBanner'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { site } from '@/config/site'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useQuery } from '@/hooks/useQuery'
import { productService } from '@/services/productService'

async function fetchHomeData() {
  const [newArrivals, bags, jewellery] = await Promise.all([
    productService.getNewArrivals(8),
    productService.getFeatured('bags', 2),
    productService.getFeatured('jewellery', 2),
  ])
  return { newArrivals, accessories: [...bags, ...jewellery] }
}

export default function HomePage() {
  useDocumentTitle()
  const { data, loading } = useQuery('home', fetchHomeData)

  return (
    <>
      <h1 className="sr-only">
        {site.name} — {site.tagline}
      </h1>
      <div className="grid md:grid-cols-2">
        <CategoryBanner
          title="Women"
          subtitle="Autumn–winter 2026"
          image="/women.png"
          to="/shop/women"
          className="md:aspect-[4/5]"
        />
        <CategoryBanner
          title="Men"
          subtitle="Autumn–winter 2026"
          image="/men.png"
          to="/shop/men"
          className="md:aspect-[4/5]"
          imageClassName="object-[center_43%]"
        />
      </div>

      <OffersStrip />

      <section aria-labelledby="new-arrivals-title">
        <SectionHeader
          id="new-arrivals-title"
          title="New arrivals"
          link={{ to: '/shop/new', label: 'View all' }}
        />
        {loading || !data ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <ProductGrid products={data.newArrivals} />
        )}
      </section>

      <SectionHeader title="Shop by category" />
      <CategoryTiles />

      <div className="mt-10 grid sm:mt-14 md:grid-cols-2">
        <CategoryBanner title="Bags" image="/model_bag.png" to="/shop/bags" />
        <CategoryBanner title="Jewellery" image="/model_jewellery.png" to="/shop/jewellery" />
      </div>
      {loading || !data ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <ProductGrid products={data.accessories} className="border-t-0" />
      )}

      <Editorial />
    </>
  )
}
