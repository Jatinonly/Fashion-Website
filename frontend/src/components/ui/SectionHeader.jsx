import { Link } from 'react-router-dom'

export function SectionHeader({ title, id, link }) {
  return (
    <div className="flex items-end justify-between gap-4 px-3 pt-10 pb-4 sm:px-4 sm:pt-14">
      <h2 id={id} className="font-display text-3xl uppercase sm:text-5xl">
        {title}
      </h2>
      {link && (
        <Link to={link.to} className="shrink-0 label underline underline-offset-4 hover:text-muted">
          {link.label}
        </Link>
      )}
    </div>
  )
}
