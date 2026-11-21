// Shared form styling so every form looks the same
export const inputClass =
  'min-h-12 w-full rounded-xl border border-line bg-card px-4 text-base text-ink placeholder:text-muted'

export function Field({ label, htmlFor, children }) {
  return (
    <div className="mb-5">
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`min-h-12 w-full rounded-xl bg-sage px-5 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  )
}
