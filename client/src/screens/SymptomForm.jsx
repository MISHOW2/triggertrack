import { useState } from 'react'
import SeverityPicker from '../components/SeverityPicker'
import TagButton from '../components/TagButton'
import { Field, PrimaryButton, inputClass } from '../components/fields'
import { SYMPTOM_TYPES } from '../utils/constants'
import { fromLocalInput, toLocalInput } from '../utils/dateUtils'

// Manual entry / editing of a symptom episode (the live timer is in SymptomTimer.jsx)
export default function SymptomForm({ initial, onSave, submitLabel = 'Save episode' }) {
  const [when, setWhen] = useState(toLocalInput(initial?.timestamp ?? new Date()))
  const [duration, setDuration] = useState(String(initial?.durationMin ?? 30))
  const [symptomType, setSymptomType] = useState(initial?.symptomType ?? SYMPTOM_TYPES[0])
  const [severity, setSeverity] = useState(initial?.severity ?? 3)
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const submit = (e) => {
    e.preventDefault()
    onSave({
      type: 'symptom',
      timestamp: fromLocalInput(when),
      durationMin: Math.max(1, Number(duration) || 1),
      symptomType,
      severity,
      notes: notes.trim(),
    })
  }

  return (
    <form onSubmit={submit}>
      <Field label="When did it start?" htmlFor="sym-when">
        <input id="sym-when" type="datetime-local" className={inputClass} value={when} onChange={(e) => setWhen(e.target.value)} required />
      </Field>

      <Field label="How long did it last (minutes)?" htmlFor="sym-dur">
        <input id="sym-dur" type="number" inputMode="numeric" min="1" className={inputClass} value={duration} onChange={(e) => setDuration(e.target.value)} required />
      </Field>

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

      <Field label="Notes (optional)" htmlFor="sym-notes">
        <textarea id="sym-notes" rows={2} className={`${inputClass} py-3`} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
    </form>
  )
}
