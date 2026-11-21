import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, Heart, Mail, ShieldCheck } from 'lucide-react'
import { Field, PrimaryButton, inputClass } from '../components/fields'

const CODE_LENGTH = 6
const RESEND_SECONDS = 30
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OFFLINE_MESSAGE = "You're offline. Connect to sign in."

export default function LoginScreen({ onRequestCode, onVerifyCode, onDone }) {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [resendAt, setResendAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (resendAt <= Date.now()) return undefined
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= resendAt) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [resendAt])

  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000))

  async function sendCode(isResend = false) {
    if (busy) return
    const clean = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(clean)) {
      setError('Enter a valid email address.')
      return
    }
    if (!navigator.onLine) {
      setError(OFFLINE_MESSAGE)
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await onRequestCode(clean)
      setEmail(clean)
      setCode('')
      setStep('code')
      const t = Date.now()
      setNow(t)
      setResendAt(t + RESEND_SECONDS * 1000)
      if (isResend) setNotice('A new PIN is on its way.')
    } catch (err) {
      setError(err?.userMessage || "We couldn't send the PIN. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  async function verifyCode() {
    if (busy) return
    if (code.length !== CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit PIN.`)
      return
    }
    if (!navigator.onLine) {
      setError(OFFLINE_MESSAGE)
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const session = await onVerifyCode(email, code)
      onDone?.(session)
    } catch (err) {
      setError(err?.userMessage || "That PIN didn't work. Check it and try again.")
      setCode('')
      inputRef.current?.focus()
    } finally {
      setBusy(false)
    }
  }

  function changeEmail() {
    setStep('email')
    setCode('')
    setError('')
    setNotice('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (step === 'email') sendCode(false)
    else verifyCode()
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-4 pb-10 pt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-sage to-teal text-white shadow-lg">
        <Heart size={30} fill="currentColor" aria-hidden />
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-teal">TriggerTrack</p>
      <h1 className="mt-2 text-center text-3xl font-bold">Your private tracker</h1>
      <p className="mt-2 max-w-xs text-center text-sm text-muted">
        A simple way to keep your reflux notes close and private.
      </p>

      <section className="mt-7 w-full rounded-3xl border border-line bg-card p-5 shadow-sm" aria-busy={busy}>
        <form onSubmit={handleSubmit} noValidate>
          {step === 'email' ? (
            <>
              <h2 className="mb-4 text-xl font-bold">Sign in with email</h2>
              <p className="mb-4 text-sm text-muted">We'll send you a one-time PIN.</p>
              <Field label="Email address" htmlFor="login-email">
                <div className="relative">
                  <Mail size={18} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="login-email"
                    ref={inputRef}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="you@example.com"
                    className={`${inputClass} pl-11`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'login-error' : undefined}
                  />
                </div>
              </Field>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={changeEmail}
                className="-ml-2 mb-3 flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-sage"
              >
                <ArrowLeft size={18} aria-hidden /> Change email
              </button>
              <h2 className="text-xl font-bold">Enter your PIN</h2>
              <p className="mb-4 mt-1 text-sm text-muted">
                We sent a {CODE_LENGTH}-digit PIN to <span className="break-all font-semibold text-ink">{email}</span>.
              </p>
              <Field label="One-time PIN" htmlFor="login-code">
                <input
                  id="login-code"
                  ref={inputRef}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className={`${inputClass} min-h-14 text-center text-2xl font-semibold tracking-[0.4em]`}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </Field>
            </>
          )}

          {error && (
            <p id="login-error" role="alert" className="mb-4 rounded-xl border border-danger bg-danger-soft px-3 py-2 text-sm text-ink">
              {error}
            </p>
          )}
          {notice && !error && (
            <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-teal-soft px-3 py-2.5 text-sm text-ink">
              <Check size={16} aria-hidden className="shrink-0 text-teal" /> {notice}
            </p>
          )}

          {step === 'email' ? (
            <PrimaryButton type="submit" disabled={busy || email.trim() === ''}>
              {busy ? 'Sending…' : 'Send me a PIN'}
            </PrimaryButton>
          ) : (
            <>
              <PrimaryButton type="submit" disabled={busy || code.length !== CODE_LENGTH}>
                {busy ? 'Verifying…' : 'Verify and continue'}
              </PrimaryButton>
              <button
                type="button"
                onClick={() => sendCode(true)}
                disabled={busy || secondsLeft > 0}
                className="mt-2 min-h-12 w-full rounded-xl text-sm font-semibold text-sage disabled:text-muted"
              >
                {secondsLeft > 0 ? `Resend PIN in ${secondsLeft}s` : 'Resend PIN'}
              </button>
            </>
          )}
        </form>
      </section>

      <p className="mt-4 flex w-full items-start gap-3 rounded-2xl bg-chip px-4 py-3 text-sm text-muted">
        <ShieldCheck size={18} aria-hidden className="mt-0.5 shrink-0 text-teal" />
        <span>Your health entries are private to your account. TriggerTrack is a personal tracking tool, not medical advice.</span>
      </p>
    </div>
  )
}
