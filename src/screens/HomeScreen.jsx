import { Activity, Bell, Check, Moon, Sun, UtensilsCrossed } from 'lucide-react'
import SyncBanner from '../components/SyncBanner'
import { REMINDER_COPY } from '../hooks/useReminders'
import { Logo } from '../components/NavBar'
import TodayCarousel from '../components/TodayCarousel'
import SeverityBadge from '../components/SeverityBadge'
import { ActionButton, LOG_OPTIONS } from './LogScreen'
import { formatDuration, formatTime, isSameDay } from '../utils/dateUtils'

const REMINDER_TARGET = { meals: 'log-meal', bedtime: 'log-bedtime', medication: 'medications', weekly: 'questionnaire', wake: 'log-wake' }

export default function HomeScreen({ entries, timer, onNavigate, notice = false, due = [], onDismissReminder }) {
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

      <SyncBanner onNavigate={onNavigate} />

      {due.map((id) => (
        <div key={id} className="mb-3 flex items-center gap-3 rounded-2xl bg-sage-soft p-3 text-sage">
          <Bell size={18} className="shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight">{REMINDER_COPY[id].title}</p>
            <p className="text-xs text-muted">{REMINDER_COPY[id].text}</p>
          </div>
          <button onClick={() => { onDismissReminder?.(id); onNavigate(REMINDER_TARGET[id]) }} className="min-h-10 rounded-full bg-sage px-4 text-xs font-bold text-white">
            Open
          </button>
          <button onClick={() => onDismissReminder?.(id)} className="min-h-10 px-2 text-xs font-semibold text-muted">
            Dismiss
          </button>
        </div>
      ))}

      <section className="hero-bg mb-6 rounded-[2rem] p-5 text-white shadow-lg" aria-label="Today at a glance">
        <h2 className="mb-4 text-lg font-bold">Today at a glance</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Stat Icon={UtensilsCrossed} tone="bg-black/15" value={meals.length} label={meals.length === 1 ? 'meal logged' : 'meals logged'} />
          <Stat Icon={Sun} tone="bg-black/15" value={wake ? formatTime(wake.timestamp) : '—'} label="wake time" small />
          <Stat Icon={Moon} tone="bg-black/15" value={bedtime ? formatTime(bedtime.timestamp) : '—'} label="bedtime" small />
          <Stat
            Icon={Activity}
            tone="bg-black/15"
            value={episodes.length}
            label={episodes.length ? formatDuration(episodeMinutes) : 'episodes'}
          />
        </div>
        {wake && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/15 px-3 py-2 text-sm">
            <span>Symptoms on waking:</span>
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

      {notice && (
        <div role="status" className="mb-6 flex items-center gap-3 rounded-2xl bg-sage-soft p-4 text-sage">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage text-white">
            <Check size={16} aria-hidden />
          </span>
          <div>
            <p className="font-bold leading-tight">Saved on this phone</p>
            <p className="text-sm text-muted">Your entry has been added.</p>
          </div>
        </div>
      )}

      {todays.length === 0 ? (
        <>
          <h2 className="mb-3 font-semibold text-muted">Today's log</h2>
          <p className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">
            Nothing logged yet today. Tap a quick action above to start.
          </p>
        </>
      ) : (
        <TodayCarousel entries={todays} onSeeAll={() => onNavigate('history')} />
      )}
    </>
  )
}

function Stat({ Icon, tone, value, label, small }) {
  return (
    <div className={`rounded-2xl p-3 ${tone}`}>
      <Icon size={17} className="mb-2" aria-hidden />
      <p className={`font-bold leading-none ${small ? 'text-lg sm:text-2xl' : 'text-2xl'}`}>{value}</p>
      <p className="mt-1 text-xs">{label}</p>
    </div>
  )
}
