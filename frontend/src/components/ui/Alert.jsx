import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/cn'

const styles = {
  info: { className: 'bg-surface-muted text-ink', Icon: Info },
  success: { className: 'bg-success-soft text-success', Icon: CheckCircle2 },
  error: { className: 'bg-danger-soft text-danger', Icon: AlertCircle },
}

export function Alert({ tone = 'info', children, className }) {
  const { className: toneClass, Icon } = styles[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2.5 rounded-sm p-3 text-sm', toneClass, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
