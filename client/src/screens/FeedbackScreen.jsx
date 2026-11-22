import { useState } from 'react'
import { Mail } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function FeedbackScreen({ onNavigate }) {
  const [message, setMessage] = useState('')

  return (
    <>
      <PageHeader title="Send feedback" onBack={() => onNavigate('settings')} />

      <label htmlFor="fb-message" className="mb-2 block font-bold">What happened?</label>
      <textarea
        id="fb-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={1000}
        rows={6}
        placeholder="Describe an app issue or suggestion"
        className="mb-4 w-full rounded-2xl border border-line bg-card p-4 text-base text-ink placeholder:text-muted"
      />

      <section className="mb-5 rounded-2xl bg-amber-soft p-4 text-amber">
        <h2 className="text-sm font-bold">Do not include health details</h2>
        <p className="text-xs">This app does not attach your diary or personal data.</p>
      </section>

      <a
        href={`mailto:?subject=${encodeURIComponent('TriggerTrack feedback')}&body=${encodeURIComponent(message.trim())}`}
        onClick={(event) => { if (!message.trim()) event.preventDefault() }}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sage text-base font-bold text-white disabled:opacity-40"
      >
        <Mail size={19} aria-hidden /> Open my email app
      </a>
    </>
  )
}
