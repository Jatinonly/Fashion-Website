/** Applies db/schema.sql to DATABASE_URL. Usage: npm run db:migrate */
import { readFile } from 'node:fs/promises'
import { closePool, query } from './pool.js'

const schema = await readFile(new URL('../../db/schema.sql', import.meta.url), 'utf8')

try {
  await query(schema)
  console.log('✓ Schema applied')
} catch (error) {
  console.error('✗ Migration failed:', error.message)
  process.exitCode = 1
} finally {
  await closePool()
}
