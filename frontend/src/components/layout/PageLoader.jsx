import { Spinner } from '@/components/ui/Spinner'

/** Suspense fallback for lazy-loaded routes. */
export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="size-6" label="Loading page" />
    </div>
  )
}
