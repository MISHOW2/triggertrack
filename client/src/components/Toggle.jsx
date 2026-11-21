// Accessible on/off switch used across settings screens
export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-sage' : 'bg-line'}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  )
}

// A titled row with a switch on the right
export function ToggleRow({ title, sub, checked, onChange }) {
  return (
    <div className="flex min-h-14 items-center gap-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight">{title}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}
