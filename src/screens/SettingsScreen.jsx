import { Download, FlaskConical, ShieldAlert, Sun, Moon, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { exportEntries, makeSampleEntries } from '../data/storage'

function Row({ Icon, tone, title, sub, children }) {
  return (
    <section className="mb-4 rounded-3xl border border-line bg-card p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={20} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold leading-tight">{title}</h2>
          <p className="text-sm text-muted">{sub}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

const outlineBtn =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 font-semibold transition-colors'

export default function SettingsScreen({ entries, theme, setTheme, onAddSample, onRemoveSample, onClearAll }) {
  const dark = theme === 'dark'
  const sampleCount = entries.filter((e) => e.sample).length

  const clearAll = () => {
    if (window.confirm(`Delete all ${entries.length} entries? This cannot be undone. Export first if you want a backup.`)) onClearAll()
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Personalize your tracker" />

      <section className="mb-4 flex items-center gap-3 rounded-3xl border border-line bg-card p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-soft text-amber">
          {dark ? <Moon size={20} aria-hidden /> : <Sun size={20} aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold leading-tight">Dark mode</h2>
          <p className="text-sm text-muted">Easy on the eyes for night and early morning</p>
        </div>
        <button
          role="switch"
          aria-checked={dark}
          aria-label="Dark mode"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${dark ? 'bg-sage' : 'bg-line'}`}
        >
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${dark ? 'left-7' : 'left-1'}`} />
        </button>
      </section>

      <Row Icon={Download} tone="bg-sage-soft text-sage" title="Export your data" sub="Download all entries as a JSON file (a backup you can share with your doctor)">
        <button
          onClick={() => exportEntries(entries)}
          disabled={entries.length === 0}
          className={`${outlineBtn} border-sage text-sage disabled:opacity-40`}
        >
          <Download size={18} aria-hidden /> Export {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </button>
      </Row>

      <Row Icon={FlaskConical} tone="bg-teal-soft text-teal" title="Try it with sample data" sub="Adds 14 days of made-up entries so you can see how Insights works">
        {sampleCount > 0 ? (
          <button onClick={onRemoveSample} className={`${outlineBtn} border-teal text-teal`}>
            Remove {sampleCount} sample entries
          </button>
        ) : (
          <button onClick={() => onAddSample(makeSampleEntries(14))} className={`${outlineBtn} border-teal text-teal`}>
            Add sample data
          </button>
        )}
      </Row>

      <Row Icon={Trash2} tone="bg-danger-soft text-danger" title="Clear all data" sub="Remove every entry and start fresh">
        <button onClick={clearAll} disabled={entries.length === 0} className={`${outlineBtn} border-danger text-danger disabled:opacity-40`}>
          <Trash2 size={18} aria-hidden /> Clear all data
        </button>
      </Row>

      <section className="mb-4 flex gap-3 rounded-3xl bg-chip p-4">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-muted" aria-hidden />
        <div>
          <h2 className="font-bold">Not medical advice</h2>
          <p className="text-sm text-muted">
            TriggerTrack is a personal tracking tool. It does not provide medical advice, diagnosis, or treatment. Always consult
            your doctor or a qualified healthcare professional about your symptoms and treatment options.
          </p>
        </div>
      </section>

      <p className="text-center text-xs text-muted">Your data is stored only on this device, in this browser.</p>
    </>
  )
}
