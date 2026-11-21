import { useMemo, useState } from 'react'
import { Moon, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { Field, PrimaryButton, inputClass } from '../components/fields'
import { ToggleRow } from '../components/Toggle'
import useLocalStorage from '../hooks/useLocalStorage'
import { KEYS, newId } from '../data/storage'
import { getSleepSource, importNights } from '../data/sleepSource'
import { fromLocalInput, toLocalInput } from '../utils/dateUtils'

const dur = (mins) => `${Math.floor(mins / 60)} h ${String(Math.round(mins % 60)).padStart(2, '0')} m`
const weekday = (iso) => new Date(iso).toLocaleDateString([], { weekday: 'short' })
const hhmm = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

export default function SleepImportScreen({ entries, onNavigate }) {
  const [nights, setNights] = useLocalStorage(KEYS.sleepNights, [])
  const [prefs, setPrefs] = useLocalStorage(KEYS.sleepPrefs, { auto: false })
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')
  const source = getSleepSource()

  const rows = useMemo(() => {
    const episodes = entries.filter((e) => e.type === 'symptom')
    return [...nights]
      .sort((a, b) => new Date(b.end) - new Date(a.end))
      .slice(0, 14)
      .map((n) => {
        const woke = episodes.find((e) => new Date(e.timestamp) >= new Date(n.start) && new Date(e.timestamp) <= new Date(n.end))
        return { ...n, minutes: (new Date(n.end) - new Date(n.start)) / 60000, woke }
      })
  }, [nights, entries])

  const runImport = async () => {
    setMessage('')
    try {
      const found = await importNights()
      const known = new Set(nights.map((n) => n.start))
      const fresh = found.filter((n) => !known.has(n.start)).map((n) => ({ id: newId(), ...n, source: 'health-connect' }))
      setNights((prev) => [...prev, ...fresh])
      setMessage(fresh.length ? `Imported ${fresh.length} ${fresh.length === 1 ? 'night' : 'nights'}.` : 'No new nights found.')
    } catch {
      setMessage('Sleep import needs the Android app with Health Connect. You can add nights by hand for now.')
    }
  }

  return (
    <>
      <PageHeader title="Sleep import" subtitle="From your phone's health app" onBack={() => onNavigate('settings')} />

      <section className="mb-4 flex items-start gap-3 rounded-3xl bg-sage-soft p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage text-white">
          <Moon size={20} aria-hidden />
        </span>
        <div>
          <h2 className="font-bold text-sage">{source.name}</h2>
          <p className="text-sm text-muted">{source.available ? 'Connected · read-only' : 'Available in the Android app'}</p>
          <span className="mt-2 inline-block rounded-full bg-card px-3 py-1 text-xs font-bold text-sage">Sleep only — nothing else</span>
        </div>
      </section>

      <h2 className="mb-2 font-semibold text-muted">Recent nights</h2>
      {rows.length === 0 ? (
        <p className="mb-4 rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">No nights yet. Import them, or add one by hand.</p>
      ) : (
        <div className="mb-4 flex flex-col gap-2">
          {rows.map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-tight">
                  {weekday(n.start)} → {weekday(n.end)}
                </p>
                <p className={`text-xs ${n.woke ? 'text-amber' : 'text-muted'}`}>
                  {n.woke ? `Woke ${hhmm(n.woke.timestamp)} · episode logged` : 'Slept through'}
                </p>
              </div>
              <p className="text-lg font-bold text-sage">{dur(n.minutes)}</p>
            </div>
          ))}
        </div>
      )}

      <section className="mb-3 rounded-3xl border border-line bg-card px-4">
        <ToggleRow
          title="Import new nights automatically"
          sub={source.available ? 'Matched against your episodes.' : 'Needs the Android app.'}
          checked={Boolean(prefs.auto) && source.available}
          onChange={(auto) => source.available && setPrefs({ ...prefs, auto })}
        />
      </section>

      <button onClick={runImport} className="mb-2 min-h-14 w-full rounded-2xl border-2 border-sage font-bold text-sage">
        Import now
      </button>
      <button onClick={() => setAdding(true)} className="flex min-h-12 w-full items-center justify-center gap-2 text-sm font-semibold text-sage">
        <Plus size={16} aria-hidden /> Add a night by hand
      </button>
      {message && (
        <p role="status" className="mt-3 rounded-2xl bg-chip p-3 text-sm text-muted">
          {message}
        </p>
      )}

      {adding && (
        <Modal title="Add a night" onClose={() => setAdding(false)}>
          <NightForm
            onSave={(n) => {
              setNights((prev) => [...prev, { id: newId(), source: 'manual', ...n }])
              setAdding(false)
            }}
          />
        </Modal>
      )}
    </>
  )
}

function NightForm({ onSave }) {
  const [start, setStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    d.setHours(22, 30, 0, 0)
    return toLocalInput(d)
  })
  const [end, setEnd] = useState(() => {
    const d = new Date()
    d.setHours(6, 30, 0, 0)
    return toLocalInput(d)
  })
  const invalid = new Date(end) <= new Date(start)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!invalid) onSave({ start: fromLocalInput(start), end: fromLocalInput(end) })
      }}
    >
      <Field label="Went to sleep" htmlFor="night-start">
        <input id="night-start" type="datetime-local" className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} />
      </Field>
      <Field label="Woke up" htmlFor="night-end">
        <input id="night-end" type="datetime-local" className={inputClass} value={end} onChange={(e) => setEnd(e.target.value)} />
      </Field>
      {invalid && <p className="mb-3 text-sm text-danger">Wake-up time must be after you went to sleep.</p>}
      <PrimaryButton type="submit" disabled={invalid}>
        Save night
      </PrimaryButton>
    </form>
  )
}
