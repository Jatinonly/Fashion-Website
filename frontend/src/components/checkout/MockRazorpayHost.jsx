import { CreditCard, Landmark, Lock, Smartphone, Wallet } from 'lucide-react'
import { useState, useSyncExternalStore } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { site } from '@/config/site'
import { formatINR } from '@/lib/format'
import { mockRazorpay } from '@/services/mockRazorpay'
import { cn } from '@/lib/cn'

const METHODS = [
  { key: 'upi', label: 'UPI', Icon: Smartphone },
  { key: 'card', label: 'Card', Icon: CreditCard },
  { key: 'netbanking', label: 'Netbanking', Icon: Landmark },
  { key: 'wallet', label: 'Wallet', Icon: Wallet },
]

/**
 * MOCK ONLY — stands in for the Razorpay Checkout popup while there is no backend.
 * Rendered once at the app root. Remove together with `services/mockRazorpay.js`.
 */
export function MockRazorpayHost() {
  const request = useSyncExternalStore(mockRazorpay.subscribe, mockRazorpay.getCurrent)
  const [method, setMethod] = useState('upi')
  const [processing, setProcessing] = useState(false)

  if (!request) return null
  const { options, resolve } = request

  const finish = (outcome) => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      if (outcome === 'success') {
        const paymentId = `pay_mock_${Math.random().toString(36).slice(2, 12)}`
        resolve({
          status: 'success',
          payload: {
            razorpay_order_id: options.order.id,
            razorpay_payment_id: paymentId,
            razorpay_signature: `mock_sig_${paymentId}`,
          },
        })
      } else {
        resolve({ status: 'failed', reason: 'Payment declined by the bank (simulated).' })
      }
    }, 900)
  }

  return (
    <Modal
      open
      onClose={() => resolve({ status: 'dismissed' })}
      title={`${site.name} · Razorpay`}
      size="sm"
      dismissible={!processing}
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label text-muted">Amount payable</p>
            <p className="font-mono text-2xl">{formatINR(options.order.amount / 100)}</p>
            <p className="mt-1 font-mono text-2xs text-muted">{options.order.id}</p>
          </div>
          <Badge variant="warning">Test mode</Badge>
        </div>

        {options.prefill.contact && (
          <p className="text-xs text-muted">
            {options.prefill.contact} · {options.prefill.email}
          </p>
        )}

        <div role="radiogroup" aria-label="Payment option" className="grid grid-cols-2 gap-2">
          {METHODS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={method === key}
              onClick={() => setMethod(key)}
              className={cn(
                'flex items-center gap-2 rounded-sm border p-3 text-xs',
                method === key ? 'border-ink bg-surface-muted' : 'border-line hover:border-ink',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <p className="rounded-sm bg-surface-muted p-3 text-xs text-ink-soft">
          This is a simulated checkout. No real money moves. Choose an outcome below to test both
          flows.
        </p>

        <div className="grid gap-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={processing}
            onClick={() => finish('success')}
          >
            Simulate successful payment
          </Button>
          <Button
            variant="outline"
            fullWidth
            disabled={processing}
            onClick={() => finish('failed')}
          >
            Simulate failed payment
          </Button>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-2xs text-muted">
          <Lock className="size-3" aria-hidden="true" /> Secured by Razorpay (mock)
        </p>
      </div>
    </Modal>
  )
}
