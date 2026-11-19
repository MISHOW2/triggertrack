export default function PageHeader({ title, subtitle, onBack }) {
  return (
    <header className="mb-5">
      {onBack && (
        <button onClick={onBack} className="mb-2 min-h-10 text-sm font-medium text-sage hover:underline">
          ← Back
        </button>
      )}
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </header>
  )
}
