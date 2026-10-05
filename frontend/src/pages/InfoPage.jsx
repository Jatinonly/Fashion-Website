import { useLocation } from 'react-router-dom'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { site } from '@/config/site'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function titleFromPath(pathname) {
  const slug = pathname.split('/').filter(Boolean).pop() ?? ''
  return slug.replace(/-/g, ' ').replace(/^\w/, (char) => char.toUpperCase())
}

/** Placeholder for CMS-driven content pages (FAQ, policies, about…). */
export default function InfoPage() {
  const { pathname } = useLocation()
  const title = titleFromPath(pathname)
  useDocumentTitle(title)
  return (
    <>
      <Breadcrumbs items={[{ label: title }]} />
      <div className="max-w-2xl px-3 pt-4 pb-20 sm:px-4">
        <h1 className="text-3xl font-medium tracking-tight uppercase sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          This page will be managed from the CMS. In the meantime, our team is happy to help at{' '}
          <a href={`mailto:${site.supportEmail}`} className="underline underline-offset-4">
            {site.supportEmail}
          </a>{' '}
          or {site.supportPhone}.
        </p>
        <ButtonLink to="/" variant="dark" className="mt-8">
          Back to home
        </ButtonLink>
      </div>
    </>
  )
}
