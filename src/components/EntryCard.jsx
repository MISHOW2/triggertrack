import { Activity, Clock, Pencil, Sun, Trash2, UtensilsCrossed } from 'lucide-react'
import { formatDuration, formatTime } from '../utils/dateUtils'
import SeverityBadge from './SeverityBadge'

const META = {
  meal: { label: 'Meal', Icon: UtensilsCrossed, tile: 'bg-sage-soft text-sage' },
  wake: { label: 'Wake-up', Icon: Sun, tile: 'bg-amber-soft text-amber' },
  symptom: { label: 'Symptom', Icon: Activity, tile: 'bg-teal-soft text-teal' },
}

function titleFor(entry) {
  if (entry.type === 'meal') return entry.name
  if (entry.type === 'wake') return `Woke at ${formatTime(entry.timestamp)}`
  return entry.symptomType
}

// One row in a list. compact = Home screen style, otherwise full History style with edit/delete.
export default function EntryCard({ entry, compact = false, onEdit, onDelete }) {
  const { label, Icon, tile } = META[entry.type]

  if (compact) {
    const sub =
      entry.type === 'symptom'
        ? `${formatTime(entry.timestamp)} · ${formatDuration(entry.durationMin)}`
        : formatTime(entry.timestamp)
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3">
        <Icon size={18} className="shrink-0 text-muted" aria-hidden />
        <div className="min-w-0">
          <p className="truncate font-medium">{entry.type === 'wake' ? 'Wake-up' : titleFor(entry)}</p>
          <p className="text-sm text-muted">{sub}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tile}`}>
          <Icon size={20} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <span>{label}</span>
            <span className="flex items-center gap-1 font-normal normal-case tracking-normal">
              <Clock size={12} aria-hidden />
              {formatTime(entry.timestamp)}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="font-medium">{titleFor(entry)}</p>
            {(entry.type === 'symptom' || entry.type === 'wake') && <SeverityBadge level={entry.severity} />}
          </div>

          {entry.type === 'meal' && entry.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {entry.tags.map((t) => (
                <span key={t} className="rounded-full bg-chip px-2.5 py-0.5 text-xs font-medium text-ink">
                  {t}
                </span>
              ))}
            </div>
          )}
          {entry.type === 'wake' && entry.symptoms?.length > 0 && (
            <p className="mt-1 text-sm text-muted">Symptoms: {entry.symptoms.map((s) => s.toLowerCase()).join(', ')}</p>
          )}
          {entry.type === 'symptom' && (
            <p className="mt-1 text-sm text-muted">Lasted {formatDuration(entry.durationMin)}</p>
          )}
          {entry.notes && <p className="mt-1 text-sm text-muted">{entry.notes}</p>}
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onEdit(entry)}
            aria-label={`Edit ${label.toLowerCase()}`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-chip"
          >
            <Pencil size={17} />
          </button>
          <button
            onClick={() => onDelete(entry)}
            aria-label={`Delete ${label.toLowerCase()}`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
