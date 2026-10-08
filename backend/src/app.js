import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { query } from './db/pool.js'
import { errorHandler, notFound } from './middleware/errors.js'
import { authRouter } from './routes/auth.js'
import { ordersRouter } from './routes/orders.js'
import { paymentsRouter } from './routes/payments.js'
import { productsRouter } from './routes/products.js'

export const app = express()

app.disable('x-powered-by')  // Disables the X-Powered-By: Express HTTP response header.
if (config.corsOrigins.length) app.use(cors({ origin: config.corsOrigins }))
app.use(
  '/api/payments/razorpay/webhook',
  express.raw({ type: 'application/json', limit: '100kb' }),
)
app.use(express.json({ limit: '100kb' }))

/** GET /api/health — also checks the database connection. */
app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1')
    res.json({ ok: true, database: 'connected' })
  } catch (error) {
    res.status(503).json({ ok: false, database: 'unreachable', message: error.message })
  }
})

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/payments', paymentsRouter)

app.use(notFound)
app.use(errorHandler)
