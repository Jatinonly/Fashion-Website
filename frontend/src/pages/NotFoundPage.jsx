import { ButtonLink } from '@/components/ui/ButtonLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <section className="flex min-h-[60vh] flex-col items-start justify-center px-3 py-16 sm:px-4">
      <p className="text-mega font-medium text-accent [-webkit-text-stroke:1px_var(--color-ink)]">
        404
      </p>
      <h1 className="mt-4 text-2xl font-medium uppercase sm:text-4xl">This page has gone dark</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        The page you're looking for doesn't exist or has moved. Try one of these instead.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <ButtonLink to="/" variant="dark">
          Home
        </ButtonLink>
        <ButtonLink to="/shop/new" variant="primary">
          New arrivals
        </ButtonLink>
        <ButtonLink to="/shop/sale" variant="secondary">
          Sale
        </ButtonLink>
      </div>
    </section>
  )
}
