import { useState } from 'react'
import SeverityPicker from '../components/SeverityPicker'
import TagButton from '../components/TagButton'
import { Field, PrimaryButton, inputClass } from '../components/fields'
import { BEDTIME_DIGESTION_STATES, BEDTIME_STRESS_LEVELS, SYMPTOM_TYPES } from '../utils/constants'
import { fromLocalInput, toLocalInput } from '../utils/dateUtils'

export default function BedtimeForm({ initial, onSave, submitLabel = 'Save bedtime' }) {
  const [when, setWhen] = useState(toLocalInput(initial?.timestamp ?? new Date()))
  const [symptoms, setSymptoms] = useState(initial?.symptoms ?? [])
  const [severity, setSeverity] = useState(initial?.severity ?? 0)
  const [stressLevel, setStressLevel] = useState(initial?.stressLevel ?? null)
  const [digestionState, setDigestionState] = useState(initial?.digestionState ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const toggleSymptom = (symptom) =>
    setSymptoms((previous) =>
      previous.includes(symptom) ? previous.filter((item) => item !== symptom) : [...previous, symptom],
    )

  const submit = (event) => {
    event.preventDefault()
    const fixedSeverity = symptoms.length === 0 ? 0 : Math.max(severity, 1)

    onSave({
      type: 'bedtime',
      timestamp: fromLocalInput(when),
      symptoms,
      severity: fixedSeverity,
      stressLevel,
      digestionState,
      notes: notes.trim(),
    })
  }

  return (
    <form onSubmit={submit}>
      <Field label="What time are you going to bed?" htmlFor="bedtime-when">
        <input
          id="bedtime-when"
          type="datetime-local"
          className={inputClass}
          value={when}
          onChange={(event) => setWhen(event.target.value)}
          required
        />
      </Field>

      <Field label="Any LPR symptoms right now? (select any that apply)">
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_TYPES.map((symptom) => (
            <TagButton
              key={symptom}
              label={symptom}
              selected={symptoms.includes(symptom)}
              onToggle={() => toggleSymptom(symptom)}
            />
          ))}
        </div>
      </Field>

      {symptoms.length > 0 && (
        <Field label="How strong are the symptoms?">
          <SeverityPicker value={Math.max(severity, 1)} onChange={setSeverity} />
        </Field>
      )}

      <ChoiceGroup
        name="bedtime-stress"
        legend="How relaxed or stressed do you feel?"
        value={stressLevel}
        onChange={setStressLevel}
        options={BEDTIME_STRESS_LEVELS}
      />

      <ChoiceGroup
        name="bedtime-digestion"
        legend="How does your digestion or fullness feel?"
        value={digestionState}
        onChange={setDigestionState}
        options={BEDTIME_DIGESTION_STATES}
      />

      <Field label="Notes (optional)" htmlFor="bedtime-notes">
        <textarea
          id="bedtime-notes"
          rows={2}
          className={`${inputClass} py-3`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Anything else you noticed..."
        />
      </Field>

      <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
    </form>
  )
}

function ChoiceGroup({ name, legend, value, onChange, options }) {
  return (
    <fieldset className="mb-5">
      <legend className="mb-2 block text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value
          return (
            <label key={option.value} className="cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                required
              />
              <span
                className={`flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-teal peer-focus-visible:outline-offset-2 ${
                  selected ? 'border-sage bg-sage text-white' : 'border-line bg-card text-ink hover:bg-chip'
                }`}
              >
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
