import { useState } from 'react'
import { Activity, ChevronRight, Moon, Sun, UtensilsCrossed } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import BedtimeForm from './BedtimeForm'
import MealForm from './MealForm'
import WakeForm from './WakeForm'
import SymptomForm from './SymptomForm'
import SymptomTimer from './SymptomTimer'

export const LOG_OPTIONS = [
  { id: 'log-meal', title: 'Log a meal', sub: 'Food, trigger tags, and notes', Icon: UtensilsCrossed, color: 'bg-sage' },
  { id: 'log-wake', title: 'Log wake-up', sub: 'Wake time and morning symptoms', Icon: Sun, color: 'bg-amber' },
  { id: 'log-bedtime', title: 'Log bedtime', sub: 'Time and how you feel before sleep', Icon: Moon, color: 'bg-teal' },
  { id: 'log-timer', title: 'Start symptom timer', sub: 'Track how long a flare-up lasts', Icon: Activity, color: 'bg-teal' },
]

export function ActionButton({ option, onClick, running }) {
  const { title, sub, Icon, color } = option
  return (
    <button
      onClick={onClick}
      className={`flex min-h-20 w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-white shadow-sm transition-transform active:scale-[0.99] ${color}`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
        <Icon size={24} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold">{running ? 'Symptom timer running' : title}</span>
        <span className="block text-sm opacity-90">{running ? 'Tap to view or stop it' : sub}</span>
      </span>
      <ChevronRight size={20} aria-hidden className="shrink-0 opacity-80" />
    </button>
  )
}

// The Log tab: a menu, plus the form for whichever option is picked.
export default function LogScreen({ view, onNavigate, entries, timer, setTimer }) {
  const { addEntry } = entries
  const [manualEpisode, setManualEpisode] = useState(false)

  const finish = () => onNavigate('home')
  const save = (entry) => {
    addEntry(entry)
    finish()
  }

  if (view === 'log-meal') {
    return (
      <>
        <PageHeader title="Log a meal" onBack={() => onNavigate('log')} />
        <MealForm onSave={save} />
      </>
    )
  }

  if (view === 'log-wake') {
    return (
      <>
        <PageHeader title="Log wake-up" onBack={() => onNavigate('log')} />
        <WakeForm onSave={save} />
      </>
    )
  }

  if (view === 'log-bedtime') {
    return <BedtimeForm onSave={save} onCancel={() => onNavigate('log')} />
  }

  if (view === 'log-timer') {
    return (
      <>
        <PageHeader title="Symptom timer" onBack={() => onNavigate('log')} />
        {manualEpisode ? (
          <>
            <p className="mb-4 text-sm text-muted">Forgot to start the timer? Enter the episode by hand.</p>
            <SymptomForm onSave={save} submitLabel="Save episode" />
            <button onClick={() => setManualEpisode(false)} className="mt-3 min-h-11 w-full text-sm font-medium text-sage hover:underline">
              Back to timer
            </button>
          </>
        ) : (
          <>
            <SymptomTimer timer={timer} setTimer={setTimer} onSaveEpisode={addEntry} onDone={finish} />
            {!timer && (
              <button onClick={() => setManualEpisode(true)} className="mt-4 min-h-11 w-full text-sm font-medium text-sage hover:underline">
                Log a past episode by hand
              </button>
            )}
          </>
        )}
      </>
    )
  }

  return (
    <>
      <PageHeader title="Log something" subtitle="What would you like to track?" />
      <div className="flex flex-col gap-3">
        {LOG_OPTIONS.map((o) => (
          <ActionButton key={o.id} option={o} running={o.id === 'log-timer' && Boolean(timer)} onClick={() => onNavigate(o.id)} />
        ))}
      </div>
    </>
  )
}
