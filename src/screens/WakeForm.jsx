import { useState } from 'react'
import { Plus, Save, Sun, X } from 'lucide-react'
import SeverityPicker from '../components/SeverityPicker'
import { Field, PrimaryButton, inputClass } from '../components/fields'
import { WAKE_SYMPTOMS } from '../utils/constants'
import { fromLocalInput, toLocalInput } from '../utils/dateUtils'

export default function WakeForm({ initial, onSave, submitLabel = 'Save wake-up' }) {
  const [when, setWhen] = useState(toLocalInput(initial?.timestamp ?? new Date()))
  const [symptoms, setSymptoms] = useState(initial?.symptoms ?? [])
  const [severity, setSeverity] = useState(initial?.severity ?? 0)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [customSymptom, setCustomSymptom] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const addSymptom = (symptom) => {
    const clean = symptom.trim()
    if (clean && !symptoms.some((item) => item.toLocaleLowerCase() === clean.toLocaleLowerCase())) {
      setSymptoms((previous) => [...previous, clean])
    }
  }

  const selectSymptom = (event) => {
    const value = event.target.value
    event.target.value = ''
    if (value === '__other__') {
      setShowCustomInput(true)
    } else if (value === '__none__') {
      setSymptoms([])
    } else if (value) {
      addSymptom(value)
    }
  }

  const addCustomSymptom = () => {
    addSymptom(customSymptom)
    setCustomSymptom('')
    setShowCustomInput(false)
  }

  const submit = (e) => {
    e.preventDefault()
    // No symptoms picked means severity 0; picking symptoms with severity 0 bumps it to 1
    const fixedSeverity = symptoms.length === 0 ? 0 : Math.max(severity, 1)
    onSave({ type: 'wake', timestamp: fromLocalInput(when), symptoms, severity: fixedSeverity, notes: notes.trim() })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber">
            <Sun size={21} aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold">What time did you wake up?</h2>
            <p className="text-xs text-muted">Prefilled to now — adjust if needed.</p>
          </div>
        </div>
        <input
          id="wake-when"
          type="datetime-local"
          aria-label="What time did you wake up?"
          className={inputClass}
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          required
        />
      </section>

      <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">How are you feeling this morning?</h2>
        <p className="mt-1 text-xs text-muted">Optional — choose any symptoms you noticed.</p>

        <Field label="Select a symptom" htmlFor="wake-symptom-select">
          <select id="wake-symptom-select" className={inputClass} defaultValue="" onChange={selectSymptom}>
            <option value="" disabled>
              Choose a symptom
            </option>
            {WAKE_SYMPTOMS.map((symptom) => (
              <option key={symptom} value={symptom}>
                {symptom}
              </option>
            ))}
            <option value="__other__">Other — type your own</option>
            <option value="__none__">No symptoms</option>
          </select>
        </Field>

        {showCustomInput && (
          <div className="mb-5 flex gap-2">
            <input
              autoFocus
              className={inputClass}
              value={customSymptom}
              onChange={(event) => setCustomSymptom(event.target.value)}
              placeholder="Type a symptom"
              aria-label="Custom symptom"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addCustomSymptom()
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomSymptom}
              disabled={!customSymptom.trim()}
              aria-label="Add custom symptom"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage text-white disabled:opacity-40"
            >
              <Plus size={20} aria-hidden />
            </button>
          </div>
        )}

        {symptoms.length > 0 ? (
          <ul className="mb-5 flex flex-wrap gap-2" aria-label="Selected symptoms">
            {symptoms.map((symptom) => (
              <li key={symptom}>
                <button
                  type="button"
                  onClick={() => setSymptoms((previous) => previous.filter((item) => item !== symptom))}
                  aria-label={`Remove ${symptom}`}
                  className="flex min-h-10 items-center gap-2 rounded-full border border-line bg-app px-4 text-sm text-ink"
                >
                  {symptom}
                  <X size={15} className="text-muted" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-5 rounded-xl border border-line bg-app px-4 py-3 text-sm text-muted">No symptoms selected.</p>
        )}

        {symptoms.length > 0 && (
          <Field label="How bad were they?">
            <SeverityPicker value={Math.max(severity, 1)} onChange={setSeverity} />
          </Field>
        )}
      </section>

      <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
        <Field label="Notes (optional)" htmlFor="wake-notes">
          <textarea
            id="wake-notes"
            rows={3}
            className={`${inputClass} py-3`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else worth noting..."
          />
        </Field>
      </section>
      <PrimaryButton type="submit" className="bg-amber">
        <span className="flex items-center justify-center gap-2">
          <Save size={18} aria-hidden />
          {submitLabel}
        </span>
      </PrimaryButton>
    </form>
  )
}
