import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { ProductCard } from './ProductCard'

export function ProductCarousel({ title, products }) {
  const trackRef = useRef(null)
  const scrollBy = (direction) => {
    const track = trackRef.current
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section aria-label={title} className="border-t border-line">
      <div className="flex items-end justify-between gap-4 px-3 pt-8 pb-4 sm:px-4">
        <h2 className="font-display text-3xl uppercase sm:text-5xl">{title}</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="flex size-8 items-center justify-center rounded-sm bg-surface-muted hover:bg-surface"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="flex size-8 items-center justify-center rounded-sm bg-surface-muted hover:bg-surface"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-px overflow-x-auto border-y border-line bg-line"
      >
        {products.map((product) => (
          <li key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[22%]">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
