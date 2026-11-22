// On-device database (IndexedDB through Dexie). Screens use it through useEntries.
import Dexie from 'dexie'

export const db = new Dexie('triggertrack')

db.version(1).stores({
  entries: 'id, timestamp, type',
})

// Tell hooks that something changed outside their own writes.
export const notifyStorageChanged = () => window.dispatchEvent(new Event('tt:storage'))
