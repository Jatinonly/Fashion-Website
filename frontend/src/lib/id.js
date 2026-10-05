export function createId(prefix) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  const time = Date.now().toString(36).slice(-4).toUpperCase()
  return `${prefix}${time}${random}`
}
