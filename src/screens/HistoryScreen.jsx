import { useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EntryCard from '../components/EntryCard'
import Modal from '../components/Modal'
import MealForm from './MealForm'
import WakeForm from './WakeForm'
import SymptomForm from './SymptomForm'
import BedtimeForm from './BedtimeForm'
import { dayLabel, isSameDay } from '../utils/dateUtils'
import { inputClass } from '../components/fields'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'meal', label: 'Meals' },
  { id: 'wake', label: 'Wake-ups' },
  { id: 'bedtime', label: 'Bedtimes' },
  { id: 'symptom', label: 'Symptoms' },
]

export default function HistoryScreen({ entries, updateEntry, deleteEntry }) {
  const [filter, setFilter] = useState('all')
  const [date, setDate] = useState('')
  const [editing, setEditing] = useState(null)

  const visible = useMemo(
    () =>
      entries.filter((e) => {
        if (filter !== 'all' && e.type !== filter) return false
        if (date && !isSameDay(e.timestamp, new Date(`${date}T00:00`))) return false
        return true
      }),
    [entries, filter, date],
  )

  // Group by day, keeping newest first
  const groups = []
  visible.forEach((e) => {
    const label = dayLabel(e.timestamp)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(e)
    else groups.push({ label, items: [e] })
  })

  const onDelete = (entry) => {
    if (window.confirm('Delete this entry? This cannot be undone.')) deleteEntry(entry.id)
  }

  const onSave = (changes) => {
    updateEntry(editing.id, changes)
    setEditing(null)
  }

  return (
    <>
      <PageHeader title="History" />

      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={`flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold ${
              filter === id ? 'border-sage bg-sage text-white' : 'border-line bg-card text-ink'
            }`}
          >
            {id === 'all' && <Filter size={14} aria-hidden />}
            {label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex items-center gap-2">
        <label htmlFor="hist-date" className="text-sm font-medium text-muted">
          Day
        </label>
        <input id="hist-date" type="date" className={`${inputClass} max-w-48`} value={date} onChange={(e) => setDate(e.target.value)} />
        {date && (
          <button onClick={() => setDate('')} className="min-h-11 px-2 text-sm font-medium text-sage hover:underline">
            Clear
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
          {entries.length === 0 ? 'No entries yet. Log your first meal, wake-up, bedtime or symptom episode.' : 'No entries match this filter.'}
        </p>
      ) : (
        groups.map((g) => (
          <section key={g.label} className="mb-5">
            <h2 className="mb-2 text-sm font-semibold text-muted">{g.label}</h2>
            <div className="flex flex-col gap-2">
              {g.items.map((e) => (
                <EntryCard key={e.id} entry={e} onEdit={setEditing} onDelete={onDelete} />
              ))}
            </div>
          </section>
        ))
      )}

      {editing && (
        <Modal title="Edit entry" onClose={() => setEditing(null)}>
          {editing.type === 'meal' && <MealForm initial={editing} onSave={onSave} submitLabel="Save changes" />}
          {editing.type === 'wake' && <WakeForm initial={editing} onSave={onSave} submitLabel="Save changes" />}
          {editing.type === 'symptom' && <SymptomForm initial={editing} onSave={onSave} submitLabel="Save changes" />}
          {editing.type === 'bedtime' && <BedtimeForm initial={editing} onSave={onSave} submitLabel="Save changes" />}
        </Modal>
      )}
    </>
  )
}
