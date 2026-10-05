import { site } from '@/config/site'

/** Neon marquee strip at the very top of every page. */
export function AnnouncementBar() {
  const items = [...site.announcements, ...site.announcements]
  return (
    <div
      className="overflow-hidden bg-accent text-accent-ink"
      role="region"
      aria-label="Announcements"
    >
      <p className="sr-only">{site.announcements.join('. ')}</p>
      <div aria-hidden="true" className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0">
            {items.map((text, index) => (
              <li
                key={`${copy}-${index}`}
                className="px-6 py-1 font-mono text-2xs whitespace-nowrap uppercase"
              >
                {text} <span className="pl-6">•</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
