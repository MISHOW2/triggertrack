import { useState } from 'react'
import { Check, ChevronLeft } from 'lucide-react'
import { Field, inputClass } from '../components/fields'
import { BEDTIME_DIGESTION_STATES, BEDTIME_STRESS_LEVELS, SEVERITY_LABELS, SYMPTOM_TYPES } from '../utils/constants'
import { fromLocalInput, toLocalInput } from '../utils/dateUtils'

const STEPS = 4

export default function BedtimeForm({ initial, onSave, onCancel, submitLabel = initial ? 'Save changes' : 'Save bedtime' }) {
  const [step, setStep] = useState(1)
  const [when, setWhen] = useState(toLocalInput(initial?.timestamp ?? new Date()))
  const [symptoms, setSymptoms] = useState(initial?.symptoms ?? [])
  const [severity, setSeverity] = useState(initial?.severity ?? 0)
  const [stressLevel, setStressLevel] = useState(initial?.stressLevel ?? null)
  const [digestionState, setDigestionState] = useState(initial?.digestionState ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [stepError, setStepError] = useState('')

  const selectedStress = BEDTIME_STRESS_LEVELS.find((level) => level.value === stressLevel)
  const selectedDigestion = BEDTIME_DIGESTION_STATES.find((state) => state.value === digestionState)
  const selectedSeverity = symptoms.length ? SEVERITY_LABELS[Math.max(severity, 1)] : null
  const bedtimeDate = new Date(when)
  const isEditing = Boolean(initial)

  const toggleSymptom = (symptom) =>
    setSymptoms((previous) =>
      previous.includes(symptom) ? previous.filter((item) => item !== symptom) : [...previous, symptom],
    )

  const setQuickTime = (minutesFromNow) => {
    const time = new Date()
    time.setMinutes(time.getMinutes() + minutesFromNow)
    setWhen(toLocalInput(time))
  }

  const handleBack = () => {
    if (step > 1) setStep((current) => current - 1)
    else onCancel?.()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (step === 3 && (!stressLevel || !digestionState || (symptoms.length > 0 && severity < 1))) {
      setStepError('Choose your stress level, digestion, and symptom severity (if applicable) to continue.')
      return
    }

    if (step < STEPS) {
      setStepError('')
      setStep((current) => current + 1)
      return
    }

    onSave({
      type: 'bedtime',
      timestamp: fromLocalInput(when),
      symptoms,
      severity: symptoms.length ? Math.max(severity, 1) : 0,
      stressLevel,
      digestionState,
      notes: notes.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-[calc(100dvh-8rem)]">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          aria-label={step === 1 ? 'Back to log options' : 'Previous step'}
          className="flex h-11 w-11 items-center justify-start text-muted"
        >
          <ChevronLeft size={24} aria-hidden />
        </button>
        <p className="text-sm font-medium text-muted">Step {step} of {STEPS}</p>
        <span className="h-11 w-11" aria-hidden />
      </header>

      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-label={`Step ${step} of ${STEPS}`}>
        {Array.from({ length: STEPS }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full ${index < step ? 'bg-sage' : 'bg-line'}`}
            aria-hidden
          />
        ))}
      </div>

      <div className="pb-28 pt-7">
        {step === 1 && (
          <>
            <StepHeading title="When are you going to bed?" hint="Pick a quick option or set a time." />
            <div className="mt-8 rounded-3xl bg-card px-4 py-6 text-center shadow-sm">
              <p className="text-4xl font-bold tracking-tight sm:text-5xl">
                {bedtimeDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
              <p className="mt-2 text-sm text-muted">
                {bedtimeDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <QuickTimeButton onClick={() => setQuickTime(0)}>Now</QuickTimeButton>
              <QuickTimeButton onClick={() => setQuickTime(30)}>In 30 min</QuickTimeButton>
              <QuickTimeButton onClick={() => setQuickTime(60)}>In 1 hour</QuickTimeButton>
            </div>

            <Field label="Or choose a different time" htmlFor="bedtime-when">
              <input
                id="bedtime-when"
                type="datetime-local"
                className={inputClass}
                value={when}
                onChange={(event) => setWhen(event.target.value)}
                required
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <StepHeading title="Any symptoms right now?" hint="Tap all that apply." />
            <div className="mt-8 grid grid-cols-2 gap-3">
              {SYMPTOM_TYPES.map((symptom) => {
                const selected = symptoms.includes(symptom)
                return (
                  <ChoiceButton key={symptom} selected={selected} onClick={() => toggleSymptom(symptom)}>
                    <span>{symptom}</span>
                  </ChoiceButton>
                )
              })}
              <ChoiceButton
                selected={symptoms.length === 0}
                onClick={() => setSymptoms([])}
                className="col-span-2 justify-center"
              >
                No symptoms right now
              </ChoiceButton>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <StepHeading title="How are you feeling?" hint="Choose what best describes you right now." />

            {symptoms.length > 0 && (
              <section className="mt-7">
                <h2 className="mb-1 text-base font-semibold">How strong are your symptoms?</h2>
                <p className="mb-3 text-sm text-muted">Choose one.</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <ChoiceButton
                      key={level}
                      selected={severity === level}
                      onClick={() => {
                        setSeverity(level)
                        setStepError('')
                      }}
                      className="min-h-12 justify-center px-2"
                    >
                      {level}
                    </ChoiceButton>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted">{SEVERITY_LABELS[Math.max(severity, 1)]}</p>
              </section>
            )}

            <ChoiceGroup
              className="mt-7"
              legend="How relaxed or stressed do you feel?"
              hint="Choose one."
              value={stressLevel}
              onChange={(value) => {
                setStressLevel(value)
                setStepError('')
              }}
              options={BEDTIME_STRESS_LEVELS}
            />
            <ChoiceGroup
              className="mt-7"
              legend="How does your digestion feel?"
              hint="Choose one."
              value={digestionState}
              onChange={(value) => {
                setDigestionState(value)
                setStepError('')
              }}
              options={BEDTIME_DIGESTION_STATES}
            />

            {stepError && <p className="mb-4 text-sm font-medium text-danger" role="alert">{stepError}</p>}

            <Field label="Anything else? (optional)" htmlFor="bedtime-notes">
              <textarea
                id="bedtime-notes"
                rows={2}
                className={`${inputClass} py-3`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add a short note"
              />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <StepHeading title="All looks good?" hint="Tap any row to change it." />
            <div className="mt-8 overflow-hidden rounded-3xl bg-card shadow-sm">
              <ReviewRow label="Bedtime" value={formatBedtime(bedtimeDate)} onEdit={() => setStep(1)} />
              <ReviewRow
                label="Symptoms"
                value={symptoms.length ? symptoms.join(', ') : 'No symptoms right now'}
                onEdit={() => setStep(2)}
              />
              <ReviewRow
                label="Feeling"
                value={[
                  selectedSeverity && `Symptoms: ${selectedSeverity.toLowerCase()}`,
                  selectedStress?.label,
                  selectedDigestion?.label,
                  notes.trim(),
                ]
                  .filter(Boolean)
                  .join(' · ')}
                onEdit={() => setStep(3)}
                last
              />
            </div>
          </>
        )}
      </div>

      <div
        className={
          isEditing
            ? 'mt-4'
            : 'fixed inset-x-0 bottom-0 z-30 bg-app/95 px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur md:static md:mt-4 md:bg-transparent md:p-0'
        }
      >
        <button
          type="submit"
          className="min-h-14 w-full rounded-full bg-sage px-6 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          {step === STEPS ? submitLabel : 'Continue'}
        </button>
      </div>
    </form>
  )
}

function StepHeading({ title, hint }) {
  return (
    <div>
      <h1 className="text-2xl font-bold leading-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">{hint}</p>
    </div>
  )
}

function QuickTimeButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-14 rounded-2xl border border-line bg-card px-2 text-sm font-medium text-ink"
    >
      {children}
    </button>
  )
}

function ChoiceButton({ selected, onClick, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-14 items-center gap-2 rounded-2xl border px-4 text-left text-sm font-medium transition-colors ${
        selected ? 'border-sage bg-sage-soft text-ink' : 'border-line bg-card text-ink'
      } ${className}`}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {selected && <Check size={18} className="shrink-0 text-sage" aria-hidden />}
    </button>
  )
}

function ChoiceGroup({ className = '', legend, hint, value, onChange, options }) {
  return (
    <fieldset className={className}>
      <legend className="text-base font-semibold">{legend}</legend>
      <p className="mb-3 mt-1 text-sm text-muted">{hint}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <ChoiceButton
            key={option.value}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </ChoiceButton>
        ))}
      </div>
    </fieldset>
  )
}

function ReviewRow({ label, value, onEdit, last = false }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className={`block w-full px-5 py-4 text-left ${last ? '' : 'border-b border-line'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        <span className="min-h-8 px-2 py-1 text-sm font-semibold text-sage">Edit</span>
      </div>
      <p className="pr-10 text-sm font-semibold leading-6">{value || 'Not recorded'}</p>
    </button>
  )
}

function formatBedtime(date) {
  return `${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · ${date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })}`
}
