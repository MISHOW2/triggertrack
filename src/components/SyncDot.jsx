import { Check, CircleAlert, Clock } from 'lucide-react'
import { useSync } from '../context/SyncContext'

// Tiny per-entry sync status. Shows nothing until sync is switched on.
export default function SyncDot({ entry }) {
  const { enabled } = useSync()
  if (!enabled) return null
  if (entry.syncState === 'synced') {
    return (
      <span className="flex items-center gap-1 text-xs text-muted">
        <Check size={12} aria-hidden /> Up to date
      </span>
    )
  }
  if (entry.syncState === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber">
        <CircleAlert size={12} aria-hidden /> Needs retry
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted">
      <Clock size={12} aria-hidden /> Waiting to sync
    </span>
  )
}
