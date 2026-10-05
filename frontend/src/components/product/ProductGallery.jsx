import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * Desktop: thumbnail rail + stacked large images (like an editorial lookbook).
 * Mobile: horizontal swipe carousel with arrows and dots.
 */
export function ProductGallery({ images }) {
  const [active, setActive] = useState(0)
  const trackRef = useRef(null)
  const stackRefs = useRef([])

  const scrollTo = (index) => {
    const clamped = (index + images.length) % images.length
    const track = trackRef.current
    if (track) track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
    setActive(clamped)
  }

  const onTrackScroll = () => {
    const track = trackRef.current
    if (track) setActive(Math.round(track.scrollLeft / track.clientWidth))
  }

  return (
    <div>
      {/* Mobile carousel */}
      <div className="relative md:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          aria-roledescription="carousel"
          aria-label="Product images"
        >
          {images.map((image, index) => (
            <div
              key={image.src}
              className="aspect-[3/4] w-full shrink-0 snap-center bg-surface"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${images.length}`}
            >
              <img src={image.src} alt={image.alt} className="size-full object-contain p-[6%]" />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollTo(active - 1)}
          aria-label="Previous image"
          className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm bg-bg"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollTo(active + 1)}
          aria-label="Next image"
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm bg-bg"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === active}
              className={cn(
                'h-0.5 w-6 bg-ink transition-opacity',
                index !== active && 'opacity-25',
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop thumbnails + stack */}
      <div className="hidden gap-3 md:grid md:grid-cols-[64px_1fr] lg:grid-cols-[80px_1fr]">
        <ul className="sticky top-28 flex flex-col gap-2 self-start">
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => {
                  setActive(index)
                  stackRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                aria-label={`View image ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  'block aspect-[3/4] w-full bg-surface ring-1 ring-transparent transition',
                  index === active && 'ring-ink',
                )}
              >
                <img src={image.src} alt="" className="size-full object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-1">
          {images.map((image, index) => (
            <li
              key={image.src}
              ref={(node) => {
                stackRefs.current[index] = node
              }}
              className="aspect-[3/4] scroll-mt-28 bg-surface"
            >
              <img src={image.src} alt={image.alt} className="size-full object-contain p-[8%]" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
