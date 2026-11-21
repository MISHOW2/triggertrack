import * as remote from './remote'
import { KEYS, newId, readJSON, writeJSON } from './storage'

// Feedback is queued on the phone first, so it is never lost when there is no signal.
export function queueFeedback(item) {
  const list = readJSON(KEYS.feedback, [])
  list.push({ id: newId(), createdAt: new Date().toISOString(), sent: false, ...item })
  writeJSON(KEYS.feedback, list)
}

export async function flushFeedback() {
  if (!navigator.onLine) return 0
  const list = readJSON(KEYS.feedback, [])
  let sent = 0
  for (const item of list) {
    if (item.sent) continue
    try {
      await remote.sendFeedback(item)
      item.sent = true
      sent += 1
    } catch {
      break
    }
  }
  if (sent) writeJSON(KEYS.feedback, list.filter((f) => !f.sent || Date.now() - new Date(f.createdAt) < 7 * 864e5))
  return sent
}
