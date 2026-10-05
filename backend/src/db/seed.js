/**
 * Loads the demo catalogue (frontend/src/data/products.js) and a demo user into the database.
 * Re-running updates existing rows instead of duplicating them. Usage: npm run db:seed
 */
import bcrypt from 'bcryptjs'
import { PRODUCTS } from '../../../frontend/src/data/products.js'
import { closePool, withTransaction } from './pool.js'

const DEMO_USER = {
  name: 'Aanya Sharma',
  email: 'demo@nocturne.in',
  password: 'password123',
  phone: '9876543210',
}

const UPSERT_PRODUCT = `
  INSERT INTO products (
    id, slug, name, description, category, subcategory, price, compare_at_price, colours,
    sizes, stock, rating, review_count, tags, silhouette, composition, details, created_at
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
  ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug, name = EXCLUDED.name, description = EXCLUDED.description,
    category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price, colours = EXCLUDED.colours, sizes = EXCLUDED.sizes,
    stock = EXCLUDED.stock, rating = EXCLUDED.rating, review_count = EXCLUDED.review_count,
    tags = EXCLUDED.tags, silhouette = EXCLUDED.silhouette, composition = EXCLUDED.composition,
    details = EXCLUDED.details, created_at = EXCLUDED.created_at`

const UPSERT_USER = `
  INSERT INTO users (name, email, password_hash, phone)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (lower(email)) DO NOTHING`

try {
  await withTransaction(async (client) => {
    for (const p of PRODUCTS) {
      await client.query(UPSERT_PRODUCT, [
        p.id,
        p.slug,
        p.name,
        p.description,
        p.category,
        p.subcategory,
        p.price,
        p.compareAtPrice ?? null,
        JSON.stringify(p.colours),
        p.sizes,
        JSON.stringify(p.stock),
        p.rating,
        p.reviewCount,
        p.tags,
        p.silhouette,
        p.composition,
        p.details,
        p.createdAt,
      ])
    }
    const hash = await bcrypt.hash(DEMO_USER.password, 12)
    await client.query(UPSERT_USER, [DEMO_USER.name, DEMO_USER.email, hash, DEMO_USER.phone])
  })
  console.log(`✓ Seeded ${PRODUCTS.length} products and demo user ${DEMO_USER.email}`)
} catch (error) {
  console.error('✗ Seed failed:', error.message)
  process.exitCode = 1
} finally {
  await closePool()
}
