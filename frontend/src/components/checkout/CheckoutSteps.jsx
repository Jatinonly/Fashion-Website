import { cn } from '@/lib/cn'

const STEPS = ['Bag', 'Address', 'Payment']

export function CheckoutSteps({ current }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Checkout progress">
      {STEPS.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo'
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              aria-current={state === 'current' ? 'step' : undefined}
              className={cn(
                'label',
                state === 'todo' ? 'text-muted' : 'text-ink',
                state === 'current' && 'font-semibold',
              )}
            >
              {index + 1}. {step}
            </span>
            {index < STEPS.length - 1 && <span aria-hidden="true" className="h-px w-6 bg-line" />}
          </li>
        )
      })}
    </ol>
  )
}
