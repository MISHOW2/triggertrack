import { Activity, Moon, Sun, UtensilsCrossed } from 'lucide-react'
import { Logo } from '../components/NavBar'
import EntryCard from '../components/EntryCard'
import SeverityBadge from '../components/SeverityBadge'
import { ActionButton, LOG_OPTIONS } from './LogScreen'
import { formatDuration, formatTime, isSameDay } from '../utils/dateUtils'

export default function HomeScreen({ entries, timer, onNavigate }) {
  const today = new Date()
  const todays = entries.filter((e) => isSameDay(e.timestamp, today))

  const meals = todays.filter((e) => e.type === 'meal')
  const wake = todays.find((e) => e.type === 'wake') // entries are newest-first
  const bedtime = todays.find((e) => e.type === 'bedtime') // entries are newest-first
  const episodes = todays.filter((e) => e.type === 'symptom')
  const episodeMinutes = episodes.reduce((sum, e) => sum + (e.durationMin || 0), 0)

  return (
    <>
      <header className="mb-5 flex items-center gap-3">
        <div className="md:hidden">
          <Logo size={44} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">TriggerTrack</h1>
          <p className="text-sm text-muted">
            {today.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      <section className="mb-6 rounded-3xl border border-line bg-card p-4" aria-label="Today at a glance">
        <h2 className="mb-3 font-semibold">Today at a glance</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Stat Icon={UtensilsCrossed} tone="bg-chip" value={meals.length} label={meals.length === 1 ? 'meal logged' : 'meals logged'} />
          <Stat Icon={Sun} tone="bg-amber-soft" value={wake ? formatTime(wake.timestamp) : '—'} label="wake time" small />
          <Stat Icon={Moon} tone="bg-teal-soft" value={bedtime ? formatTime(bedtime.timestamp) : '—'} label="bedtime" small />
          <Stat
            Icon={Activity}
            tone="bg-teal-soft"
            value={episodes.length}
            label={episodes.length ? formatDuration(episodeMinutes) : 'episodes'}
          />
        </div>
        {wake && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-chip px-3 py-2 text-sm">
            <span className="text-muted">Symptoms on waking:</span>
            <SeverityBadge level={wake.severity} />
          </div>
        )}
      </section>

      <h2 className="mb-3 font-semibold text-muted">Quick actions</h2>
      <div className="mb-6 flex flex-col gap-3">
        {LOG_OPTIONS.map((o) => (
          <ActionButton key={o.id} option={o} running={o.id === 'log-timer' && Boolean(timer)} onClick={() => onNavigate(o.id)} />
        ))}
      </div>

      <h2 className="mb-3 font-semibold text-muted">Today's log</h2>
      {todays.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">
          Nothing logged yet today. Tap a quick action above to start.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {todays.map((e) => (
            <EntryCard key={e.id} entry={e} compact />
          ))}
        </div>
      )}
    </>
  )
}

function Stat({ Icon, tone, value, label, small }) {
  return (
    <div className={`rounded-2xl p-3 ${tone}`}>
      <Icon size={17} className="mb-2 text-muted" aria-hidden />
      <p className={`font-bold leading-none ${small ? 'text-lg sm:text-2xl' : 'text-2xl'}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  )
}
