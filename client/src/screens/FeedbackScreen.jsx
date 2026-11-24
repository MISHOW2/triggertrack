import { useState } from 'react'
import { Copy, Mail } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { collectDiagnostics } from '../lib/diagnostics'
import { APP_VERSION, FEEDBACK_EMAIL } from '../utils/constants'

export default function FeedbackScreen({ onNavigate }) {
  const [type, setType] = useState('Suggestion')
  const [message, setMessage] = useState('')
  const [attachRecentLogs, setAttachRecentLogs] = useState(false)
  const [recentLogs, setRecentLogs] = useState('')
  const [emailAttempted, setEmailAttempted] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const trimmedMessage = message.trim()
  const subject = `TriggerTrack feedback: ${type}`
  const draftBody = [
    trimmedMessage,
    '',
    `App version: ${APP_VERSION}`,
    ...(attachRecentLogs ? ['', `Recent app diagnostics:\n${recentLogs}`] : []),
  ].join('\n')
  const mailto = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draftBody)}`

  const toggleRecentLogs = (checked) => {
    setAttachRecentLogs(checked)
    setRecentLogs(checked ? JSON.stringify(collectDiagnostics(), null, 2) : '')
  }

  const copyEmailAddress = async () => {
    setCopyStatus('')
    try {
      await navigator.clipboard.writeText(FEEDBACK_EMAIL)
      setCopyStatus('Email address copied.')
    } catch {
      setCopyStatus('Copy failed. Select and copy the address above.')
    }
  }

  return (
    <>
      <PageHeader title="Send feedback" onBack={() => onNavigate('settings')} />

      <label htmlFor="fb-type" className="mb-2 block font-bold">Feedback type</label>
      <select
        id="fb-type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="mb-4 min-h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-ink"
      >
        <option>Suggestion</option>
        <option>Bug report</option>
        <option>Other</option>
      </select>

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

      <label className="mb-4 flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-card px-4">
        <input
          type="checkbox"
          checked={attachRecentLogs}
          onChange={(e) => toggleRecentLogs(e.target.checked)}
          className="h-5 w-5 accent-sage"
        />
        <span className="font-semibold">Attach recent logs</span>
      </label>

      <section className="mb-5 rounded-2xl bg-amber-soft p-4 text-amber">
        <p className="text-sm font-bold">This opens your email app. Please don't include personal health details or diary entries.</p>
        {attachRecentLogs && (
          <p className="mt-2 text-xs">The optional attachment below includes app diagnostics only, never diary entries.</p>
        )}
      </section>

      <section className="mb-4 rounded-2xl border border-line bg-card p-4">
        <h2 className="mb-2 font-bold">Email draft preview</h2>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-sm text-muted">{draftBody}</pre>
      </section>

      <a
        href={mailto}
        onClick={(event) => {
          if (!trimmedMessage) event.preventDefault()
          else setEmailAttempted(true)
        }}
        aria-disabled={!trimmedMessage}
        className={`mb-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sage text-base font-bold text-white ${
          !trimmedMessage ? 'pointer-events-none opacity-40' : ''
        }`}
      >
        <Mail size={19} aria-hidden /> Open my email app
      </a>
      {!trimmedMessage && <p className="mb-4 text-sm text-muted">Enter a message to prepare your email draft.</p>}
      {emailAttempted && (
        <p role="status" className="mb-4 text-sm text-muted">
          If your email app opens, press send to finish. If it doesn't, copy the address below.
        </p>
      )}

      <section className="rounded-2xl border border-line bg-card p-4">
        <h2 className="mb-2 font-bold">Email address</h2>
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 break-all text-sm text-muted">{FEEDBACK_EMAIL}</p>
          <button
            type="button"
            onClick={copyEmailAddress}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-line px-3 text-sm font-bold"
          >
            <Copy size={16} aria-hidden /> Copy
          </button>
        </div>
        {copyStatus && <p role="status" className="mt-2 text-sm text-muted">{copyStatus}</p>}
      </section>
    </>
  )
}
