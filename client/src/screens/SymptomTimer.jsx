import { useEffect, useState } from 'react'
import { ChevronUp, Play, Plus, Square, Timer } from 'lucide-react'
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
  const [detailsOpen, setDetailsOpen] = useState(false)

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
      <div className="mb-6 rounded-[2rem] border border-line bg-sage-soft px-5 py-8 text-center sm:px-8">
        <p className="mb-5 text-sm font-medium text-muted">
          {running ? 'Symptoms are being timed' : 'Ready when you are'}
        </p>
        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-4 border-sage/30 text-sage">
          <Timer size={43} strokeWidth={1.8} aria-hidden />
        </div>
        <p className="mt-5 font-mono text-4xl font-bold tabular-nums tracking-wider text-sage sm:text-5xl" role="timer" aria-live="off">
          {formatClock(elapsedSeconds)}
        </p>
        <button
          type="button"
          onClick={running ? stop : start}
          aria-label={running ? 'Stop and save symptom timer' : 'Start symptom timer'}
          className="mx-auto mt-5 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-teal text-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          {running ? <Square size={24} fill="currentColor" aria-hidden /> : <Play size={25} fill="currentColor" aria-hidden />}
        </button>
        <p className="mt-3 text-sm font-medium text-muted">{running ? 'Tap to stop and save' : 'Tap to start'}</p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-line bg-sage-soft">
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
          className="flex min-h-20 w-full items-center gap-3 px-5 py-4 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Add details <span className="font-normal text-muted">(optional)</span></span>
            <span className="mt-1 block text-sm text-muted">Symptom type, severity, and a note</span>
          </span>
          {detailsOpen ? <ChevronUp size={21} className="text-sage" aria-hidden /> : <Plus size={21} className="text-sage" aria-hidden />}
        </button>

        {detailsOpen && (
          <div className="border-t border-line px-5 pt-5">
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
          </div>
        )}
      </section>

      {running && (
        <button onClick={cancel} className="min-h-11 w-full text-sm font-medium text-muted hover:underline">
          Discard timer
        </button>
      )}
    </div>
  )
}
