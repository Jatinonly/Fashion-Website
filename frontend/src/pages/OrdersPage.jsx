import { Package } from 'lucide-react'
import { useEffect } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { OrderCard } from '@/components/order/OrderCard'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuthStore } from '@/store/authStore'
import { useOrdersStore } from '@/store/ordersStore'

export default function OrdersPage() {
  useDocumentTitle('My orders')
  const user = useAuthStore((state) => state.user)
  const { orders, status, fetchOrders } = useOrdersStore()
  const userOrders = orders.filter((order) => order.userId === user?.id)

  useEffect(() => {
    if (user) void fetchOrders(user.id)
  }, [user, fetchOrders])

  const showSkeleton = status === 'loading' && userOrders.length === 0

  return (
    <>
      <Breadcrumbs items={[{ label: 'My orders' }]} />
      <div className="mx-auto max-w-4xl px-3 pb-16 sm:px-4">
        <h1 className="mb-6 text-3xl font-medium tracking-tight uppercase sm:text-5xl">
          My orders
        </h1>
        {showSkeleton ? (
          <div role="status" aria-label="Loading orders" className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        ) : userOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you place an order it will show up here, with live status updates."
            action={
              <ButtonLink to="/shop/new" variant="dark">
                Start shopping
              </ButtonLink>
            }
          />
        ) : (
          <ul className="border-t border-line">
            {userOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
