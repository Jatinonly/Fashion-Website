import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '@/config/site'
import { formatINR } from '@/lib/format'

const OFFERS = [
  { eyebrow: 'End of season', title: 'Up to 50% off', to: '/shop/sale', cta: 'Shop sale' },
  {
    eyebrow: 'Free delivery',
    title: `On orders above ${formatINR(site.freeShippingThreshold)}`,
    to: '/shop/new',
    cta: 'Shop new in',
  },
  {
    eyebrow: 'Pay your way',
    title: 'UPI, cards or cash on delivery',
    to: '/shop/all',
    cta: 'Shop all',
  },
]

export function OffersStrip() {
  return (
    <section aria-label="Offers" className="bg-ink text-inverse">
      <ul className="grid divide-y divide-ink-soft md:grid-cols-3 md:divide-x md:divide-y-0">
        {OFFERS.map((offer) => (
          <li key={offer.title}>
            <Link
              to={offer.to}
              className="group flex items-center justify-between gap-4 p-4 sm:p-5"
            >
              <span>
                <span className="block label text-accent">{offer.eyebrow}</span>
                <span className="mt-1 block text-lg font-medium uppercase sm:text-xl">
                  {offer.title}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 label group-hover:text-accent">
                {offer.cta}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
