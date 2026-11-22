import { ArrowLeft } from 'lucide-react'
import { Logo } from '../components/NavBar'

export default function WelcomeScreen({ firstRun, onStart, onFeedback, onBack }) {
  return (
    <>
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          className="mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sage hover:bg-sage-soft"
        >
          <ArrowLeft size={21} aria-hidden />
        </button>
      )}
      <div className="flex flex-col items-center pb-6 pt-6 text-center">
        <Logo size={56} />
        <h1 className="mt-4 text-3xl font-bold">Welcome to TriggerTrack</h1>
        <p className="mt-2 max-w-xs text-sm text-muted">A private diary for meals, wake-ups, and symptom episodes.</p>
      </div>

      <section className="mb-4 rounded-3xl border border-line bg-card p-4">
        <h2 className="mb-2 font-bold">Your privacy</h2>
        <p className="text-sm leading-6 text-muted">
          Your data stays on this device. It is not sent to an account or cloud service. Deleting the app or clearing its data deletes your entries.
          Export a backup if you want to keep or restore them.
        </p>
      </section>

      <section className="mb-5 rounded-3xl bg-sage-soft p-4">
        <h2 className="font-bold text-sage">Not medical advice</h2>
        <p className="mt-1 text-sm text-muted">TriggerTrack records observations. Its patterns are clues, not proof or a diagnosis.</p>
      </section>

      <button onClick={onStart} className="mb-2 min-h-14 w-full rounded-2xl bg-sage text-base font-bold text-white">
        {firstRun ? 'Start logging' : 'Back to the app'}
      </button>
      <button onClick={onFeedback} className="min-h-14 w-full rounded-2xl border-2 border-sage text-base font-bold text-sage">
        Send feedback
      </button>
    </>
  )
}
