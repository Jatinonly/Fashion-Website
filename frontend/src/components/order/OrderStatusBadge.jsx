import { Badge } from '@/components/ui/Badge'

const STATUS = {
  placed: { label: 'Placed', variant: 'neutral' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  shipped: { label: 'Shipped', variant: 'accent' },
  delivered: { label: 'Delivered', variant: 'dark' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
}

const PAYMENT = {
  pending: { label: 'Payment pending', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
  failed: { label: 'Payment failed', variant: 'danger' },
}

export function OrderStatusBadge({ status }) {
  return <Badge variant={STATUS[status].variant}>{STATUS[status].label}</Badge>
}

export function PaymentStatusBadge({ status }) {
  return <Badge variant={PAYMENT[status].variant}>{PAYMENT[status].label}</Badge>
}
