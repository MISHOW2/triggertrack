import { useRef, useState } from 'react'
import { Download, Upload, Smartphone, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ConfirmSheet from '../components/ConfirmSheet'
import { exportEntries, readEntryBackup } from '../data/storage'

const outlineBtn = 'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 font-semibold disabled:opacity-40'

export default function YourDataScreen({ entries, onClearAll, onImport, onNavigate }) {
  const [sheet, setSheet] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)

  const confirmClear = async () => {
    setBusy(true)
    await onClearAll()
    setBusy(false)
    setSheet(null)
  }

  const importFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const imported = await readEntryBackup(file)
      await onImport(imported)
      setSheet('imported')
    } catch (err) {
      setError(err?.message || 'We could not import that backup.')
      setSheet('error')
    }
    setBusy(false)
  }

  return (
    <>
      <PageHeader title="Your data" subtitle="Stored on this device only" onBack={() => onNavigate('settings')} />

      <section className="mb-4 rounded-3xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-soft text-sage">
            <Download size={20} aria-hidden />
          </span>
          <div>
            <h2 className="font-bold leading-tight">Export your diary</h2>
            <p className="text-sm text-muted">The file contains health information. Keep it private.</p>
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
            <h2 className="font-bold leading-tight">Import a backup</h2>
            <p className="text-sm text-muted">Restore entries from a TriggerTrack JSON export.</p>
          </div>
        </div>
        <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={importFile} />
        <button onClick={() => fileInput.current?.click()} disabled={busy} className={`${outlineBtn} border-teal text-teal`}>
          <Upload size={18} aria-hidden /> Import backup
        </button>
      </section>

      <section className="mb-4 rounded-3xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger-soft text-danger">
            <Trash2 size={20} aria-hidden />
          </span>
          <div>
            <h2 className="font-bold leading-tight">Delete all data on this phone</h2>
            <p className="text-sm text-muted">Permanently remove your entries and local app data.</p>
          </div>
        </div>
        <button onClick={() => setSheet('clear')} disabled={busy} className={`${outlineBtn} border-danger text-danger`}>
          Delete all data
        </button>
      </section>

      {sheet === 'clear' && (
        <ConfirmSheet
          title="Delete all data on this phone?"
          body="This cannot be undone. Export a backup first if you want to keep it."
          confirmLabel="Delete all data"
          busy={busy}
          onConfirm={confirmClear}
          onCancel={() => setSheet(null)}
        />
      )}
      {sheet === 'imported' && (
        <ConfirmSheet
          title="Backup imported"
          body="Your entries have been restored on this phone."
          confirmLabel="Done"
          danger={false}
          onConfirm={() => setSheet(null)}
          onCancel={() => setSheet(null)}
        />
      )}
      {sheet === 'error' && (
        <ConfirmSheet
          title="Import failed"
          body={error}
          confirmLabel="Try again"
          danger={false}
          onConfirm={() => setSheet(null)}
          onCancel={() => setSheet(null)}
        />
      )}
    </>
  )
}
