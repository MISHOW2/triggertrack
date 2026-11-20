import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Toggle from '../components/Toggle'
import useLocalStorage from '../hooks/useLocalStorage'
import { KEYS, readJSON } from '../data/storage'
import { DEFAULT_REMINDERS } from '../hooks/useReminders'
import { inputClass } from '../components/fields'

const DAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']

function TimeInput({ value, onChange, label }) {
  return <input type="time" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} !min-h-10 !w-auto px-3 text-sm`} />
}

function Row({ item, title, sub, onToggle, children }) {
  return (
    <div className="py-3">
      <div className="flex min-h-12 items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{title}</p>
          <p className="text-xs text-muted">{sub}</p>
        </div>
        <Toggle checked={Boolean(item.on)} onChange={onToggle} label={title} />
      </div>
      {item.on && children && <div className="mt-2 flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export default function RemindersScreen({ onNavigate }) {
  const [stored, setStored] = useLocalStorage(KEYS.reminders, DEFAULT_REMINDERS)
  const cfg = { ...DEFAULT_REMINDERS, ...stored }
  const [permission, setPermission] = useState(() => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission))
  const meds = readJSON(KEYS.meds, []).filter((m) => m.kind === 'daily')

  const patch = (key, change) => setStored({ ...cfg, [key]: { ...cfg[key], ...change } })

  const turnOn = async (key, on) => {
    patch(key, { on })
    if (on && permission === 'default') {
      try {
        setPermission(await Notification.requestPermission())
      } catch {
        // ignore
      }
    }
  }

  return (
    <>
      <PageHeader title="Reminders" subtitle="Nudges you control" onBack={() => onNavigate('settings')} />

      <section className="mb-4 divide-y divide-line rounded-3xl border border-line bg-card px-4">
        <Row item={cfg.meals} onToggle={(on) => turnOn('meals', on)} title="Log meals" sub={`If nothing logged by ${cfg.meals.time}`}>
          <TimeInput label="Meal reminder time" value={cfg.meals.time} onChange={(time) => patch('meals', { time })} />
        </Row>
        <Row item={cfg.bedtime} onToggle={(on) => turnOn('bedtime', on)} title="Bedtime log" sub={`Every day at ${cfg.bedtime.time}`}>
          <TimeInput label="Bedtime reminder time" value={cfg.bedtime.time} onChange={(time) => patch('bedtime', { time })} />
        </Row>
        <Row item={cfg.medication} onToggle={(on) => turnOn('medication', on)} title="Medication" sub={meds[0] ? `${meds[0].name} · ${cfg.medication.time}` : `Daily at ${cfg.medication.time}`}>
          <TimeInput label="Medication reminder time" value={cfg.medication.time} onChange={(time) => patch('medication', { time })} />
        </Row>
        <Row item={cfg.weekly} onToggle={(on) => turnOn('weekly', on)} title="Weekly questionnaire" sub={`${DAYS[cfg.weekly.day]} at ${cfg.weekly.time}`}>
          <select aria-label="Day of the week" value={cfg.weekly.day} onChange={(e) => patch('weekly', { day: Number(e.target.value) })} className={`${inputClass} !min-h-10 !w-auto px-3 text-sm`}>
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <TimeInput label="Questionnaire reminder time" value={cfg.weekly.time} onChange={(time) => patch('weekly', { time })} />
        </Row>
        <Row item={cfg.wake} onToggle={(on) => turnOn('wake', on)} title="Wake-up log" sub={cfg.wake.on ? 'On: a prompt when you open the app in the morning' : 'Off · you log on opening'} />
      </section>

      <section className="mb-4 rounded-3xl bg-sage-soft p-4">
        <h2 className="font-bold text-sage">Quiet hours</h2>
        <p className="mt-1 text-sm text-muted">No reminders between these times. Reminders stay on this phone.</p>
        <div className="mt-3 flex items-center gap-2">
          <TimeInput label="Quiet hours start" value={cfg.quiet.start} onChange={(start) => patch('quiet', { start })} />
          <span className="text-sm text-muted">to</span>
          <TimeInput label="Quiet hours end" value={cfg.quiet.end} onChange={(end) => patch('quiet', { end })} />
        </div>
      </section>

      <section className="mb-4 rounded-3xl border border-line bg-card p-4">
        <h2 className="font-bold">Gentle, not naggy</h2>
        <p className="mt-1 text-sm text-muted">One nudge per reminder per day. Missed a day? No streaks broken, no guilt badges.</p>
        <p className="mt-3 text-xs text-muted">
          {permission === 'unsupported'
            ? 'This browser cannot show system notifications, so reminders appear on the Home screen while the app is open.'
            : permission === 'denied'
              ? 'Notifications are blocked for this app. Reminders still appear on the Home screen while the app is open.'
              : 'Reminders appear on the Home screen while the app is open. In the Android app they can also arrive as notifications.'}
        </p>
      </section>
    </>
  )
}
