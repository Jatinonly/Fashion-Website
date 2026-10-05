/** Only allows same-origin relative paths, to avoid open redirects. */
export function safeRedirect(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}
