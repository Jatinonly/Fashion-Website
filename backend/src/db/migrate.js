/** migrate.js reads your schema.sql file containing the database structure.
It sends that SQL to PostgreSQL/Supabase, which creates or updates the tables, indexes, etc.
You run it when setting up the database or when the schema changes.
It is not needed for normal queries while your website is running.
Usage: npm run db:migrate */

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
