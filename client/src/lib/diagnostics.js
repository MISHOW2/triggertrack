// Keeps the last few app errors (message only, never diary content) so a tester can attach them to feedback.
import { KEYS, readJSON, writeJSON } from '../data/storage'

const MAX = 20

function record(message) {
  const list = readJSON(KEYS.diagnostics, [])
  list.push({ at: new Date().toISOString(), message: String(message).slice(0, 200) })
  writeJSON(KEYS.diagnostics, list.slice(-MAX))
}

export function installDiagnostics() {
  window.addEventListener('error', (e) => record(e.message))
  window.addEventListener('unhandledrejection', (e) => record(e.reason?.message ?? 'Unhandled promise rejection'))
}

// What "Attach recent logs" sends: app version, timings and error messages. Never entries.
export function collectDiagnostics() {
  const nav = performance.getEntriesByType?.('navigation')?.[0]
  return {
    appVersion: __APP_VERSION__,
    online: navigator.onLine,
    userAgent: navigator.userAgent,
    screen: `${window.innerWidth}x${window.innerHeight}`,
    timings: nav ? { domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd), loadMs: Math.round(nav.loadEventEnd) } : null,
    errors: readJSON(KEYS.diagnostics, []),
  }
}
