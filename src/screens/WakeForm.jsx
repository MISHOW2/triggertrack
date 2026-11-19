import { useState } from 'react'
import SeverityPicker from '../components/SeverityPicker'
import TagButton from '../components/TagButton'
import { Field, PrimaryButton, inputClass } from '../components/fields'
import { WAKE_SYMPTOMS } from '../utils/constants'
import { fromLocalInput, toLocalInput } from '../utils/dateUtils'

export default function WakeForm({ initial, onSave, submitLabel = 'Save wake-up' }) {
  const [when, setWhen] = useState(toLocalInput(initial?.timestamp ?? new Date()))
  const [symptoms, setSymptoms] = useState(initial?.symptoms ?? [])
  const [severity, setSeverity] = useState(initial?.severity ?? 0)
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const toggle = (s) => setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const submit = (e) => {
    e.preventDefault()
    // No symptoms picked means severity 0; picking symptoms with severity 0 bumps it to 1
    const fixedSeverity = symptoms.length === 0 ? 0 : Math.max(severity, 1)
    onSave({ type: 'wake', timestamp: fromLocalInput(when), symptoms, severity: fixedSeverity, notes: notes.trim() })
  }

  return (
    <form onSubmit={submit}>
      <Field label="What time did you wake up?" htmlFor="wake-when">
        <input id="wake-when" type="datetime-local" className={inputClass} value={when} onChange={(e) => setWhen(e.target.value)} required />
      </Field>

      <Field label="Symptoms on waking (leave empty if none)">
        <div className="flex flex-wrap gap-2">
          {WAKE_SYMPTOMS.map((s) => (
            <TagButton key={s} label={s} selected={symptoms.includes(s)} onToggle={() => toggle(s)} />
          ))}
        </div>
      </Field>

      {symptoms.length > 0 && (
        <Field label="How bad were they?">
          <SeverityPicker value={Math.max(severity, 1)} onChange={setSeverity} />
        </Field>
      )}

      <Field label="Notes (optional)" htmlFor="wake-notes">
        <textarea id="wake-notes" rows={2} className={`${inputClass} py-3`} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
    </form>
  )
}
