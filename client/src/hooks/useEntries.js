import { useCallback, useEffect, useRef, useState } from 'react'
import { db, notifyStorageChanged } from '../data/db'
import { KEYS, newId, readJSON, removeKey } from '../data/storage'

const sortNewestFirst = (list) => [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
const live = (rows) => rows.filter((e) => !e.deletedAt)
const stamp = (entry) => ({
  ...entry,
  updatedAt: new Date().toISOString(),
})

// All logged entries (meals, wake-ups, bedtimes, symptom episodes) plus add / update / delete.
// Entries are kept newest-first. The screen state updates at once; IndexedDB is written right behind it.
export default function useEntries() {
  const [entries, setEntriesState] = useState([])
  const [ready, setReady] = useState(false)
  const ref = useRef([])
  const recentAdds = useRef(new Map())

  const setEntries = useCallback((list) => {
    ref.current = list
    setEntriesState(list)
  }, [])

  const reload = useCallback(async () => {
    const rows = await db.entries.toArray()
    setEntries(sortNewestFirst(live(rows)))
  }, [setEntries])

  // First load: migrate the old localStorage list once, then read from IndexedDB
  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const legacy = readJSON(KEYS.entries, null)
        if (Array.isArray(legacy) && legacy.length > 0) {
          const existing = await db.entries.count()
          if (existing === 0) {
            await db.entries.bulkPut(legacy.map((e) => ({ ...e, updatedAt: e.updatedAt || e.timestamp })))
          }
          removeKey(KEYS.entries)
        }
        if (!cancelled) await reload()
      } catch {
        // IndexedDB blocked (some private modes): the app still works for this session
      }
      if (!cancelled) setReady(true)
    }
    init()
    window.addEventListener('tt:storage', reload)
    return () => {
      cancelled = true
      window.removeEventListener('tt:storage', reload)
    }
  }, [reload])

  const persist = (rows) => {
    db.entries.bulkPut(rows).then(notifyStorageChanged).catch(() => {})
  }

  const addEntry = (entry) => {
    const signature = JSON.stringify({
      type: entry.type,
      timestamp: entry.timestamp,
      name: entry.name,
      durationMin: entry.durationMin,
      severity: entry.severity,
    })
    const now = Date.now()
    const previous = recentAdds.current.get(signature)
    if (previous && now - previous < 1500) return
    recentAdds.current.set(signature, now)
    for (const [key, time] of recentAdds.current) {
      if (now - time >= 1500) recentAdds.current.delete(key)
    }
    const row = stamp({ id: newId(), ...entry })
    setEntries(sortNewestFirst([...ref.current, row]))
    persist([row])
  }

  const updateEntry = (id, changes) => {
    const current = ref.current.find((e) => e.id === id)
    if (!current) return
    const row = stamp({ ...current, ...changes })
    setEntries(sortNewestFirst(ref.current.map((e) => (e.id === id ? row : e))))
    persist([row])
  }

  const deleteEntry = (id) => {
    const current = ref.current.find((e) => e.id === id)
    if (!current) return
    setEntries(ref.current.filter((e) => e.id !== id))
    db.entries.delete(id).catch(() => {})
  }

  const addMany = (list) => {
    const rows = list.map((e) => stamp({ id: newId(), ...e }))
    setEntries(sortNewestFirst([...ref.current, ...rows]))
    persist(rows)
  }

  const removeWhere = (predicate) => {
    const doomed = ref.current.filter(predicate)
    doomed.forEach((e) => deleteEntry(e.id))
  }

  // Wipes this phone's copy only. Nothing is sent to the server.
  const clearLocal = async () => {
    setEntries([])
    try {
      await db.entries.clear()
    } catch {
      // ignore
    }
    notifyStorageChanged()
  }

  const importEntries = async (entriesToImport) => {
    const rows = entriesToImport.map((entry) => stamp({
      ...entry,
      id: typeof entry.id === 'string' && entry.id ? entry.id : newId(),
    }))
    await db.entries.clear()
    await db.entries.bulkPut(rows)
    setEntries(sortNewestFirst(live(rows)))
    notifyStorageChanged()
  }

  const clearAll = async () => {
    await clearLocal()
    const keys = [
      KEYS.timer,
      KEYS.medLogs,
      KEYS.questionnaire,
      KEYS.sleepNights,
      KEYS.sleepPrefs,
      KEYS.reminders,
      KEYS.remindersDone,
      KEYS.meds,
      KEYS.feedback,
      KEYS.diagnostics,
      KEYS.reportRange,
      KEYS.videoFollows,
      KEYS.videoSaved,
    ]
    keys.forEach((key) => removeKey(key))
  }

  return { entries, ready, addEntry, updateEntry, deleteEntry, addMany, removeWhere, clearLocal, clearAll, importEntries }
}
