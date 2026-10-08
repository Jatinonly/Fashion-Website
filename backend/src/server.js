import { app } from './app.js'
import { config } from './config.js'
import { closePool } from './db/pool.js'

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}/api`)
})

function shutdown() {
  server.close(() => closePool().finally(() => process.exit(0)))
}
process.on('SIGINT', shutdown)  //happens pressed Ctrl + C in terminal.
process.on('SIGTERM', shutdown)
