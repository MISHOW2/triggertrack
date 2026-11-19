import { useEffect, useState } from 'react'
import { Play, Square } from 'lucide-react'
import SeverityPicker from '../components/SeverityPicker'
import TagButton from '../components/TagButton'
import { Field } from '../components/fields'
import { inputClass } from '../components/fields'
import { SYMPTOM_TYPES } from '../utils/constants'
import { formatClock, formatDuration } from '../utils/dateUtils'

// The timer stores its START TIME (not a counter). The display is recalculated from
// Date.now() every second, so it stays correct if the phone locks or the tab is closed.
export default function SymptomTimer({ timer, setTimer, onSaveEpisode, onDone }) {
  const [now, setNow] = useState(Date.now())
  const [symptomType, setSymptomType] = useState(timer?.symptomType ?? SYMPTOM_TYPES[0])
  const [severity, setSeverity] = useState(timer?.severity ?? 3)
  const [notes, setNotes] = useState(timer?.notes ?? '')
  const [saved, setSaved] = useState(null)

  const running = Boolean(timer)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  // Keep the chosen details saved while the timer runs, so a reload doesn't lose them
  useEffect(() => {
    if (running) setTimer((t) => (t ? { ...t, symptomType, severity, notes } : t))
  }, [symptomType, severity, notes]) // eslint-disable-line react-hooks/exhaustive-deps

  const elapsedSeconds = running ? (now - new Date(timer.startedAt).getTime()) / 1000 : 0

  const start = () => {
    setSaved(null)
    setNow(Date.now())
    setTimer({ startedAt: new Date().toISOString(), symptomType, severity, notes })
  }

  const stop = () => {
    const durationMin = Math.max(1, Math.round(elapsedSeconds / 60))
    onSaveEpisode({
      type: 'symptom',
      timestamp: timer.startedAt,
      durationMin,
      symptomType,
      severity,
      notes: notes.trim(),
    })
    setTimer(null)
    setSaved(durationMin)
  }

  const cancel = () => {
    if (window.confirm('Discard this timer without saving?')) setTimer(null)
  }

  if (saved !== null) {
    return (
      <div className="rounded-3xl border border-line bg-card p-6 text-center">
        <p className="text-lg font-bold">Episode saved</p>
        <p className="mt-1 text-muted">It lasted {formatDuration(saved)}. You can edit the details in History.</p>
        <button onClick={onDone} className="mt-5 min-h-12 w-full rounded-xl bg-sage px-5 font-bold text-white">
          Done
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        className={`mb-6 rounded-3xl p-6 text-center text-white ${running ? 'bg-teal' : 'bg-sage'}`}
        role="timer"
        aria-live="off"
      >
        <p className="text-sm font-medium opacity-90">{running ? 'Symptoms are being timed' : 'Ready when a flare-up starts'}</p>
        <p className="my-3 font-mono text-5xl font-bold tabular-nums">{formatClock(elapsedSeconds)}</p>
        {running ? (
          <button
            onClick={stop}
            className="mx-auto flex min-h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-white text-lg font-bold text-ink"
          >
            <Square size={20} fill="currentColor" aria-hidden /> Stop and save
          </button>
        ) : (
          <button
            onClick={start}
            className="mx-auto flex min-h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-white text-lg font-bold text-ink"
          >
            <Play size={20} fill="currentColor" aria-hidden /> Start timer
          </button>
        )}
      </div>

      <Field label="Main symptom">
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_TYPES.map((t) => (
            <TagButton key={t} label={t} selected={symptomType === t} onToggle={() => setSymptomType(t)} />
          ))}
        </div>
      </Field>

      <Field label="Severity">
        <SeverityPicker value={severity} onChange={setSeverity} />
      </Field>

      <Field label="Note (optional)" htmlFor="timer-notes">
        <textarea id="timer-notes" rows={2} className={`${inputClass} py-3`} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      {running && (
        <button onClick={cancel} className="min-h-11 w-full text-sm font-medium text-muted hover:underline">
          Discard timer
        </button>
      )}
    </div>
  )
}
