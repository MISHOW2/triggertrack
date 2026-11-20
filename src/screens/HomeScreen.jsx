import { Activity, ArrowRight, Bell, CalendarDays, ChartColumn, Check, ChevronRight, Moon, Settings, Sun, UtensilsCrossed } from 'lucide-react'
import SyncBanner from '../components/SyncBanner'
import { REMINDER_COPY } from '../hooks/useReminders'
import TodayCarousel from '../components/TodayCarousel'
import SeverityBadge from '../components/SeverityBadge'
import { formatTime, isSameDay } from '../utils/dateUtils'

const REMINDER_TARGET = { meals: 'log-meal', bedtime: 'log-bedtime', medication: 'medications', weekly: 'questionnaire', wake: 'log-wake' }

const QUICK_LOGS = [
  { view: 'log-meal', title: 'Meal', sub: 'Food & tags', Icon: UtensilsCrossed, tone: 'bg-sage-soft text-sage' },
  { view: 'log-bedtime', title: 'Bedtime', sub: 'Sleep & mood', Icon: Moon, tone: 'bg-teal-soft text-teal' },
  { view: 'log-timer', title: 'Episode', sub: 'Symptoms', Icon: Activity, tone: 'bg-amber-soft text-amber' },
]

function greetingFor(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getNextAction({ wake, meals, bedtime, timer, hour }) {
  if (timer) {
    return {
      title: 'Symptom timer running',
      sub: 'Continue or finish recording your episode.',
      button: 'Open timer',
      view: 'log-timer',
      Icon: Activity,
      tone: 'bg-amber-soft text-amber',
    }
  }
  if (!wake) {
    return {
      title: 'Log wake-up',
      sub: hour < 12 ? "It's morning — note when you woke and how you feel." : 'Note when you woke and how you feel today.',
      button: 'Log wake-up',
      view: 'log-wake',
      Icon: Sun,
      tone: 'bg-amber-soft text-amber',
    }
  }
  if (meals.length === 0) {
    return {
      title: 'Log a meal',
      sub: 'Add what you ate and any tags you want to track.',
      button: 'Log a meal',
      view: 'log-meal',
      Icon: UtensilsCrossed,
      tone: 'bg-sage-soft text-sage',
    }
  }
  if (!bedtime) {
    return {
      title: 'Log bedtime',
      sub: 'Check in with how you feel before sleep.',
      button: 'Log bedtime',
      view: 'log-bedtime',
      Icon: Moon,
      tone: 'bg-teal-soft text-teal',
    }
  }
  return {
    title: 'Log an episode',
    sub: 'Track symptoms and how long they last.',
    button: 'Log an episode',
    view: 'log-timer',
    Icon: Activity,
    tone: 'bg-amber-soft text-amber',
  }
}

export default function HomeScreen({ entries, timer, onNavigate, notice = false, due = [], onDismissReminder }) {
  const today = new Date()
  const todays = entries.filter((entry) => isSameDay(entry.timestamp, today))
  const meals = todays.filter((entry) => entry.type === 'meal')
  const wake = todays.find((entry) => entry.type === 'wake')
  const bedtime = todays.find((entry) => entry.type === 'bedtime')
  const episodes = todays.filter((entry) => entry.type === 'symptom')
  const nextAction = getNextAction({ wake, meals, bedtime, timer, hour: today.getHours() })

  return (
    <div className="mx-auto max-w-sm">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage to-teal text-sm font-bold text-white" aria-hidden>
            TT
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{greetingFor(today.getHours())}</p>
            <h1 className="truncate text-lg font-bold leading-tight">Your day</h1>
          </div>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          aria-label="Settings"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-card text-muted shadow-sm"
        >
          <Settings size={19} aria-hidden />
        </button>
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

      <section className="hero-bg mb-5 rounded-[2rem] p-4 text-white shadow-lg" aria-label="Today at a glance">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold">Today at a glance</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px]">
            <CalendarDays size={13} aria-hidden />
            {today.toLocaleDateString([], { weekday: 'long' })}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat Icon={UtensilsCrossed} value={meals.length} label="Meals" />
          <Stat Icon={Sun} value={wake ? formatTime(wake.timestamp) : '—'} label="Wake time" />
          <Stat Icon={Moon} value={bedtime ? formatTime(bedtime.timestamp) : '—'} label="Bedtime" />
          <Stat Icon={Activity} value={episodes.length} label="Episodes" />
        </div>
        {wake && (
          <div className="mt-2 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs">
            <span>Symptoms on waking:</span>
            <SeverityBadge level={wake.severity} />
          </div>
        )}
        <p className="mt-3 text-[11px] leading-snug text-white/80">
          {todays.length === 0
            ? 'Nothing logged yet today — start with one tap below.'
            : `${todays.length} ${todays.length === 1 ? 'entry' : 'entries'} logged today.`}
        </p>
      </section>

      <section className="mb-5" aria-labelledby="up-next-heading">
        <h2 id="up-next-heading" className="mb-2 text-sm font-semibold text-muted">Up next</h2>
        <div className="rounded-3xl border border-line bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${nextAction.tone}`}>
              <nextAction.Icon size={21} aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="font-bold leading-tight">{nextAction.title}</h3>
              <p className="mt-1 text-sm leading-snug text-muted">{nextAction.sub}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate(nextAction.view)}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-sage px-4 text-sm font-bold text-white"
          >
            {nextAction.button}
            <ArrowRight size={17} aria-hidden />
          </button>
        </div>
      </section>

      <section className="mb-5" aria-labelledby="quick-log-heading">
        <h2 id="quick-log-heading" className="mb-2 text-sm font-semibold text-muted">Quick log</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_LOGS.map((item) => (
            <QuickLog key={item.view} item={item} onClick={() => onNavigate(item.view)} />
          ))}
        </div>
      </section>

      <button
        onClick={() => onNavigate('insights')}
        className="mb-5 flex min-h-12 w-full items-center gap-3 rounded-full bg-chip px-4 py-3 text-left text-sm text-ink"
      >
        <ChartColumn size={18} className="shrink-0 text-sage" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="font-bold">See your patterns</span>
          <span> — open Insights</span>
        </span>
        <ChevronRight size={17} className="shrink-0 text-muted" aria-hidden />
      </button>

      {notice && (
        <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl bg-sage-soft p-4 text-sage">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage text-white">
            <Check size={16} aria-hidden />
          </span>
          <div>
            <p className="font-bold leading-tight">Saved on this phone</p>
            <p className="text-sm text-muted">Your entry has been added.</p>
          </div>
        </div>
      )}

      {todays.length > 0 && <TodayCarousel entries={todays} onSeeAll={() => onNavigate('history')} />}
    </div>
  )
}

function Stat({ Icon, value, label }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-full bg-white/15 px-2 py-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Icon size={16} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-bold leading-none">{value}</span>
        <span className="mt-1 block truncate text-[11px] leading-tight text-white/80">{label}</span>
      </span>
    </div>
  )
}

function QuickLog({ item, onClick }) {
  const { Icon, tone, title, sub } = item
  return (
    <button
      onClick={onClick}
      className="flex min-h-[126px] min-w-0 flex-col items-start rounded-3xl border border-line bg-card p-3 text-left shadow-sm"
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tone}`}>
        <Icon size={16} aria-hidden />
      </span>
      <span className="mt-3 block text-sm font-bold leading-tight">{title}</span>
      <span className="mt-0.5 block text-xs leading-tight text-muted">{sub}</span>
    </button>
  )
}
