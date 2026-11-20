import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { db, notifyStorageChanged } from '../data/db'
import * as remote from '../data/remote'
import { KEYS } from '../data/storage'
import useLocalStorage from '../hooks/useLocalStorage'

export const POLICY_VERSION = '1.0'

const SyncContext = createContext(null)
export const useSync = () => useContext(SyncContext)

const MAX_WAIT = 60_000

// Holds consent, online state and the sync engine.
// Saving never waits for any of this: entries are written to the phone first (useEntries).
export function SyncProvider({ children }) {
  const [consent, setConsent] = useLocalStorage(KEYS.consent, null)
  const [lastSyncedAt, setLastSyncedAt] = useLocalStorage(KEYS.lastSynced, null)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [status, setStatus] = useState('idle') // idle | syncing | error
  const [pending, setPending] = useState([])
  const [syncingIds, setSyncingIds] = useState([])

  const enabled = consent?.decision === 'granted'
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled
  const running = useRef(false)
  const attempts = useRef(0)
  const timer = useRef(null)

  const refreshPending = useCallback(async () => {
    try {
      const rows = await db.entries.where('syncState').anyOf('pending', 'error').toArray()
      setPending(rows.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)))
    } catch {
      setPending([])
    }
  }, [])

  const syncNow = useCallback(async () => {
    clearTimeout(timer.current)
    if (!enabledRef.current || !navigator.onLine || running.current) return
    const batch = await db.entries.where('syncState').anyOf('pending', 'error').toArray()
    if (batch.length === 0) {
      setStatus('idle')
      return
    }
    running.current = true
    setStatus('syncing')
    setSyncingIds(batch.map((e) => e.id))
    try {
      await remote.push(batch)
      // Only mark an entry synced if it was not edited again while the request was in flight
      for (const sent of batch) {
        const current = await db.entries.get(sent.id)
        if (!current || current.updatedAt !== sent.updatedAt) continue
        if (current.deletedAt) await db.entries.delete(sent.id)
        else await db.entries.update(sent.id, { syncState: 'synced' })
      }
      attempts.current = 0
      setLastSyncedAt(new Date().toISOString())
      setStatus('idle')
    } catch {
      await db.entries.where('id').anyOf(batch.map((e) => e.id)).modify((e) => {
        if (e.syncState === 'pending') e.syncState = 'error'
      })
      setStatus('error')
      // Wait 2, 4, 8... seconds, up to a cap
      attempts.current += 1
      const delay = Math.min(2000 * 2 ** (attempts.current - 1), MAX_WAIT)
      timer.current = setTimeout(syncNow, delay)
    } finally {
      running.current = false
      setSyncingIds([])
      await refreshPending()
      notifyStorageChanged()
    }
  }, [refreshPending, setLastSyncedAt])

  // Run on open, when something changes, and when the network returns
  useEffect(() => {
    const onChange = async () => {
      await refreshPending()
      syncNow()
    }
    const goOnline = () => {
      setOnline(true)
      syncNow()
    }
    const goOffline = () => setOnline(false)
    window.addEventListener('tt:storage', onChange)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    onChange()
    return () => {
      window.removeEventListener('tt:storage', onChange)
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      clearTimeout(timer.current)
    }
  }, [refreshPending, syncNow, enabled])

  const grantConsent = useCallback(async () => {
    setConsent({ decision: 'granted', version: POLICY_VERSION, at: new Date().toISOString() })
    // Entries made before consent become the first thing to sync
    await db.entries.where('syncState').equals('local').modify({ syncState: 'pending' })
    enabledRef.current = true
    notifyStorageChanged()
  }, [setConsent])

  const declineConsent = useCallback(() => {
    setConsent({ decision: 'declined', version: POLICY_VERSION, at: new Date().toISOString() })
  }, [setConsent])

  const withdrawConsent = useCallback(async () => {
    setConsent({ decision: 'declined', version: POLICY_VERSION, at: new Date().toISOString() })
    enabledRef.current = false
    await db.entries.where('syncState').anyOf('pending', 'error').modify({ syncState: 'local' })
    setLastSyncedAt(null)
    notifyStorageChanged()
  }, [setConsent, setLastSyncedAt])

  // Deletes the account on the server, then forgets cloud state. The phone's own copy is untouched.
  const deleteAccount = useCallback(async () => {
    await remote.deleteAccount()
    await withdrawConsent()
    await db.entries.where('syncState').equals('synced').modify({ syncState: 'local' })
    await db.entries.filter((e) => Boolean(e.deletedAt)).delete()
    notifyStorageChanged()
  }, [withdrawConsent])

  const value = useMemo(
    () => ({
      consent,
      enabled,
      online,
      status: !enabled ? 'off' : !online ? 'offline' : status,
      pending: enabled ? pending : [],
      pendingCount: enabled ? pending.length : 0,
      syncingIds,
      lastSyncedAt,
      isMock: remote.isMockRemote,
      syncNow,
      grantConsent,
      declineConsent,
      withdrawConsent,
      deleteAccount,
    }),
    [consent, enabled, online, status, pending, syncingIds, lastSyncedAt, syncNow, grantConsent, declineConsent, withdrawConsent, deleteAccount],
  )

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}
