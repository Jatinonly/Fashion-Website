/** Reads and validates environment variables once at startup. */
import { HttpError } from './lib/httpError.js'

function required(name) {
  const value = process.env[name]
  if (!value) {
    throw new HttpError(
      503,
      `Missing env var ${name}. Copy backend/.env.example to backend/.env and fill it in.`,
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
    caCertPath: process.env.DATABASE_CA_CERT ?? '',
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
