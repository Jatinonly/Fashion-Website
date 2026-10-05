import { Banknote, CreditCard } from 'lucide-react'
import { cn } from '@/lib/cn'

const METHODS = [
  {
    value: 'razorpay',
    title: 'Pay online',
    body: 'UPI, credit / debit cards, net banking and wallets — secured by Razorpay.',
    Icon: CreditCard,
  },
  {
    value: 'cod',
    title: 'Cash on delivery',
    body: 'Pay in cash or UPI when your order arrives.',
    Icon: Banknote,
  },
]

export function PaymentMethodSelector({ value, onChange }) {
  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Payment method</legend>
      {METHODS.map(({ value: method, title, body, Icon }) => {
        const selected = value === method
        return (
          <label
            key={method}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink',
              selected ? 'border-ink bg-surface-muted' : 'border-line hover:border-ink',
            )}
          >
            <input
              type="radio"
              name="payment-method"
              value={method}
              checked={selected}
              onChange={() => onChange(method)}
              className="mt-1 accent-ink"
            />
            <span className="flex-1">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="size-4" aria-hidden="true" />
                {title}
              </span>
              <span className="mt-1 block text-xs text-muted">{body}</span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
