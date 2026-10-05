import { app } from './app.js'
import { config } from './config.js'
import { closePool } from './db/pool.js'

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}/api`)
  for (const name of ['DATABASE_URL', 'JWT_SECRET']) {
    if (!process.env[name])
      console.warn(`⚠ ${name} is not set — copy backend/.env.example to backend/.env`)
  }
})

function shutdown() {
  server.close(() => closePool().finally(() => process.exit(0)))
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
