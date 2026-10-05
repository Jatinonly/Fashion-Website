import { Link } from 'react-router-dom'
import { site } from '@/config/site'
import { CATEGORIES } from '@/data/categories'
import { bannerImage } from '@/lib/images'

export function CategoryTiles() {
  return (
    <section aria-labelledby="categories-title">
      <h2 id="categories-title" className="sr-only">
        Shop by category
      </h2>
      <ul className="grid grid-cols-2 gap-px border-y border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
        {site.homeCategories.map((slug, index) => {
          const category = CATEGORIES[slug]
          return (
            <li key={slug} className={index === 0 ? 'col-span-2 sm:col-span-1' : undefined}>
              <Link to={`/shop/${slug}`} className="group block bg-bg">
                <div className="aspect-[4/5] overflow-hidden bg-surface">
                  <img
                    src={bannerImage(`category-${slug}`, 600, 750)}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-3">
                  <span className="text-sm font-medium uppercase">{category.label}</span>
                  <span className="label text-muted group-hover:text-ink">Shop →</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
