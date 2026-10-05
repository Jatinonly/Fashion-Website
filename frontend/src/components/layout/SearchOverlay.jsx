import { Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Price } from '@/components/product/Price'
import { Drawer } from '@/components/ui/Drawer'
import { Spinner } from '@/components/ui/Spinner'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useQuery } from '@/hooks/useQuery'
import { getProductImage } from '@/lib/images'
import { imageRef, productPath } from '@/lib/product'
import { productService } from '@/services/productService'
import { useUiStore } from '@/store/uiStore'

const SUGGESTIONS = ['Dress', 'Denim', 'Leather bag', 'Earrings', 'Sneakers', 'Knitwear']

function SearchPanel({ onClose }) {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const debounced = useDebouncedValue(term.trim(), 250)
  const { data: results, loading } = useQuery(debounced ? `search:${debounced}` : null, () =>
    productService.searchProducts(debounced),
  )

  const submit = (event) => {
    event?.preventDefault()
    if (!term.trim()) return
    onClose()
    navigate(`/search?q=${encodeURIComponent(term.trim())}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-2 pb-8">
      <form role="search" onSubmit={submit} className="flex items-center gap-3 border-b border-ink">
        <Search className="size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <input
          id="site-search"
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search for dresses, bags, jewellery…"
          autoComplete="off"
          className="h-14 flex-1 bg-transparent text-lg outline-none placeholder:text-muted sm:text-2xl"
        />
        {loading && <Spinner />}
      </form>

      {!debounced && (
        <div className="mt-6">
          <p className="mb-3 label text-muted">Popular searches</p>
          <ul className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => setTerm(suggestion)}
                  className="rounded-sm bg-surface-muted px-3 py-1.5 text-xs hover:bg-surface"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {debounced && results && (
        <div className="mt-6" aria-live="polite">
          {results.length === 0 ? (
            <p className="text-sm text-muted">No products match “{debounced}”.</p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {results.map((product) => {
                  const image = getProductImage(imageRef(product))
                  return (
                    <li key={product.id}>
                      <Link to={productPath(product)} onClick={onClose} className="group block">
                        <div className="aspect-[3/4] bg-surface">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="size-full object-contain p-3"
                          />
                        </div>
                        <p className="mt-2 text-2xs uppercase group-hover:underline">
                          {product.name}
                        </p>
                        <Price
                          price={product.price}
                          compareAtPrice={product.compareAtPrice}
                          className="text-2xs"
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <button
                type="button"
                onClick={() => submit()}
                className="mt-6 label underline underline-offset-4"
              >
                See all results for “{debounced}”
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function SearchOverlay() {
  const open = useUiStore((state) => state.searchOpen)
  const setOpen = useUiStore((state) => state.setSearchOpen)
  const close = () => setOpen(false)
  return (
    <Drawer
      open={open}
      onClose={close}
      title="Search"
      side="top"
      hideTitle
      className="overflow-y-auto"
    >
      <SearchPanel onClose={close} />
    </Drawer>
  )
}
