import { Activity, Clock, Moon, Pencil, Sun, Trash2, UtensilsCrossed } from 'lucide-react'
import { formatDuration, formatTime } from '../utils/dateUtils'
import { BEDTIME_DIGESTION_STATES, BEDTIME_STRESS_LEVELS } from '../utils/constants'
import SeverityBadge from './SeverityBadge'

const META = {
  meal: { label: 'Meal', Icon: UtensilsCrossed, tile: 'bg-sage-soft text-sage' },
  wake: { label: 'Wake-up', Icon: Sun, tile: 'bg-amber-soft text-amber' },
  bedtime: { label: 'Bedtime', Icon: Moon, tile: 'bg-teal-soft text-teal' },
  symptom: { label: 'Symptom', Icon: Activity, tile: 'bg-teal-soft text-teal' },
}

function titleFor(entry) {
  if (entry.type === 'meal') return entry.name
  if (entry.type === 'wake') return `Woke at ${formatTime(entry.timestamp)}`
  if (entry.type === 'bedtime') return 'Bedtime'
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
    const detail =
      entry.type === 'meal'
        ? entry.tags?.join(', ')
        : entry.type === 'wake'
          ? entry.symptoms?.join(', ')
          : entry.type === 'bedtime'
            ? entry.symptoms?.length
              ? entry.symptoms.join(', ')
              : 'No symptoms noted'
            : `${entry.severity ? `Severity ${entry.severity}` : ''}${entry.durationMin ? ` · Lasted ${formatDuration(entry.durationMin)}` : ''}`
    const bedtimeStress =
      entry.type === 'bedtime' ? BEDTIME_STRESS_LEVELS.find((level) => level.value === entry.stressLevel)?.label : null
    const bedtimeDigestion =
      entry.type === 'bedtime' ? BEDTIME_DIGESTION_STATES.find((state) => state.value === entry.digestionState)?.label : null
    return (
      <div className="flex items-start gap-4 rounded-3xl bg-card p-5 shadow-sm">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tile}`}>
          <Icon size={20} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold">{entry.type === 'wake' ? 'Wake-up' : titleFor(entry)}</p>
            <p className="shrink-0 text-sm text-muted">{sub}</p>
          </div>
          {detail && <p className="mt-1 text-sm leading-5 text-muted">{detail}</p>}
          {(bedtimeStress || bedtimeDigestion || (entry.type === 'wake' && entry.severity > 0)) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {bedtimeStress && <span className="rounded-full bg-chip px-3 py-1 text-xs font-medium text-ink">{bedtimeStress}</span>}
              {bedtimeDigestion && (
                <span className="rounded-full bg-chip px-3 py-1 text-xs font-medium text-ink">{bedtimeDigestion}</span>
              )}
              {entry.type === 'wake' && entry.severity > 0 && (
                <span className="rounded-full bg-chip px-3 py-1 text-xs font-medium text-ink">Severity {entry.severity}</span>
              )}
            </div>
          )}
          {entry.notes && <p className="mt-1 text-sm text-muted">{entry.notes}</p>}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 flex-col gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(entry)}
                aria-label={`Edit ${label.toLowerCase()}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-chip"
              >
                <Pencil size={16} aria-hidden />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(entry)}
                aria-label={`Delete ${label.toLowerCase()}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            )}
          </div>
        )}
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
            {(entry.type === 'symptom' || entry.type === 'wake' || (entry.type === 'bedtime' && entry.symptoms?.length > 0)) && (
              <SeverityBadge level={entry.severity} />
            )}
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
          {entry.type === 'bedtime' && (
            <div className="mt-1 space-y-1 text-sm text-muted">
              <p>Symptoms before bed: {entry.symptoms?.length ? entry.symptoms.join(', ') : 'None noted'}</p>
              <p>
                Stress: {BEDTIME_STRESS_LEVELS.find((level) => level.value === entry.stressLevel)?.label ?? 'Not recorded'}
              </p>
              <p>
                Digestion: {BEDTIME_DIGESTION_STATES.find((state) => state.value === entry.digestionState)?.label ?? 'Not recorded'}
              </p>
            </div>
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
