/** Reads and validates environment variables once at startup. */
/* So instead of doing this everywhere:
    process.env.DATABASE_URL
    process.env.JWT_SECRET
    process.env.PORT

  your application can do:
    config.db.url
    config.jwt.secret
    config.port
*/

import { HttpError } from './lib/httpError.js'

function required(name) {
  const value = process.env[name]
  if (!value) {
    throw new HttpError(
      503,
      `Missing env var ${name}.`,
    )
  }
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    get url() {
      return required('DATABASE_URL')
    },
    ssl: process.env.DATABASE_SSL ?? 'require',
  },
  jwt: {
    get secret() {
      return required('JWT_SECRET')
    },
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  shipping: {
    freeThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD ?? 2999),
    fee: Number(process.env.SHIPPING_FEE ?? 99),
  },
}
