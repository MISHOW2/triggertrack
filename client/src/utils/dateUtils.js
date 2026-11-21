// Date helpers. Timestamps are stored as ISO strings (UTC) and shown in local time.

const pad = (n) => String(n).padStart(2, '0')

// Date -> value for <input type="datetime-local"> (local time, no timezone)
export function toLocalInput(date = new Date()) {
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// <input type="datetime-local"> value -> ISO string
export function fromLocalInput(value) {
  return new Date(value).toISOString()
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatDuration(totalMinutes) {
  const m = Math.max(0, Math.round(totalMinutes))
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest === 0 ? `${h} hr` : `${h} hr ${rest} min`
}

// Running timer display, e.g. 00:07:32
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

// "Today", "Yesterday", or "Mon, 17 Nov"
export function dayLabel(iso) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (isSameDay(d, today)) return 'Today'
  if (isSameDay(d, yesterday)) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
}

export function minutesOfDay(iso) {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

// <input type="date"> value (YYYY-MM-DD) for a Date
export function toDateInput(date = new Date()) {
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
