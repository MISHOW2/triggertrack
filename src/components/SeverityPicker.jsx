import { SEVERITY_LABELS } from '../utils/constants'

// Row of numbered buttons. allowNone adds a "0 = none" option (used for wake-ups).
export default function SeverityPicker({ value, onChange, allowNone = false }) {
  const levels = allowNone ? [0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5]
  return (
    <div>
      <div className="flex gap-2" role="radiogroup" aria-label="Severity">
        {levels.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            className={`h-12 flex-1 rounded-xl border text-base font-bold transition-colors ${
              value === n ? 'border-sage bg-sage text-white' : 'border-line bg-card text-ink hover:bg-chip'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">{SEVERITY_LABELS[value]}</p>
    </div>
  )
}
