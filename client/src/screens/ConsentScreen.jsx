import { useState } from 'react'
import { ChevronRight, Download, ShieldCheck, User, Wifi } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ConfirmSheet from '../components/ConfirmSheet'
import { useSync, POLICY_VERSION } from '../context/SyncContext'

const POINTS = [
  { Icon: User, tone: 'bg-sage-soft text-sage', title: 'Your diary stays on this device', sub: 'Cloud sync is not connected yet.' },
  { Icon: Wifi, tone: 'bg-teal-soft text-teal', title: 'Log even without a connection', sub: 'Your entries are saved on this phone too.' },
  { Icon: Download, tone: 'bg-amber-soft text-amber', title: 'Export or delete your data', sub: "You're always in control." },
]

export default function ConsentScreen({ onNavigate, firstRun = false }) {
  const { enabled, consent, grantConsent, declineConsent, withdrawConsent } = useSync()
  const [agreed, setAgreed] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)

  const next = () => onNavigate('home')

  return (
    <>
      <PageHeader title="Privacy & consent" onBack={firstRun ? undefined : () => onNavigate('settings')} />

      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-sage-soft text-sage">
          <ShieldCheck size={38} aria-hidden />
        </div>
        <h2 className="text-2xl font-bold">Your health data, your choice</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Your diary is saved on this device. Cloud sync is not connected, so your entries are not uploaded or available across devices.
        </p>
      </div>

      <ul className="mb-4 divide-y divide-line rounded-3xl border border-line bg-card px-4">
        {POINTS.map(({ Icon, tone, title, sub }) => (
          <li key={title} className="flex items-center gap-3 py-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={20} aria-hidden />
            </span>
            <span>
              <span className="block font-semibold leading-tight">{title}</span>
              <span className="block text-sm text-muted">{sub}</span>
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onNavigate('privacy-policy')}
        className="mb-4 flex min-h-12 w-full items-center justify-between rounded-2xl px-2 font-semibold text-sage"
      >
        Read privacy policy <ChevronRight size={18} aria-hidden />
      </button>

      {enabled ? (
        <>
          <section className="mb-4 rounded-3xl bg-sage-soft p-4">
            <h2 className="font-bold text-sage">Demo consent is on</h2>
            <p className="mt-1 text-sm text-muted">
              You agreed on {new Date(consent.at).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })} (policy version {consent.version}). No server is connected, so your diary stays on this device.
            </p>
          </section>
          <button onClick={() => setConfirmOff(true)} className="min-h-12 w-full rounded-xl border-2 border-sage font-semibold text-sage">
            Turn off sync
          </button>
          <button onClick={() => onNavigate('your-data')} className="mt-2 min-h-12 w-full text-sm font-semibold text-sage">
            Export or delete my data
          </button>
        </>
      ) : (
        <>
          <label className="mb-4 flex items-start gap-3 text-sm">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--sage)]" />
            <span>I understand this is a demo consent flow. No data will be uploaded or synced because no server is connected.</span>
          </label>
          <button
            disabled={!agreed}
            onClick={async () => {
              await grantConsent()
              next()
            }}
            className="min-h-14 w-full rounded-2xl bg-sage text-base font-bold text-white disabled:bg-chip disabled:text-muted"
          >
            Continue
          </button>
          <button
            onClick={() => {
              declineConsent()
              next()
            }}
            className="mt-2 min-h-12 w-full text-sm font-semibold text-sage"
          >
            Not now, keep using this phone
          </button>
        </>
      )}
      <p className="mt-3 text-center text-xs text-muted">Policy version {POLICY_VERSION}</p>

      {confirmOff && (
        <ConfirmSheet
          title="Turn off sync?"
          body="New entries will stay on this phone only. Anything already synced stays in your account until you delete it in Your data."
          confirmLabel="Turn off sync"
          danger={false}
          onConfirm={async () => {
            await withdrawConsent()
            setConfirmOff(false)
          }}
          onCancel={() => setConfirmOff(false)}
        />
      )}
    </>
  )
}
