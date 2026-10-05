import { useId, useState } from 'react'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'

const TABS = [
  { key: 'details', label: 'Product detail' },
  { key: 'composition', label: 'Composition & care' },
  { key: 'shipping', label: 'Shipping & returns' },
]

export function ProductInfoTabs({ product }) {
  const [tab, setTab] = useState('details')
  const baseId = useId()

  return (
    <div>
      <div role="tablist" aria-label="Product information" className="flex flex-wrap gap-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            id={`${baseId}-tab-${key}`}
            role="tab"
            type="button"
            aria-selected={tab === key}
            aria-controls={`${baseId}-panel-${key}`}
            onClick={() => setTab(key)}
            className={cn(
              'rounded-sm px-2.5 py-1.5 text-xs transition-colors',
              tab === key ? 'bg-surface text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        id={`${baseId}-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${tab}`}
        className="pt-4 text-sm leading-relaxed"
      >
        {tab === 'details' && (
          <ul className="list-disc space-y-1 pl-5">
            {product.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        )}
        {tab === 'composition' && (
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase">{product.composition}</p>
            <p className="text-muted">
              Dry clean or gentle hand wash cold. Do not tumble dry. Iron on low heat, inside out.
            </p>
          </div>
        )}
        {tab === 'shipping' && (
          <div className="space-y-1">
            <p>
              Free delivery on orders above {formatINR(site.freeShippingThreshold)}, otherwise{' '}
              {formatINR(site.shippingFee)}. Delivered in 2–5 working days.
            </p>
            <p>Free exchanges and returns within 14 days. Cash on delivery available.</p>
          </div>
        )}
      </div>
    </div>
  )
}
