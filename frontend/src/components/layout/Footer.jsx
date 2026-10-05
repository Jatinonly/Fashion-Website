import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'
import { email as emailRule } from '@/lib/validation'

function FooterLink({ to, label }) {
  const external = to.startsWith('http')
  return external ? (
    <a href={to} target="_blank" rel="noreferrer" className="hover:text-muted">
      {label}
    </a>
  ) : (
    <Link to={to} className="hover:text-muted">
      {label}
    </Link>
  )
}

/** Collapsible on mobile, always open from md up. */
function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-line md:border-0">
      <h2 className="label">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center justify-between py-4 uppercase md:pointer-events-none md:py-0 md:pb-2"
        >
          {title}
          <ChevronDown
            className={cn('size-4 transition-transform md:hidden', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </h2>
      <div className={cn('pb-4 md:block md:pb-0', !open && 'hidden')}>{children}</div>
    </div>
  )
}

function Newsletter() {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('idle')
  const submit = (event) => {
    event.preventDefault()
    // TODO(api): POST /newsletter { email }
    setStatus(emailRule(value) ? 'error' : 'done')
  }
  return (
    <form onSubmit={submit} noValidate>
      <p className="mb-3 text-sm text-muted">
        Join the {site.name} circle for early access to drops.
      </p>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex rounded-sm bg-surface-muted">
        <input
          id="newsletter-email"
          type="email"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setStatus('idle')
          }}
          placeholder="E-MAIL"
          aria-invalid={status === 'error' || undefined}
          className="h-16 w-full min-w-0 flex-1 bg-transparent px-3 font-display text-3xl uppercase outline-none placeholder:text-muted sm:text-4xl"
        />
        <button type="submit" className="px-4 label hover:text-muted">
          Subscribe
        </button>
      </div>
      <p aria-live="polite" className="mt-2 text-xs">
        {status === 'error' && <span className="text-danger">Enter a valid email address.</span>}
        {status === 'done' && (
          <span className="text-success">Thank you — you are on the list.</span>
        )}
      </p>
    </form>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line text-sm">
      <ul className="grid grid-cols-1 border-b border-line md:grid-cols-3">
        {site.assurances.map((item) => (
          <li
            key={item.title}
            className="border-b border-line p-4 last:border-b-0 md:border-r md:border-b-0 md:pb-10 md:last:border-r-0"
          >
            <h2 className="mb-2 label">{item.title}</h2>
            <p className="text-muted">{item.body}</p>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="grid grid-cols-1 px-4 md:grid-cols-4 md:gap-4 md:border-r md:border-line md:py-4">
          {site.footerColumns.map((column) => (
            <Collapsible key={column.title} title={column.title}>
              <ul className="space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink {...link} />
                  </li>
                ))}
              </ul>
            </Collapsible>
          ))}
          <Collapsible title="Contact us">
            <ul className="space-y-1">
              <li>
                <a href={`mailto:${site.supportEmail}`} className="hover:text-muted">
                  {site.supportEmail}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.supportPhone.replace(/\s/g, '')}`}
                  className="hover:text-muted"
                >
                  {site.supportPhone}
                </a>
              </li>
            </ul>
            <p className="mt-3 text-muted">{site.supportHours}</p>
          </Collapsible>
        </div>
        <div className="p-4 pb-10">
          <h2 className="mb-2 label">Newsletter</h2>
          <Newsletter />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li className="text-muted">
            © {new Date().getFullYear()} {site.name}
          </li>
          {site.legalLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="hover:text-muted">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="label">{site.locale}</p>
      </div>
    </footer>
  )
}
