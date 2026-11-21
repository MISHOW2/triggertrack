// On-device database (IndexedDB through Dexie). Screens never import this directly:
// they go through useEntries and the sync context.
import Dexie from 'dexie'

export const db = new Dexie('triggertrack')

// syncState: 'local' (sync off) | 'pending' | 'error' | 'synced'
// deletedAt: set on a soft delete so the delete can sync before the row is purged
db.version(1).stores({
  entries: 'id, timestamp, type, syncState, deletedAt',
})

// Tell hooks that something changed outside their own writes (for example, sync finished)
export const notifyStorageChanged = () => window.dispatchEvent(new Event('tt:storage'))
