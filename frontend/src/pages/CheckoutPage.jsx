import { Pencil, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddressForm } from '@/components/checkout/AddressForm'
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatINR, pluralize } from '@/lib/format'
import { createId } from '@/lib/id'
import { computePriceSummary } from '@/lib/pricing'
import { orderService } from '@/services/orderService'
import { paymentService } from '@/services/paymentService'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useOrdersStore } from '@/store/ordersStore'

const emptyAddress = {
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
}

function AddressSummary({ address, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-sm border border-line p-4 text-sm">
      <address className="not-italic">
        <p className="font-medium">{address.fullName}</p>
        <p>
          {address.line1}
          {address.line2 && `, ${address.line2}`}
        </p>
        <p>
          {address.city}, {address.state} {address.pincode}
        </p>
        <p className="mt-1 text-muted">
          {address.phone} · {address.email}
        </p>
      </address>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Pencil className="size-3.5" aria-hidden="true" /> Edit
      </Button>
    </div>
  )
}

export default function CheckoutPage() {
  useDocumentTitle('Checkout')
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clear)
  const addOrder = useOrdersStore((state) => state.addOrder)
  const summary = computePriceSummary(items)

  const [step, setStep] = useState('address')
  const [address, setAddress] = useState({
    ...emptyAddress,
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })
  const [method, setMethod] = useState('razorpay')
  const [placing, setPlacing] = useState(false)
  const [feedback, setFeedback] = useState(null)

  if (!user) return null

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing to check out"
        description="Your bag is empty. Add a few pieces first."
        action={
          <ButtonLink to="/shop/new" variant="dark">
            Shop new arrivals
          </ButtonLink>
        }
      />
    )
  }

  const placeOrder = async () => {
    setPlacing(true)
    setFeedback(null)
    try {
      let payment
      if (method === 'razorpay') {
        const result = await paymentService.payWithRazorpay({
          amount: summary.total,
          receipt: createId('rcpt_'),
          prefill: { name: address.fullName, email: address.email, contact: address.phone },
          description: pluralize(summary.itemCount, 'item'),
        })
        if (result.status === 'dismissed') {
          setFeedback({
            tone: 'info',
            message: 'Payment was cancelled. Your bag is saved — you can try again.',
          })
          return
        }
        if (result.status === 'failed') {
          setFeedback({
            tone: 'error',
            message: `Payment failed: ${result.reason} No money was deducted. Please retry or choose cash on delivery.`,
          })
          return
        }
        payment = {
          method: 'razorpay',
          status: 'paid',
          razorpayOrderId: result.payload.razorpay_order_id,
          razorpayPaymentId: result.payload.razorpay_payment_id,
        }
      } else {
        payment = { method: 'cod', status: 'pending' }
      }

      const order = await orderService.createOrder({
        userId: user.id,
        items,
        address,
        summary,
        payment,
      })
      addOrder(order)
      navigate(`/orders/${order.id}?placed=1`, { replace: true })
      clearCart()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Could not place your order. Please try again.',
      })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="px-3 pt-6 pb-16 sm:px-4">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-3xl font-medium tracking-tight uppercase sm:text-5xl">Checkout</h1>
        <CheckoutSteps current={step === 'address' ? 1 : 2} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section aria-labelledby="address-title">
            <h2 id="address-title" className="mb-4 label font-medium">
              1. Delivery address
            </h2>
            {step === 'address' ? (
              <AddressForm
                initialValues={address}
                onSubmit={(next) => {
                  setAddress(next)
                  setStep('payment')
                }}
                submitSlot={
                  <Button type="submit" variant="dark" size="lg" className="w-full sm:w-auto">
                    Continue to payment
                  </Button>
                }
              />
            ) : (
              <AddressSummary address={address} onEdit={() => setStep('address')} />
            )}
          </section>

          <section
            aria-labelledby="payment-title"
            className={step === 'address' ? 'opacity-40' : undefined}
          >
            <h2 id="payment-title" className="mb-4 label font-medium">
              2. Payment
            </h2>
            {step === 'payment' && (
              <div className="space-y-4">
                <PaymentMethodSelector value={method} onChange={setMethod} />
                {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={placing}
                  onClick={placeOrder}
                >
                  {method === 'razorpay'
                    ? `Pay ${formatINR(summary.total)}`
                    : `Place order · ${formatINR(summary.total)}`}
                </Button>
                <p className="text-xs text-muted">
                  By placing your order you agree to our terms of sale and privacy policy.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-sm bg-surface-muted p-5">
            <CheckoutOrderSummary items={items} summary={summary} />
          </div>
        </aside>
      </div>
    </div>
  )
}
