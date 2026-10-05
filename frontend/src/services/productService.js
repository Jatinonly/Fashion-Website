/**
 * Product data access. Components and stores must go through this module —
 * never import `@/data/products` directly.
 *
 * API mode (VITE_API_BASE_URL set) calls backend/src/routes/products.js;
 * otherwise the mock catalogue in `@/data/products` is filtered in the browser.
 */
import { env } from '@/config/env'
import { PRODUCTS } from '@/data/products'
import { isInStock } from '@/lib/product'
import { ApiError, apiRequest, mockDelay, toSearchParams } from './http'

/**
 * @typedef {'women' | 'men' | 'bags' | 'shoes' | 'jewellery'} CategorySlug
 * @typedef {CategorySlug | 'new' | 'sale' | 'all'} CollectionSlug
 * @typedef {'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'} SortOption
 * @typedef {{ name: string, hex: string }} ProductColour
 */

/**
 * @typedef {object} Product
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} description
 * @property {CategorySlug} category
 * @property {string} subcategory
 * @property {number} price Selling price in INR (whole rupees, GST inclusive).
 * @property {number} [compareAtPrice] Original price when discounted.
 * @property {ProductColour[]} colours
 * @property {string[]} sizes
 * @property {Record<string, number>} stock Units in stock keyed by size.
 * @property {number} rating
 * @property {number} reviewCount
 * @property {('new' | 'bestseller' | 'unisex' | 'limited' | 'online-exclusive')[]} tags
 * @property {string} silhouette Drives the placeholder artwork in `lib/images.js`.
 * @property {string} composition
 * @property {string[]} details
 * @property {string} createdAt ISO date, used for "newest" sorting.
 */

/**
 * @typedef {object} ProductQuery
 * @property {CollectionSlug} collection
 * @property {string} [subcategory]
 * @property {string} [search]
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {string[]} [sizes]
 * @property {string[]} [colours]
 * @property {boolean} [inStockOnly]
 * @property {SortOption} [sort]
 * @property {number} [limit] Max items (API mode only; callers still slice).
 */

/**
 * @typedef {{ sizes: string[], colours: ProductColour[], subcategories: string[], priceMin: number, priceMax: number }} ProductFacets
 * @typedef {{ items: Product[], total: number, facets: ProductFacets }} ProductListResult
 */

function inCollection(product, collection) {
  switch (collection) {
    case 'all':
      return true
    case 'new':
      return product.tags.includes('new')
    case 'sale':
      return product.compareAtPrice !== undefined
    default:
      return product.category === collection
  }
}

function matchesSearch(product, term) {
  const haystack = [product.name, product.category, product.subcategory, product.description]
    .join(' ')
    .toLowerCase()
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

function sortProducts(items, sort) {
  const sorted = [...items]
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    default:
      // "Featured": bestsellers first, then newest.
      return sorted.sort(
        (a, b) =>
          Number(b.tags.includes('bestseller')) - Number(a.tags.includes('bestseller')) ||
          b.createdAt.localeCompare(a.createdAt),
      )
  }
}

function buildFacets(items) {
  const sizes = new Set()
  const colours = new Map()
  const subcategories = new Set()
  for (const product of items) {
    product.sizes.forEach((size) => sizes.add(size))
    product.colours.forEach((colour) => colours.set(colour.name, colour))
    subcategories.add(product.subcategory)
  }
  const prices = items.map((product) => product.price)
  return {
    sizes: [...sizes],
    colours: [...colours.values()],
    subcategories: [...subcategories].sort(),
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
  }
}

/**
 * GET /products?collection=&subcategory=&q=&minPrice=&maxPrice=&sizes=&colours=&inStock=&sort=
 * @param {ProductQuery} query
 * @returns {Promise<ProductListResult>}
 */
