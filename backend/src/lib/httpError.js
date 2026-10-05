/** Throw from a route to send `{ message }` with the given status. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}
