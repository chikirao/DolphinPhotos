/** Use the visitor's local calendar, independently of the server/build date. */
export function getExpiryLabel(date?: Date, fallback = 'NEVER'): string {
  try {
    const today = date ?? new Date()
    if (!Number.isFinite(today.getTime())) return `EXPIRES ${fallback}`
    const formatted = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(today)
    return `EXPIRES ${formatted.toUpperCase()}`
  } catch {
    return `EXPIRES ${fallback}`
  }
}

export function nextLocalMidnightDelay(): number {
  try {
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const delay = midnight.getTime() - now.getTime()
    if (Number.isFinite(delay) && delay > 0) return delay + 50
  } catch { /* Retry the clock later if unavailable. */ }
  return 60_000
}