export async function listProducts(query) {
  if (!env.useMockApi) {
    return apiRequest(
      `/products?${toSearchParams({
        collection: query.collection,
        subcategory: query.subcategory,
        q: query.search,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        sizes: query.sizes,
        colours: query.colours,
        inStock: query.inStockOnly,
        sort: query.sort,
        limit: query.limit,
      })}`,
    )
  }
  await mockDelay()

  const base = PRODUCTS.filter(
    (product) =>
      inCollection(product, query.collection) &&
      (!query.search || matchesSearch(product, query.search)),
  )
  // Facets are computed before attribute filters so options don't disappear when selected.
  const facets = buildFacets(base)

  const filtered = base.filter((product) => {
    if (query.subcategory && product.subcategory !== query.subcategory) return false
    if (query.minPrice !== undefined && product.price < query.minPrice) return false
    if (query.maxPrice !== undefined && product.price > query.maxPrice) return false
    if (query.inStockOnly && !isInStock(product)) return false
    if (query.sizes?.length && !query.sizes.some((size) => (product.stock[size] ?? 0) > 0)) {
      return false
    }
    if (
      query.colours?.length &&
      !product.colours.some((colour) => query.colours?.includes(colour.name))
    ) {
      return false
    }
    return true
  })

  const items = sortProducts(filtered, query.sort)
  return { items, total: items.length, facets }
}

/**
 * GET /products/:slug
 * @param {string} slug
 * @returns {Promise<Product | null>}
 */
export async function getProductBySlug(slug) {
  if (!env.useMockApi) {
    try {
      return await apiRequest(`/products/${encodeURIComponent(slug)}`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  }
  await mockDelay(250)
  return PRODUCTS.find((product) => product.slug === slug) ?? null
}

/**
 * GET /products?ids=a,b,c
 * @param {string[]} ids
 * @returns {Promise<Product[]>}
 */
export async function getProductsByIds(ids) {
  if (!env.useMockApi) {
    return ids.length ? apiRequest(`/products?${toSearchParams({ ids })}`) : []
  }
  await mockDelay(250)
  return ids
    .map((id) => PRODUCTS.find((product) => product.id === id))
    .filter((product) => product !== undefined)
}

/**
 * GET /products/:id/related
 * @param {Product} product
 * @param {number} [limit]
 * @returns {Promise<Product[]>}
 */
export async function getRelatedProducts(product, limit = 8) {
  if (!env.useMockApi) {
    return apiRequest(`/products/${encodeURIComponent(product.id)}/related?limit=${limit}`)
  }
  await mockDelay(300)
  return PRODUCTS.filter((item) => item.id !== product.id)
    .map((item) => ({
      item,
      score:
        (item.category === product.category ? 2 : 0) +
        (item.subcategory === product.subcategory ? 3 : 0) +
        (item.colours.some((c) => product.colours.some((pc) => pc.name === c.name)) ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating)
    .slice(0, limit)
    .map(({ item }) => item)
}

/**
 * GET /products/search?q= — lightweight suggestions for the search overlay.
 * @param {string} term
 * @param {number} [limit]
 * @returns {Promise<Product[]>}
 */
export async function searchProducts(term, limit = 6) {
  if (!term.trim()) return []
  if (!env.useMockApi) return apiRequest(`/products/search?${toSearchParams({ q: term, limit })}`)
  await mockDelay(200)
  return PRODUCTS.filter((product) => matchesSearch(product, term)).slice(0, limit)
}

/**
 * GET /products?collection=new&sort=newest&limit=
 * @param {number} [limit]
 * @returns {Promise<Product[]>}
 */
export async function getNewArrivals(limit = 8) {
  const { items } = await listProducts({ collection: 'all', sort: 'newest', limit })
  return items.slice(0, limit)
}

/**
 * GET /products?collection=&sort=featured&limit=
 * @param {CollectionSlug} collection
 * @param {number} [limit]
 * @returns {Promise<Product[]>}
 */
export async function getFeatured(collection, limit = 4) {
  const { items } = await listProducts({ collection, sort: 'featured', inStockOnly: true, limit })
  return items.slice(0, limit)
}

export const productService = {
  listProducts,
  getProductBySlug,
  getProductsByIds,
  getRelatedProducts,
  searchProducts,
  getNewArrivals,
  getFeatured,
}
