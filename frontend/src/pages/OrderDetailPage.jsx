import { PackageX } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CartItemImage } from '@/components/cart/CartItemImage'
import { PriceBreakdown } from '@/components/cart/PriceBreakdown'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/order/OrderStatusBadge'
import { OrderTimeline } from '@/components/order/OrderTimeline'
import { Alert } from '@/components/ui/Alert'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useQuery } from '@/hooks/useQuery'
import { formatDate, formatINR } from '@/lib/format'
import { productPath } from '@/lib/product'
import { orderService } from '@/services/orderService'
import { useAuthStore } from '@/store/authStore'
import { useOrdersStore } from '@/store/ordersStore'

export default function OrderDetailPage() {
  const { orderId = '' } = useParams()
  const [params] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const cached = useOrdersStore((state) => state.orders.find((order) => order.id === orderId))
  const {
    data: fetched,
    loading,
    error,
  } = useQuery(user && !cached ? `order:${user.id}:${orderId}` : null, () =>
    orderService.getOrder(user?.id ?? '', orderId),
  )
  const order = cached ?? fetched
  useDocumentTitle(order ? `Order ${order.id}` : 'Order')

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading order"
        className="mx-auto max-w-4xl space-y-4 px-4 py-10"
      >
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!order || error) {
    return (
      <EmptyState
        icon={PackageX}
        title="Order not found"
        description="We couldn't find this order on your account."
        action={
          <ButtonLink to="/orders" variant="dark">
            Back to my orders
          </ButtonLink>
        }
      />
    )
  }

  const { address, payment } = order

  return (
    <>
      <Breadcrumbs items={[{ label: 'My orders', to: '/orders' }, { label: order.id }]} />
      <div className="mx-auto max-w-4xl space-y-8 px-3 pb-16 sm:px-4">
        {params.get('placed') && (
          <Alert tone="success">
            Thank you, {address.fullName.split(' ')[0]}! Your order has been placed. A confirmation
            has been sent to {address.email}.
          </Alert>
        )}

        <header className="space-y-3">
          <h1 className="text-2xl font-medium tracking-tight uppercase sm:text-4xl">
            Order <span className="font-mono">{order.id}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>Placed on {formatDate(order.createdAt)}</span>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={payment.status} />
          </div>
        </header>

        <OrderTimeline status={order.status} />

        <section aria-labelledby="items-title">
          <h2 id="items-title" className="mb-2 label font-medium">
            Items
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <CartItemImage item={item} className="w-16 sm:w-20" />
                <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row">
                  <div>
                    <Link to={productPath(item)} className="text-xs uppercase hover:underline">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {item.colour.name} · {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono text-sm">{formatINR(item.price * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-8 sm:grid-cols-2">
          <section aria-labelledby="delivery-title" className="space-y-4 text-sm">
            <div>
              <h2 id="delivery-title" className="mb-2 label font-medium">
                Delivery address
              </h2>
              <address className="not-italic">
                <p>{address.fullName}</p>
                <p>
                  {address.line1}
                  {address.line2 && `, ${address.line2}`}
                </p>
                <p>
                  {address.city}, {address.state} {address.pincode}
                </p>
                <p className="mt-1 text-muted">{address.phone}</p>
              </address>
            </div>
            <div>
              <h2 className="mb-2 label font-medium">Payment</h2>
              <p>{payment.method === 'cod' ? 'Cash on delivery' : 'Razorpay (online)'}</p>
              {payment.razorpayPaymentId && (
                <p className="font-mono text-xs text-muted">{payment.razorpayPaymentId}</p>
              )}
            </div>
          </section>
          <section aria-label="Price details" className="rounded-sm bg-surface-muted p-5">
            <PriceBreakdown summary={order.summary} />
          </section>
        </div>
      </div>
    </>
  )
}
