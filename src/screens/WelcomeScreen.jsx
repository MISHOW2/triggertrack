import { Logo } from '../components/NavBar'

export default function WelcomeScreen({ firstRun, onStart, onFeedback, onBack }) {
  return (
    <>
      {onBack && (
        <button onClick={onBack} className="mb-2 min-h-10 text-sm font-medium text-sage hover:underline">
          ← Back
        </button>
      )}
      <div className="flex flex-col items-center pb-6 pt-6 text-center">
        <Logo size={56} />
        <h1 className="mt-4 text-3xl font-bold">Welcome to the beta</h1>
        <p className="mt-2 max-w-xs text-sm text-muted">You&apos;re one of a small group of people helping shape TriggerTrack. Thank you.</p>
      </div>

      <section className="mb-4 rounded-3xl border border-line bg-card p-4">
        <h2 className="mb-2 font-bold">What to expect</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Log daily for two weeks</li>
          <li>Rough edges are normal</li>
          <li>Your feedback decides what gets built next</li>
        </ul>
      </section>

      <section className="mb-5 rounded-3xl bg-sage-soft p-4">
        <h2 className="font-bold text-sage">Your data in the beta</h2>
        <p className="mt-1 text-sm text-muted">
          If you agree, your diary is synced and backed up. Delete your account and everything goes with it. If you don&apos;t, it stays on this phone.
        </p>
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
