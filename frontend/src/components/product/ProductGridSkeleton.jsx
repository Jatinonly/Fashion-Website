import { Skeleton } from '@/components/ui/Skeleton'
import { gridColumns } from './gridColumns'

export function ProductGridSkeleton({ count = 8, columns = 'full' }) {
  return (
    <div role="status" aria-label="Loading products" className={gridColumns[columns]}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-bg">
          <Skeleton className="aspect-[3/4] rounded-none" />
          <div className="space-y-2 px-3 pt-3 pb-6">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
