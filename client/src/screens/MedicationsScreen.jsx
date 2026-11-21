import { useState } from 'react'
import { Check, Pencil, Pill, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { Field, PrimaryButton, inputClass } from '../components/fields'
import useLocalStorage from '../hooks/useLocalStorage'
import { KEYS, newId } from '../data/storage'
import { isSameDay, startOfDay } from '../utils/dateUtils'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function MedForm({ initial, onSave, onRemove }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [dose, setDose] = useState(initial?.dose ?? '')
  const [kind, setKind] = useState(initial?.kind ?? 'daily')
  const [note, setNote] = useState(initial?.note ?? '')
  const [time, setTime] = useState(initial?.time ?? '07:30')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), dose: dose.trim(), kind, note: note.trim(), time: kind === 'daily' ? time : '' })
  }

  return (
    <form onSubmit={submit}>
      <Field label="Medicine name" htmlFor="med-name">
        <input id="med-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
      </Field>
      <Field label="Dose (as on your label)" htmlFor="med-dose">
        <input id="med-dose" className={inputClass} value={dose} onChange={(e) => setDose(e.target.value)} maxLength={40} placeholder="e.g. 20 mg" />
      </Field>
      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-semibold">How you take it</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['daily', 'Every day'],
            ['asNeeded', 'As needed'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
              className={`min-h-12 rounded-xl border font-semibold ${kind === value ? 'border-sage bg-sage text-white' : 'border-line bg-card text-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      {kind === 'daily' && (
        <Field label="Usual time" htmlFor="med-time">
          <input id="med-time" type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      )}
      <Field label="Note (optional)" htmlFor="med-note">
        <input id="med-note" className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} placeholder="e.g. before breakfast" />
      </Field>
      <PrimaryButton type="submit">{initial ? 'Save changes' : 'Add medication'}</PrimaryButton>
      {onRemove && (
        <button type="button" onClick={onRemove} className="mt-3 min-h-12 w-full rounded-xl border-2 border-danger font-semibold text-danger">
          Remove medication
        </button>
      )}
      <p className="mt-3 text-xs text-muted">This is a personal log. TriggerTrack does not suggest doses or medicines.</p>
    </form>
  )
}

export default function MedicationsScreen({ onNavigate }) {
  const [meds, setMeds] = useLocalStorage(KEYS.meds, [])
  const [logs, setLogs] = useLocalStorage(KEYS.medLogs, [])
  const [modal, setModal] = useState(null) // 'add' | med
  const now = new Date()

  const dosesToday = (medId) => logs.filter((l) => l.medId === medId && isSameDay(l.timestamp, now))
  const lastDose = (medId) =>
    logs.filter((l) => l.medId === medId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]

  const logDose = (medId) => setLogs((prev) => [...prev, { id: newId(), medId, timestamp: new Date().toISOString() }])
  const undoToday = (medId) =>
    setLogs((prev) => {
      const todays = prev.filter((l) => l.medId === medId && isSameDay(l.timestamp, now))
      const last = todays.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      return last ? prev.filter((l) => l.id !== last.id) : prev
    })

  const saveMed = (fields) => {
    if (modal === 'add') setMeds((prev) => [...prev, { id: newId(), createdAt: new Date().toISOString(), ...fields }])
    else setMeds((prev) => prev.map((m) => (m.id === modal.id ? { ...m, ...fields } : m)))
    setModal(null)
  }
  const removeMed = () => {
    if (!window.confirm(`Remove ${modal.name}? Its dose history is removed too.`)) return
    setMeds((prev) => prev.filter((m) => m.id !== modal.id))
    setLogs((prev) => prev.filter((l) => l.medId !== modal.id))
    setModal(null)
  }

  // Week strip (Mon–Sun): a day is filled when every daily medicine was taken that day
  const daily = meds.filter((m) => m.kind === 'daily')
  const monday = startOfDay(now)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const week = DAY_LETTERS.map((letter, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    const future = startOfDay(day) > startOfDay(now)
    const done = daily.length > 0 && daily.every((m) => logs.some((l) => l.medId === m.id && isSameDay(l.timestamp, day)))
    return { letter, future, done }
  })
  const elapsed = week.filter((d) => !d.future).length
  const doneCount = week.filter((d) => d.done).length

  return (
    <>
      <PageHeader
        title="Medications"
        subtitle={now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        onBack={() => onNavigate('settings')}
      />

      {meds.length === 0 && (
        <p className="mb-4 rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">
          No medicines yet. Add the ones you take so your doses sit next to your entries and can go in the doctor report.
        </p>
      )}

      <div className="mb-4 flex flex-col gap-3">
        {meds.map((m) => {
          const today = dosesToday(m.id)
          const taken = today.length > 0
          const last = lastDose(m.id)
          return (
            <section key={m.id} className="rounded-3xl border border-line bg-card p-4">
              <div className="flex items-start gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${taken ? 'bg-sage-soft text-sage' : 'bg-amber-soft text-amber'}`}>
                  {taken ? <Check size={20} aria-hidden /> : <Pill size={20} aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold leading-tight">
                    {m.name}
                    {m.dose ? ` ${m.dose}` : ''}
                  </h2>
                  <p className="text-sm text-muted">
                    {m.kind === 'daily'
                      ? taken
                        ? `Taken today · ${new Date(today[today.length - 1].timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                        : `Not logged today${m.time ? ` · usually ${m.time}` : ''}`
                      : `As needed${last ? ` · last dose ${new Date(last.timestamp).toLocaleDateString([], { weekday: 'short' })}` : ''}`}
                  </p>
                  {m.note && <span className="mt-1 inline-block rounded-full bg-sage-soft px-3 py-1 text-xs font-semibold text-sage">{m.note}</span>}
                </div>
                <button onClick={() => setModal(m)} aria-label={`Edit ${m.name}`} className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-chip">
                  <Pencil size={16} aria-hidden />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                {m.kind === 'daily' && taken ? (
                  <button onClick={() => undoToday(m.id)} className="min-h-11 flex-1 rounded-xl border border-line text-sm font-semibold text-muted">
                    Undo today&apos;s dose
                  </button>
                ) : (
                  <button onClick={() => logDose(m.id)} className="min-h-11 flex-1 rounded-xl bg-sage text-sm font-bold text-white">
                    {m.kind === 'daily' ? 'Mark as taken' : 'Log dose'}
                  </button>
                )}
                {m.kind === 'asNeeded' && today.length > 0 && (
                  <button onClick={() => undoToday(m.id)} className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-muted">
                    Undo ({today.length} today)
                  </button>
                )}
              </div>
            </section>
          )
        })}
      </div>

      {daily.length > 0 && (
        <section className="mb-4 rounded-3xl border border-line bg-card p-4" aria-label="This week">
          <h2 className="mb-3 font-bold">This week</h2>
          <div className="flex justify-between">
            {week.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${d.done ? 'bg-sage text-white' : 'bg-chip text-muted'}`}
                  aria-label={`${d.letter}: ${d.done ? 'all doses taken' : d.future ? 'not yet' : 'not all taken'}`}
                >
                  {d.done && <Check size={16} aria-hidden />}
                </span>
                <span className="text-xs text-muted">{d.letter}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">
            {doneCount} of {elapsed} {elapsed === 1 ? 'day' : 'days'} with all doses logged so far.
          </p>
        </section>
      )}

      <button onClick={() => setModal('add')} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-sage font-bold text-sage">
        <Plus size={18} aria-hidden /> Add a medication
      </button>

      {modal && (
        <Modal title={modal === 'add' ? 'Add a medication' : 'Edit medication'} onClose={() => setModal(null)}>
          <MedForm initial={modal === 'add' ? null : modal} onSave={saveMed} onRemove={modal === 'add' ? null : removeMed} />
        </Modal>
      )}
    </>
  )
}
