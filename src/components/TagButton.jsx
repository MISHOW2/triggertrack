// A tap-to-toggle chip (used for trigger foods, symptoms and symptom types)
export default function TagButton({ label, selected, onToggle, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${className} ${
        selected
          ? 'border-sage bg-sage text-white'
          : 'border-line bg-card text-ink hover:bg-chip'
      }`}
    >
      {label}
    </button>
  )
}
