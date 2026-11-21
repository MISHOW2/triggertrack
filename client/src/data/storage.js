// Small settings and collections live in localStorage (this file only).
// Diary entries live in IndexedDB (see db.js and hooks/useEntries.js).

export const KEYS = {
  entries: 'triggertrack:entries:v1', // legacy: read once to migrate into IndexedDB
  auth: 'triggertrack:auth:v1',
  timer: 'triggertrack:timer:v1',
  theme: 'triggertrack:theme',
  videoFollows: 'triggertrack:video-follows:v1',
  videoSaved: 'triggertrack:video-saved:v1',
  consent: 'triggertrack:consent:v1',
  lastSynced: 'triggertrack:last-synced:v1',
  onboarded: 'triggertrack:onboarded:v1',
  meds: 'triggertrack:meds:v1',
  medLogs: 'triggertrack:med-logs:v1',
  reminders: 'triggertrack:reminders:v1',
  remindersDone: 'triggertrack:reminders-done:v1',
  questionnaire: 'triggertrack:questionnaire:v1',
  sleepNights: 'triggertrack:sleep-nights:v1',
  sleepPrefs: 'triggertrack:sleep-prefs:v1',
  feedback: 'triggertrack:feedback:v1',
  diagnostics: 'triggertrack:diagnostics:v1',
  reportRange: 'triggertrack:report-options:v1',
}

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('tt:ls', { detail: key }))
  } catch {
    // Storage full or blocked (private mode). The app keeps working for this session.
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key)
    window.dispatchEvent(new CustomEvent('tt:ls', { detail: key }))
  } catch {
    // ignore
  }
}

export function isCloudEnabled() {
  return readJSON(KEYS.consent, null)?.decision === 'granted'
}

export function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Everything the person has logged, as one object (used by export and the data screen)
export function collectExport(entries) {
  return {
    app: 'TriggerTrack',
    exportVersion: 2,
    exportedAt: new Date().toISOString(),
    entries: entries.map(({ syncState, deletedAt, ...rest }) => rest),
    medications: readJSON(KEYS.meds, []),
    medicationLogs: readJSON(KEYS.medLogs, []),
    questionnaire: readJSON(KEYS.questionnaire, []),
    sleepNights: readJSON(KEYS.sleepNights, []),
    videoFollows: readJSON(KEYS.videoFollows, []),
    videoSaved: readJSON(KEYS.videoSaved, []),
  }
}

// Download everything as a JSON file
export function exportEntries(entries) {
  const blob = new Blob([JSON.stringify(collectExport(entries), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `triggertrack-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Sample data so you can try the app (and Insights) before you have real logs.
// Every sample entry has sample: true so it can be removed again in Settings.
export function makeSampleEntries(days = 14) {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const pick = (arr) => arr[Math.floor(rand() * arr.length)]

  const mealOptions = [
    ['Oats with banana', []],
    ['Toast and eggs', []],
    ['Coffee and rusk', ['Coffee']],
    ['Smoothie bowl', ['Tomato']],
    ['Fish tacos', ['Carbonated']],
    ['Chicken curry', ['Spicy food']],
    ['Burger and chips', ['Fried food']],
    ['Pasta with tomato sauce', ['Tomato']],
    ['Yoghurt and fruit', ['Dairy', 'Citrus']],
    ['Chocolate dessert', ['Chocolate']],
    ['Grilled chicken salad', []],
  ]
  const wakeSymptoms = ['Throat clearing', 'Hoarseness', 'Cough', 'Burning', 'Bad taste']
  const symptomTypes = ['Regurgitation', 'Heartburn', 'Throat clearing', 'Burning', 'Cough']

  const entries = []
  const now = new Date()

  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(now)
    day.setDate(now.getDate() - d)
    const at = (h, m) => {
      const t = new Date(day)
      t.setHours(h, m, 0, 0)
      return t
    }
    const isFuture = (t) => t.getTime() > now.getTime()

    // wake-up
    const wake = at(6 + Math.floor(rand() * 3), Math.floor(rand() * 60))
    if (!isFuture(wake)) {
      const sev = Math.floor(rand() * 5) // 0-4
      entries.push({
        id: newId(),
        sample: true,
        type: 'wake',
        timestamp: wake.toISOString(),
        severity: sev,
        symptoms: sev === 0 ? [] : [pick(wakeSymptoms), pick(wakeSymptoms)].filter((v, i, a) => a.indexOf(v) === i),
        notes: '',
      })
    }

    // 3 meals
    const mealTimes = [at(7, 20 + Math.floor(rand() * 40)), at(12, Math.floor(rand() * 50)), at(18, 10 + Math.floor(rand() * 50))]
    mealTimes.forEach((t) => {
      if (isFuture(t)) return
      const [name, tags] = pick(mealOptions)
      entries.push({ id: newId(), sample: true, type: 'meal', timestamp: t.toISOString(), name, tags, notes: '' })
    })

    // occasional late-night meal followed by a flare-up
    if (rand() < 0.3) {
      const late = at(21, 15 + Math.floor(rand() * 30))
      if (!isFuture(late)) {
        entries.push({
          id: newId(),
          sample: true,
          type: 'meal',
          timestamp: late.toISOString(),
          name: 'Late snack',
          tags: ['Late-night meal'],
          notes: '',
        })
        const start = new Date(late.getTime() + (45 + Math.floor(rand() * 60)) * 60000)
        if (!isFuture(start)) {
          entries.push({
            id: newId(),
            sample: true,
            type: 'symptom',
            timestamp: start.toISOString(),
            durationMin: 30 + Math.floor(rand() * 60),
            severity: 3 + Math.floor(rand() * 3),
            symptomType: pick(symptomTypes),
            notes: '',
          })
        }
      }
    }
  }
  return entries
}
