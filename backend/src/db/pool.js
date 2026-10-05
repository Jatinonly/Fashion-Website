/**
 * The single Postgres connection pool. All database access goes through `query`
 * or `withTransaction` — raw SQL with $1, $2 … placeholders and a values array.
 * Never interpolate user input into the SQL text.
 */
import { readFileSync } from 'node:fs'
import pg from 'pg'
import { config } from '../config.js'
import { HttpError } from '../lib/httpError.js'

// Return BIGINT/NUMERIC as JS numbers (prices are whole rupees, ratings have one decimal).
//"When PostgreSQL gives me an INT8 value, convert it to a JavaScript Number."
pg.types.setTypeParser(pg.types.builtins.INT8, Number)
//"When PostgreSQL gives me an NUMERIC value, convert it to a JavaScript Number."
pg.types.setTypeParser(pg.types.builtins.NUMERIC, Number)

// Without SSL:
// Node.js  ──────plain connection─────> PostgreSQL      

// With SSL(Secure Sockets Layer):
// Node.js  ═════encrypted connection═════> PostgreSQL     
function sslOptions() {
  if (config.db.ssl === 'disable') return false

  //CA certificate = a trusted certificate used to verify the database server.
  if (config.db.caCertPath) return { ca: readFileSync(config.db.caCertPath, 'utf8') }
  return { rejectUnauthorized: false }
}

let pool = null

/** Created on first use, so the server can boot (and say what's missing) before .env is filled in. */
export function getPool() {
  if (pool) return pool
  if (!process.env.DATABASE_URL) {
    throw new HttpError(503, 'Database not configured: set DATABASE_URL in backend/.env')
  }
  pool = new pg.Pool({
    connectionString: config.db.url,
    ssl: sslOptions(),
    max: 10, //maximum number of database connections in the pool.
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  })
  pool.on('error', (error) => console.error('Postgres pool error:', error.message))
  return pool
}

export async function closePool() {
  if (pool) await pool.end()
  pool = null
}

/**
 * @param {string} text SQL with $n placeholders. Must be a constant string.
 * @param {unknown[]} [values]
 */
export function query(text, values = []) {
  return getPool().query(text, values)
}

/**
 * Runs `fn(client)` inside BEGIN/COMMIT, rolling back on any error.
 * @template T
 * @param {(client: pg.PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withTransaction(fn) {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
