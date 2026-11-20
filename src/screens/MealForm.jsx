import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import TagButton from '../components/TagButton'
import { Field, PrimaryButton, inputClass } from '../components/fields'
import { TRIGGER_TAGS } from '../utils/constants'
import { fromLocalInput, toLocalInput } from '../utils/dateUtils'

const FEATURED_TRIGGERS = ['Coffee', 'Tomato', 'Citrus', 'Fried food', 'Chocolate']
const TRIGGER_EMOJI = {
  Coffee: '☕',
  Tomato: '🍅',
  Citrus: '🍋',
  'Fried food': '🍟',
  Chocolate: '🍫',
}

// Used both for logging a new meal and for editing one (pass `initial`)
export default function MealForm({ initial, onSave, submitLabel = 'Save meal' }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [when, setWhen] = useState(toLocalInput(initial?.timestamp ?? new Date()))
  const [tags, setTags] = useState(initial?.tags ?? [])
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [showAllTriggers, setShowAllTriggers] = useState(false)

  const toggle = (tag) => setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  const visibleTriggers = showAllTriggers
    ? TRIGGER_TAGS
    : [
        ...FEATURED_TRIGGERS.filter((tag) => TRIGGER_TAGS.includes(tag)),
        ...tags.filter((tag) => TRIGGER_TAGS.includes(tag) && !FEATURED_TRIGGERS.includes(tag)),
      ]

  const submit = (e) => {
    e.preventDefault()
    onSave({ type: 'meal', name: name.trim(), timestamp: fromLocalInput(when), tags, notes: notes.trim() })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
        <Field label="When did you eat?" htmlFor="meal-when">
          <input
            id="meal-when"
            type="datetime-local"
            className={inputClass}
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            required
          />
        </Field>
      </section>

      <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
        <Field label="What did you eat?" htmlFor="meal-name">
          <input
            id="meal-name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grilled chicken salad"
            required
          />
        </Field>
      </section>

      <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Possible triggers</h2>
        <p className="mt-1 text-xs text-muted">Optional — choose only what applies.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleTriggers.map((tag) => (
            <TagButton
              key={tag}
              label={
                <span className="flex items-center gap-2">
                  <span aria-hidden>{TRIGGER_EMOJI[tag] ?? '•'}</span>
                  {tag}
                </span>
              }
              selected={tags.includes(tag)}
              onToggle={() => toggle(tag)}
            />
          ))}
        </div>
        {TRIGGER_TAGS.length > FEATURED_TRIGGERS.length && (
          <button
            type="button"
            onClick={() => setShowAllTriggers((show) => !show)}
            aria-expanded={showAllTriggers}
            className="mt-3 flex min-h-9 items-center gap-1 text-sm font-semibold text-teal"
          >
            {showAllTriggers ? 'Show fewer triggers' : 'Show more triggers'}
            {showAllTriggers ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
          </button>
        )}
      </section>

      <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
        <Field label="Notes (optional)" htmlFor="meal-notes">
          <textarea
            id="meal-notes"
            rows={3}
            className={`${inputClass} py-3`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else worth noting..."
          />
        </Field>
      </section>

      <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
    </form>
  )
}
