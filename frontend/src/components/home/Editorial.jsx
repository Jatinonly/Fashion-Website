import { ButtonLink } from '@/components/ui/ButtonLink'
import { site } from '@/config/site'

export function Editorial() {
  return (
    <section aria-labelledby="editorial-title" className="border-t border-line">
      <img
        src="/editorial.png"
        alt="Models wearing the autumn–winter collection"
        loading="lazy"
        className="aspect-[4/3] w-full object-cover sm:aspect-[2/1]"
      />
      <div className="max-w-5xl px-3 py-8 sm:px-4 sm:py-12">
        <h2 id="editorial-title" className="mb-3 label text-muted">
          The after-hours edit
        </h2>
        <p className="text-xl leading-snug font-medium sm:text-3xl">
          {site.name} began with a simple idea: clothes that move from the studio to the night
          without changing. This season we cut second-skin mesh, washed denim and sculpted tailoring
          from deadstock and organic fabrics — made in small runs across Mumbai and Jaipur.
        </p>
        <ButtonLink to="/shop/new" variant="primary" className="mt-6">
          Discover the collection
        </ButtonLink>
      </div>
    </section>
  )
}
