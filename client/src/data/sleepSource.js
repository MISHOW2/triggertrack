// Where sleep nights can come from. On the web there is no health data source, so only manual entry works.
// In the Android (Capacitor) app, add a Health Connect plugin and return its data from importNights().
// Keep the request to SLEEP only (the app asks for nothing else) and read-only.

export function getSleepSource() {
  const plugin = window.Capacitor?.Plugins?.HealthConnect
  if (plugin) return { available: true, name: 'Health Connect', plugin }
  return { available: false, name: 'Health Connect' }
}

// Resolves to [{ start: ISO, end: ISO }]. Throws if no source is available.
export async function importNights() {
  const source = getSleepSource()
  if (!source.available) throw new Error('unavailable')
  // TODO (Android app): const result = await source.plugin.readSleepSessions({ days: 14 })
  // return result.sessions.map((s) => ({ start: s.startTime, end: s.endTime }))
  return []
}
