import { useState } from 'react'
import { Download, Smartphone, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ConfirmSheet from '../components/ConfirmSheet'
import { useSync } from '../context/SyncContext'
import { exportEntries } from '../data/storage'

const outlineBtn = 'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 font-semibold disabled:opacity-40'

export default function YourDataScreen({ entries, onClearLocal, onNavigate }) {
  const { enabled, status, lastSyncedAt, deleteAccount } = useSync()
  const [sheet, setSheet] = useState(null) // 'local' | 'account'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const syncLabel = !enabled
    ? 'Sync is off'
    : status === 'offline'
      ? 'Offline'
      : status === 'syncing'
        ? 'Syncing…'
        : lastSyncedAt
          ? `Up to date · ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
          : 'Up to date'

  const confirmLocal = async () => {
    await onClearLocal()
    setSheet(null)
  }

  const confirmAccount = async () => {
    setBusy(true)
    setError('')
    try {
      await deleteAccount()
      setSheet(null)
    } catch {
      setError('We could not delete your account. Check your connection and try again.')
    }
    setBusy(false)
  }

  return (
    <>
      <PageHeader title="Your data" subtitle={syncLabel} onBack={() => onNavigate('settings')} />

      <section className="mb-4 rounded-3xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-soft text-sage">
            <Download size={20} aria-hidden />
          </span>
          <div>
            <h2 className="font-bold leading-tight">Export your diary</h2>
            <p className="text-sm text-muted">Download your entries and settings as a JSON file.</p>
          </div>
        </div>
        <button onClick={() => exportEntries(entries)} disabled={entries.length === 0} className={`${outlineBtn} border-sage text-sage`}>
          <Download size={18} aria-hidden /> Export {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </button>
      </section>

      <section className="mb-4 rounded-3xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-soft text-teal">
            <Smartphone size={20} aria-hidden />
          </span>
          <div>
            <h2 className="font-bold leading-tight">This phone</h2>
            <p className="text-sm text-muted">
              {enabled
                ? 'Remove the diary saved on this phone. Synced entries remain in your account.'
                : 'Remove the diary saved on this phone. Nothing is synced, so this deletes it for good.'}
            </p>
          </div>
        </div>
        <button onClick={() => setSheet('local')} disabled={entries.length === 0} className={`${outlineBtn} border-teal text-teal`}>
          Clear local data
        </button>
      </section>

      <section className="mb-4 rounded-3xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger-soft text-danger">
            <Trash2 size={20} aria-hidden />
          </span>
          <div>
            <h2 className="font-bold leading-tight">Account &amp; synced data</h2>
            <p className="text-sm text-muted">{enabled ? 'Delete your account and everything synced to it.' : 'You have no cloud account. Turn on sync first if you want one.'}</p>
          </div>
        </div>
        {enabled ? (
          <>
            <button onClick={() => setSheet('account')} className={`${outlineBtn} border-danger text-danger`}>
              Delete account and all data
            </button>
            <p className="mt-2 text-xs text-danger">This permanently removes your account and synced diary.</p>
          </>
        ) : (
          <button onClick={() => onNavigate('privacy')} className={`${outlineBtn} border-sage text-sage`}>
            Privacy &amp; consent
          </button>
        )}
      </section>

      {sheet === 'local' && (
        <ConfirmSheet
          title="Clear data on this phone?"
          body={enabled ? 'Your synced diary stays in your account.' : 'Nothing is synced, so these entries cannot be recovered. Export first if you want a copy.'}
          confirmLabel="Clear local data"
          onConfirm={confirmLocal}
          onCancel={() => setSheet(null)}
        />
      )}
      {sheet === 'account' && (
        <ConfirmSheet
          title="Delete your account?"
          body={error || 'This cannot be undone. Export your diary first if you want a copy.'}
          confirmLabel="Delete permanently"
          cancelLabel="Keep account"
          requireCheck="I understand my synced diary will be deleted."
          busy={busy}
          onConfirm={confirmAccount}
          onCancel={() => setSheet(null)}
        />
      )}
    </>
  )
}
