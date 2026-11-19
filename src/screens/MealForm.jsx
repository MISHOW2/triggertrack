import { useState } from 'react'
import TagButton from '../components/TagButton'
import { Field, PrimaryButton, inputClass } from '../components/fields'
import { TRIGGER_TAGS } from '../utils/constants'
import { fromLocalInput, toLocalInput } from '../utils/dateUtils'

// Used both for logging a new meal and for editing one (pass `initial`)
export default function MealForm({ initial, onSave, submitLabel = 'Save meal' }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [when, setWhen] = useState(toLocalInput(initial?.timestamp ?? new Date()))
  const [tags, setTags] = useState(initial?.tags ?? [])
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const toggle = (tag) => setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))

  const submit = (e) => {
    e.preventDefault()
    onSave({ type: 'meal', name: name.trim(), timestamp: fromLocalInput(when), tags, notes: notes.trim() })
  }

  return (
    <form onSubmit={submit}>
      <Field label="What did you eat or drink?" htmlFor="meal-name">
        <input
          id="meal-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chicken curry"
          required
        />
      </Field>

      <Field label="When?" htmlFor="meal-when">
        <input id="meal-when" type="datetime-local" className={inputClass} value={when} onChange={(e) => setWhen(e.target.value)} required />
      </Field>

      <Field label="Possible triggers (tap any that apply)">
        <div className="flex flex-wrap gap-2">
          {TRIGGER_TAGS.map((t) => (
            <TagButton key={t} label={t} selected={tags.includes(t)} onToggle={() => toggle(t)} />
          ))}
        </div>
      </Field>

      <Field label="Notes (optional)" htmlFor="meal-notes">
        <textarea
          id="meal-notes"
          rows={2}
          className={`${inputClass} py-3`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Portion size, how it felt..."
        />
      </Field>

      <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
    </form>
  )
}
