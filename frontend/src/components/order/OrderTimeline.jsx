import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

const STEPS = [
  { status: 'placed', label: 'Order placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
]

export function OrderTimeline({ status }) {
  if (status === 'cancelled') return null
  const currentIndex = STEPS.findIndex((step) => step.status === status)
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Order progress">
      {STEPS.map((step, index) => {
        const done = index <= currentIndex
        return (
          <li key={step.status} className="space-y-2">
            <div className={cn('h-1 rounded-full', done ? 'bg-ink' : 'bg-surface')} />
            <p
              className={cn(
                'flex items-center gap-1 text-2xs uppercase',
                done ? 'text-ink' : 'text-muted',
              )}
            >
              {done && <Check className="size-3" aria-hidden="true" />}
              {step.label}
              <span className="sr-only">{done ? ' (completed)' : ' (pending)'}</span>
            </p>
          </li>
        )
      })}
    </ol>
  )
}
