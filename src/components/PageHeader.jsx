import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, subtitle, onBack }) {
  return (
    <header className="mb-5">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          className="mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sage hover:bg-sage-soft"
        >
          <ArrowLeft size={21} aria-hidden />
        </button>
      )}
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </header>
  )
}
