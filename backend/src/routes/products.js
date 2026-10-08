/**
 * Product catalogue. Every query is a module-level constant (BASE_FILTER is shared text,
 * spliced in once at load time). Optional filters are passed as parameters and switched
 * off with NULL (`$n IS NULL OR …`), so user input never touches the SQL text.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { HttpError } from '../lib/httpError.js'
import * as v from '../lib/validate.js'

export const productsRouter = Router()

const CATEGORIES = ['women', 'men', 'bags', 'shoes', 'jewellery']
const COLLECTIONS = [...CATEGORIES, 'new', 'sale', 'all']
const SORTS = ['featured', 'newest', 'price-asc', 'price-desc', 'rating']

/** Row → the `Product` shape the frontend uses (see frontend/src/services/productService.js). */
function toProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    subcategory: row.subcategory,
    price: row.price,
    // The frontend checks `compareAtPrice !== undefined`, so omit it rather than sending null.
    ...(row.compare_at_price !== null ? { compareAtPrice: row.compare_at_price } : {}),
    colours: row.colours,
    sizes: row.sizes,
    stock: row.stock,
    rating: row.rating,
    reviewCount: row.review_count,
    tags: row.tags,
    silhouette: row.silhouette,
    composition: row.composition,
    details: row.details,
    createdAt: row.created_at.toISOString(),
  }
}

// Shared WHERE clause for the collection + search "base set".
// $1 collection   $2 search words (text[], LIKE-escaped)
// The :: is PostgreSQL's type-casting syntax.
// BaseFilter ==> (collection conditions) AND (Search condition)
// collections can be new, sale, men, women,....
const BASE_FILTER = `
  (
    $1::text = 'all'
    OR ($1::text = 'new' AND 'new' = ANY (tags))
    OR ($1::text = 'sale' AND compare_at_price IS NOT NULL)
    OR category = $1::text
  )
  AND NOT EXISTS (
    SELECT 1 FROM unnest($2::text[]) AS word
    WHERE lower(name || ' ' || category || ' ' || subcategory || ' ' || description)
      NOT LIKE '%' || word || '%'
  )`

// Facets are filters that help users narrow down products.
const FACETS_SQL = `
  SELECT sizes, colours, subcategory, price FROM products
  WHERE ${BASE_FILTER}
  ORDER BY id`

// $3 subcategory  $4 minPrice  $5 maxPrice  $6 inStockOnly  
// $7 sizes  $8 colours  $9 sort  $10 limit
// LIST_SQL = "Give me the actual product list the user wants to see"
const LIST_SQL = `
  SELECT * FROM products
  WHERE ${BASE_FILTER}
    AND ($3::text IS NULL OR subcategory = $3)
    AND ($4::int IS NULL OR price >= $4)
    AND ($5::int IS NULL OR price <= $5)
    AND (NOT $6::boolean OR EXISTS (
      SELECT 1 FROM jsonb_each_text(stock) AS s WHERE s.value::int > 0))
    AND ($7::text[] IS NULL OR EXISTS (
      SELECT 1 FROM jsonb_each_text(stock) AS s WHERE s.key = ANY ($7) AND s.value::int > 0))
    AND ($8::text[] IS NULL OR EXISTS (
      SELECT 1 FROM jsonb_array_elements(colours) AS c WHERE c ->> 'name' = ANY ($8)))
  ORDER BY
    CASE 
      WHEN $9::text = 'featured' THEN 'bestseller' = ANY (tags)
    END DESC,
    CASE WHEN $9::text = 'price-asc' THEN price END ASC,
    CASE WHEN $9::text = 'price-desc' THEN price END DESC,
    CASE WHEN $9::text = 'rating' THEN rating END DESC,
    created_at DESC,
    id
  LIMIT $10`

const SEARCH_SQL = `SELECT * FROM products WHERE ${BASE_FILTER} ORDER BY id LIMIT $3`

const BY_IDS_SQL = `
  SELECT * FROM products WHERE id = ANY ($1::text[])
  ORDER BY array_position($1::text[], id)`

