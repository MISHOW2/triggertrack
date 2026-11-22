import { useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Moon, SlidersHorizontal } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EntryCard from '../components/EntryCard'
import Modal from '../components/Modal'
import ConfirmSheet from '../components/ConfirmSheet'
import { Trash2 } from 'lucide-react'
import MealForm from './MealForm'
import WakeForm from './WakeForm'
import SymptomForm from './SymptomForm'
import BedtimeForm from './BedtimeForm'
import { formatTime, isSameDay, toDateInput } from '../utils/dateUtils'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'meal', label: 'Meals' },
  { id: 'wake', label: 'Wake-ups' },
  { id: 'bedtime', label: 'Bedtimes' },
  { id: 'symptom', label: 'Symptoms' },
]

function dayName(date) {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function HistoryScreen({ entries, updateEntry, deleteEntry, onNavigate }) {
  const [filter, setFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const dayInput = useRef(null)
  const today = new Date()
  const isToday = isSameDay(selectedDate, today)

  const visible = useMemo(
    () =>
      entries.filter((entry) => {
        if (filter !== 'all' && entry.type !== filter) return false
        return isSameDay(entry.timestamp, selectedDate)
      }),
    [entries, filter, selectedDate],
  )

  const moveDay = (amount) => {
    setSelectedDate((current) => {
      const next = new Date(current)
      next.setDate(next.getDate() + amount)
      return next > today ? today : next
    })
  }

  const onDelete = (entry) => setDeleting(entry)

  const confirmDelete = () => {
    deleteEntry(deleting.id)
    setDeleting(null)
    setEditing(null)
  }

  const onSave = (changes) => {
    updateEntry(editing.id, changes)
    setEditing(null)
  }

  const adjacentDate = new Date(selectedDate)
  adjacentDate.setDate(adjacentDate.getDate() + (isToday ? -1 : 1))

  return (
    <>
      <PageHeader title="History" subtitle="A calm look back, one day at a time." />

      <div className="no-scrollbar -mx-4 mb-5 flex snap-x gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by type">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={`flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 text-sm font-semibold ${
              filter === id ? 'border-sage bg-sage text-white' : 'border-line bg-card text-muted'
            }`}
          >
            {id === 'all' && <SlidersHorizontal size={15} aria-hidden />}
            {label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex min-h-14 items-center justify-between rounded-full bg-card px-3 shadow-sm">
        <button
          type="button"
          onClick={() => moveDay(-1)}
          aria-label="Previous day"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted"
        >
          <ChevronLeft size={21} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof dayInput.current?.showPicker === 'function') dayInput.current.showPicker()
            else dayInput.current?.click()
          }}
          className="flex min-h-10 min-w-0 items-center justify-center gap-2 px-1 text-center text-sm font-semibold"
          aria-label="Choose a date"
        >
          <CalendarDays size={16} className="shrink-0 text-teal" aria-hidden />
          <span className="truncate">{isToday ? 'Today' : dayName(selectedDate)}</span>
        </button>
        <input
          ref={dayInput}
          type="date"
          value={toDateInput(selectedDate)}
          max={toDateInput(today)}
          aria-label="Choose a history date"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            if (event.target.value) setSelectedDate(new Date(`${event.target.value}T00:00:00`))
          }}
        />
        <button
          type="button"
          onClick={() => moveDay(1)}
          aria-label="Next day"
          disabled={isToday}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted disabled:opacity-30"
        >
          <ChevronRight size={21} aria-hidden />
        </button>
      </div>

      {!isToday && (
        <button
          type="button"
          onClick={() => setSelectedDate(new Date())}
          className="mx-auto mb-7 block min-h-9 px-3 text-sm font-semibold text-sage"
        >
          Back to today
        </button>
      )}

      {visible.length === 0 ? (
        <section className="flex min-h-[390px] flex-col items-center justify-center rounded-3xl bg-card px-6 py-8 text-center shadow-sm">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sage-soft text-sage">
            <Moon size={27} aria-hidden />
          </div>
          <h2 className="text-base font-bold">
            {filter === 'all' ? (isToday ? 'Nothing logged today' : 'Nothing logged this day') : `No ${FILTERS.find((item) => item.id === filter)?.label.toLowerCase()} logged this day`}
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
            That&apos;s okay. When you log something, it will show up here.
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.('log')}
            className="mt-6 min-h-12 rounded-full bg-sage px-7 text-sm font-semibold text-white shadow-sm"
          >
            Log something
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(adjacentDate)}
            className="mt-4 min-h-9 px-2 text-sm font-semibold text-sage"
          >
            See {dayName(adjacentDate)}
          </button>
        </section>
      ) : (
        <section aria-label={isToday ? 'Today' : dayName(selectedDate)}>
          <h2 className="mb-3 text-sm font-semibold text-muted">{isToday ? 'Today' : dayName(selectedDate)}</h2>
          <div className="flex flex-col gap-3">
            {visible.map((entry) => (
              <EntryCard key={entry.id} entry={entry} compact onEdit={setEditing} onDelete={onDelete} />
            ))}
          </div>
        </section>
      )}

      {editing && (
        <Modal title="Edit entry" onClose={() => setEditing(null)}>
          {editing.type === 'meal' && <MealForm initial={editing} onSave={onSave} submitLabel="Save changes" />}
          {editing.type === 'wake' && <WakeForm initial={editing} onSave={onSave} submitLabel="Save changes" />}
          {editing.type === 'symptom' && <SymptomForm initial={editing} onSave={onSave} submitLabel="Save changes" />}
          {editing.type === 'bedtime' && <BedtimeForm initial={editing} onSave={onSave} submitLabel="Save changes" />}
          <button
            type="button"
            onClick={() => setDeleting(editing)}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-danger font-semibold text-danger"
          >
            <Trash2 size={18} aria-hidden /> Delete entry
          </button>
        </Modal>
      )}

      {deleting && (
        <ConfirmSheet
          title="Delete this entry?"
          body="This removes it from your history on this phone."
          confirmLabel="Delete entry"
          cancelLabel="Keep entry"
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
