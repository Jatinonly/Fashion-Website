import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { query } from '../db/pool.js'
import { HttpError } from '../lib/httpError.js'
import * as v from '../lib/validate.js'
import { requireAuth, signToken } from '../middleware/auth.js'

export const authRouter = Router()

const BCRYPT_ROUNDS = 12
// Compared against when the email doesn't exist, so response time doesn't reveal which emails are registered.
// bcrypt.hashSync() is the synchronous version of bcrypt.hash() because the code needs the hash immediately so it can store it in DUMMY_HASH
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS)

function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    ...(row.phone ? { phone: row.phone } : {}),
    createdAt: row.created_at.toISOString(),
  }
}

const toSession = (row) => ({ user: toUser(row), token: signToken(row.id) })

/** POST /api/auth/signup { name, email, password } → { user, token } */
authRouter.post('/signup', async (req, res) => {
  const name = v.str(req.body?.name, 'Name', { min: 2, max: 120 })
  const email = v.email(req.body?.email)
  const password = v.str(req.body?.password, 'Password', { min: 8, max: 72 }) // bcrypt reads at most 72 bytes

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  try {
    const { rows } = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, phone, created_at',
      [name, email, hash],
    )
    res.status(201).json(toSession(rows[0]))
  } catch (error) {
    if (error.code === '23505')
      throw new HttpError(409, 'An account with this email already exists')
    throw error
  }
})

/** POST /api/auth/login { email, password } → { user, token } */
authRouter.post('/login', async (req, res) => {
  const email = v.email(req.body?.email)
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  const { rows } = await query(
    'SELECT id, name, email, phone, created_at, password_hash FROM users WHERE lower(email) = lower($1)',
    [email],
  )
  const row = rows[0]
  const valid = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH)
  if (!row || !valid) throw new HttpError(401, 'Incorrect email or password')
  res.json(toSession(row))
})

/** GET /api/auth/me → { user } */
authRouter.get('/me', requireAuth, async (req, res) => {
  const { rows } = await query(
    'SELECT id, name, email, phone, created_at FROM users WHERE id = $1',
    [req.userId],
  )
  if (!rows[0]) throw new HttpError(401, 'Your session has expired. Please log in again.')
  res.json({ user: toUser(rows[0]) })
})

/** POST /api/auth/logout — extra route for cookie */
authRouter.post('/logout', (_req, res) => {
  res.status(204).end()
})