const RELATED_SQL = `
  SELECT p.* FROM products AS p
  JOIN products AS target ON target.id = $1
  WHERE p.id <> target.id
  ORDER BY
    (p.category = target.category)::int * 2
      + (p.subcategory = target.subcategory)::int * 3
      + (EXISTS (
          SELECT 1 FROM jsonb_array_elements(p.colours) AS a
          JOIN jsonb_array_elements(target.colours) AS b ON a ->> 'name' = b ->> 'name'
        ))::int DESC,
    p.rating DESC,
    p.id
  LIMIT $2`

/** "red  dress" → ['red', 'dress'], lower-cased and with LIKE wildcards escaped. */
function searchWords(term) {
  if (typeof term !== 'string') return []
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 10)
    .map((word) => word.replace(/[\\%_]/g, (char) => `\\${char}`))
}

/** "a,b" → ['a', 'b']; empty → null (filter off). */
function list(value) {
  if (typeof value !== 'string' || value === '') return null
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return items.length ? items : null
}

const optionalInt = (value, label, opts) =>
  value === undefined || value === '' ? null : v.int(value, label, opts)

function buildFacets(rows) {
  const sizes = new Set()
  const colours = new Map()
  const subcategories = new Set()
  for (const row of rows) {
    row.sizes.forEach((size) => sizes.add(size))
    row.colours.forEach((colour) => colours.set(colour.name, colour))
    subcategories.add(row.subcategory)
  }
  const prices = rows.map((row) => row.price)
  return {
    sizes: [...sizes],
    colours: [...colours.values()],
    subcategories: [...subcategories].sort(),
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
  }
}

/**
 * GET /api/products?collection=&subcategory=&q=&minPrice=&maxPrice=&sizes=&colours=&inStock=1&sort=&limit=
 *   → { items, total, facets }
 * GET /api/products?ids=p001,p002 → Product[] (in the given order)
 */
productsRouter.get('/', async (req, res) => {
  const ids = list(req.query.ids)
  if (ids) {
    const { rows } = await query(BY_IDS_SQL, [ids.slice(0, 100)])
    return res.json(rows.map(toProduct))
  }

  const collection = v.oneOf(req.query.collection ?? 'all', 'collection', COLLECTIONS)
  const words = searchWords(req.query.q)
  const sort = v.oneOf(req.query.sort || 'featured', 'sort', SORTS)
  const limit = optionalInt(req.query.limit, 'limit', { min: 1, max: 200 }) ?? 200

  const [facetRows, listRows] = await Promise.all([
    query(FACETS_SQL, [collection, words]),
    query(LIST_SQL, [
      collection,
      words,
      typeof req.query.subcategory === 'string' && req.query.subcategory
        ? req.query.subcategory
        : null,
      optionalInt(req.query.minPrice, 'minPrice'),
      optionalInt(req.query.maxPrice, 'maxPrice'),
      req.query.inStock === '1' || req.query.inStock === 'true',
      list(req.query.sizes),
      list(req.query.colours),
      sort,
      limit,
    ]),
  ])

  const items = listRows.rows.map(toProduct)
  res.json({ items, total: items.length, facets: buildFacets(facetRows.rows) })
})

/** GET /api/products/search?q=&limit= → Product[] (search-overlay suggestions) */
productsRouter.get('/search', async (req, res) => {
  const words = searchWords(req.query.q)
  if (words.length === 0) return res.json([])
  const limit = optionalInt(req.query.limit, 'limit', { min: 1, max: 50 }) ?? 6
  const { rows } = await query(SEARCH_SQL, ['all', words, limit])
  res.json(rows.map(toProduct))
})

/** GET /api/products/:id/related?limit= → Product[] */
productsRouter.get('/:id/related', async (req, res) => {
  const limit = optionalInt(req.query.limit, 'limit', { min: 1, max: 50 }) ?? 8
  const { rows } = await query(RELATED_SQL, [req.params.id, limit])
  res.json(rows.map(toProduct))
})

/** GET /api/products/:slug → Product (404 if missing) */
productsRouter.get('/:slug', async (req, res) => {
  const { rows } = await query('SELECT * FROM products WHERE slug = $1', [req.params.slug])
  if (!rows[0]) throw new HttpError(404, 'Product not found')
  res.json(toProduct(rows[0]))
})
