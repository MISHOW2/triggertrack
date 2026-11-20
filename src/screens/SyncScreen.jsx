import { Activity, Check, CircleAlert, Cloud, CloudOff, Info, Moon, RefreshCw, Sun, UtensilsCrossed, WifiOff } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useSync } from '../context/SyncContext'
import { formatTime } from '../utils/dateUtils'

const TYPE_ICON = { meal: UtensilsCrossed, wake: Sun, bedtime: Moon, symptom: Activity }
const TYPE_LABEL = { meal: 'Meal', wake: 'Wake-up', bedtime: 'Bedtime', symptom: 'Symptom' }

const HEADLINES = {
  off: { title: 'Sync is off', sub: 'Your entries are saved on this phone only.', Icon: CloudOff, tone: 'bg-chip text-muted' },
  offline: { title: 'Offline', sub: 'Your entries are saved on this phone.', Icon: WifiOff, tone: 'bg-amber-soft text-amber' },
  syncing: { title: 'Syncing…', sub: 'Logging keeps working while this runs.', Icon: RefreshCw, tone: 'bg-teal-soft text-teal' },
  error: { title: 'Needs retry', sub: "We'll try again automatically.", Icon: CircleAlert, tone: 'bg-amber-soft text-amber' },
  idle: { title: 'Up to date', sub: 'Everything is synced.', Icon: Check, tone: 'bg-sage-soft text-sage' },
}

function titleFor(entry) {
  if (entry.type === 'meal') return entry.name
  if (entry.type === 'wake') return 'Wake-up'
  if (entry.type === 'bedtime') return 'Bedtime'
  return entry.symptomType || 'Symptom episode'
}

const LEGEND = [
  { Icon: Check, tone: 'bg-sage-soft text-sage', label: 'Saved on phone', sub: 'Stored on this device' },
  { Icon: RefreshCw, tone: 'bg-teal-soft text-teal', label: 'Syncing', sub: 'Currently uploading' },
  { Icon: Cloud, tone: 'bg-sage-soft text-sage', label: 'Up to date', sub: 'Synced to your account' },
  { Icon: CircleAlert, tone: 'bg-amber-soft text-amber', label: 'Needs retry', sub: "We'll try again automatically" },
]

export default function SyncScreen({ onNavigate }) {
  const { status, pending, pendingCount, syncingIds, lastSyncedAt, online, syncNow, isMock, enabled } = useSync()
  const head = HEADLINES[status] || HEADLINES.idle
  const { Icon } = head

  return (
    <>
      <PageHeader title="Sync details" onBack={() => onNavigate('settings')} />

      <section className="mb-4 rounded-3xl border border-line bg-card p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${head.tone}`}>
            <Icon size={22} aria-hidden className={status === 'syncing' ? 'animate-spin' : ''} />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">{head.title}</h2>
            <p className="text-sm text-muted">{head.sub}</p>
          </div>
        </div>
        {enabled && (
          <dl className="mt-4 divide-y divide-line text-sm">
            <div className="flex justify-between py-2">
              <dt className="text-muted">Last synced</dt>
              <dd className="font-semibold">
                {lastSyncedAt
                  ? new Date(lastSyncedAt).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })
                  : 'Not yet'}
              </dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted">Waiting</dt>
              <dd className="font-semibold">
                {pendingCount} {pendingCount === 1 ? 'change' : 'changes'}
              </dd>
            </div>
          </dl>
        )}
      </section>

      {!enabled && (
        <section className="mb-4 rounded-3xl bg-sage-soft p-4">
          <h2 className="font-bold text-sage">Turn on sync</h2>
          <p className="mt-1 text-sm text-muted">Syncing keeps your diary safe and lets you use more than one phone. It needs your consent first.</p>
          <button onClick={() => onNavigate('privacy')} className="mt-3 min-h-12 w-full rounded-xl bg-sage font-bold text-white">
            Review privacy &amp; consent
          </button>
        </section>
      )}

      {enabled && pendingCount > 0 && (
        <section className="mb-4" aria-label="Pending changes">
          <h2 className="mb-2 font-semibold text-muted">Pending changes ({pendingCount})</h2>
          <div className="flex flex-col gap-2">
            {pending.map((entry) => {
              const TypeIcon = TYPE_ICON[entry.type] || Activity
              const syncing = syncingIds.includes(entry.id)
              const failed = entry.syncState === 'error'
              return (
                <div key={entry.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-sage">
                    <TypeIcon size={18} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold leading-tight">{titleFor(entry)}</p>
                    <p className="text-xs text-muted">
                      {TYPE_LABEL[entry.type]} · {formatTime(entry.timestamp)}
                      {entry.deletedAt ? ' · deleted' : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      failed ? 'bg-amber-soft text-amber' : syncing ? 'bg-teal-soft text-teal' : 'bg-amber-soft text-amber'
                    }`}
                  >
                    {failed ? 'Retry' : syncing ? 'Syncing' : 'Waiting'}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {enabled && !online && (
        <p className="mb-3 flex items-center gap-2 rounded-2xl bg-chip px-4 py-3 text-sm text-muted">
          <Info size={16} className="shrink-0" aria-hidden /> Sync resumes when you are online.
        </p>
      )}

      {enabled && (
        <button
          onClick={syncNow}
          disabled={!online || status === 'syncing' || pendingCount === 0}
          className="mb-1 flex min-h-14 w-full flex-col items-center justify-center rounded-2xl bg-sage font-bold text-white disabled:bg-chip disabled:text-muted"
        >
          <span className="flex items-center gap-2">
            <RefreshCw size={16} aria-hidden /> Sync now
          </span>
          {!online && <span className="text-xs font-normal">Not available while offline</span>}
        </button>
      )}

      {isMock && enabled && (
        <p className="mb-4 mt-3 rounded-2xl border border-dashed border-line p-3 text-xs text-muted">
          Demo sync: no server is connected yet, so nothing leaves this phone. Entries are marked synced after a short delay so you can
          test the flow.
        </p>
      )}

      <section className="mt-4 rounded-3xl border border-line bg-card p-4">
        <h2 className="mb-2 font-bold">Entry status legend</h2>
        <ul className="divide-y divide-line">
          {LEGEND.map(({ Icon: LIcon, tone, label, sub }) => (
            <li key={label} className="flex items-center gap-3 py-2">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone}`}>
                <LIcon size={14} aria-hidden />
              </span>
              <span className="w-32 shrink-0 text-sm font-semibold">{label}</span>
              <span className="text-sm text-muted">{sub}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
