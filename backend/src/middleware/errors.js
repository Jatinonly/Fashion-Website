import { HttpError } from '../lib/httpError.js'

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'Not found'))
}

// Express recognises error handlers by their 4 arguments.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message })
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' })
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' })
  }
  console.error(error)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
}
