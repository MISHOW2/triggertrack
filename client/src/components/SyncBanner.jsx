import { ChevronRight, CloudAlert, WifiOff } from 'lucide-react'
import { useSync } from '../context/SyncContext'

// Slim notice on Home: shown when offline, or when a sync failed and will retry.
export default function SyncBanner({ onNavigate }) {
  const { status, pendingCount } = useSync()
  if (status !== 'offline' && status !== 'error') return null

  const offline = status === 'offline'
  const Icon = offline ? WifiOff : CloudAlert
  const text = offline
    ? pendingCount > 0
      ? `Offline · ${pendingCount} ${pendingCount === 1 ? 'change' : 'changes'} waiting`
      : 'Offline · entries save on this phone'
    : `Couldn't sync · ${pendingCount} waiting, retrying`

  return (
    <button
      onClick={() => onNavigate('sync')}
      className="mb-4 flex min-h-12 w-full items-center gap-3 rounded-2xl bg-amber-soft px-4 text-left text-sm font-semibold text-amber"
    >
      <Icon size={18} aria-hidden />
      <span className="flex-1">{text}</span>
      <ChevronRight size={18} aria-hidden />
    </button>
  )
}
