import { useState } from 'react'
import { Check } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { ToggleRow } from '../components/Toggle'
import { collectDiagnostics } from '../lib/diagnostics'
import { flushFeedback, queueFeedback } from '../data/feedbackQueue'

const MOODS = [
  { id: 'bad', face: ':(', label: 'Not good' },
  { id: 'okay', face: ':|', label: 'Okay' },
  { id: 'good', face: ':)', label: 'Good' },
]

export default function FeedbackScreen({ onNavigate }) {
  const [mood, setMood] = useState(null)
  const [message, setMessage] = useState('')
  const [attach, setAttach] = useState(true)
  const [sent, setSent] = useState(null) // 'sent' | 'queued'
  const [busy, setBusy] = useState(false)

  const send = async () => {
    setBusy(true)
    queueFeedback({ mood, message: message.trim(), diagnostics: attach ? collectDiagnostics() : null })
    const delivered = await flushFeedback()
    setSent(delivered > 0 ? 'sent' : 'queued')
    setBusy(false)
  }

  if (sent) {
    return (
      <>
        <PageHeader title="Send feedback" />
        <section className="rounded-3xl bg-sage-soft p-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-white">
            <Check size={26} aria-hidden />
          </span>
          <h2 className="text-lg font-bold text-sage">Thank you</h2>
          <p className="mt-1 text-sm text-muted">
            {sent === 'sent' ? 'Your feedback was sent.' : "Saved on your phone. We'll send it when you're online."}
          </p>
        </section>
        <button onClick={() => onNavigate('home')} className="mt-4 min-h-14 w-full rounded-2xl bg-sage font-bold text-white">
          Back to Home
        </button>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Send feedback" onBack={() => onNavigate('settings')} />

      <h2 className="mb-2 font-bold">How is it going?</h2>
      <div className="mb-5 grid grid-cols-3 gap-3" role="radiogroup" aria-label="How is it going?">
        {MOODS.map(({ id, face, label }) => (
          <button
            key={id}
            role="radio"
            aria-checked={mood === id}
            aria-label={label}
            onClick={() => setMood(id)}
            className={`min-h-16 rounded-2xl border-2 text-2xl font-bold ${mood === id ? 'border-sage bg-sage-soft text-sage' : 'border-line bg-card'}`}
          >
            {face}
          </button>
        ))}
      </div>

      <label htmlFor="fb-message" className="mb-2 block font-bold">
        What happened?
      </label>
      <textarea
        id="fb-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={1000}
        rows={6}
        placeholder="e.g. The bedtime wizard closed when I switched apps to check the time…"
        className="mb-4 w-full rounded-2xl border border-line bg-card p-4 text-base text-ink placeholder:text-muted"
      />

      <section className="mb-3 rounded-3xl border border-line bg-card px-4">
        <ToggleRow title="Attach recent logs" sub="Helps us reproduce the problem." checked={attach} onChange={setAttach} />
      </section>
      <section className="mb-5 rounded-2xl bg-amber-soft p-4 text-amber">
        <h2 className="text-sm font-bold">Never includes your entries</h2>
        <p className="text-xs">Only app errors and timings.</p>
      </section>

      <button onClick={send} disabled={busy || (!mood && !message.trim())} className="min-h-14 w-full rounded-2xl bg-sage text-base font-bold text-white disabled:opacity-40">
        {busy ? 'Sending…' : 'Send'}
      </button>
    </>
  )
}
