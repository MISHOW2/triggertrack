import { Cog, FileText, Play, Settings2, ShieldAlert, Users } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { POLICY_VERSION } from '../context/SyncContext'

// Plain-language draft. It MUST be reviewed by a South African lawyer before launch (POPIA treats health data as special personal information).
const SECTIONS = [
  {
    Icon: FileText,
    tone: 'bg-sage-soft text-sage',
    title: 'What we collect',
    summary: 'Your email, meal logs and symptom entries.',
    detail:
      'When sync is on we store your email address, your meals, wake-ups, bedtimes and symptom episodes, and (if you use them) your medicines and check-in scores. We do not ask for your name, ID number, phone number or location.',
  },
  {
    Icon: Cog,
    tone: 'bg-teal-soft text-teal',
    title: 'Why we use it',
    summary: 'To save your diary and sync your devices.',
    detail:
      'We use your data only to keep your diary safe and in step across your phones, and to show your own patterns back to you. We do not sell it, show adverts, or share it with advertisers.',
  },
  {
    Icon: Play,
    tone: 'bg-amber-soft text-amber',
    title: 'Videos',
    summary: 'YouTube is contacted only when you choose to play a video.',
    detail:
      'The Videos tab shows no thumbnails from YouTube. When you tap play, the video loads from youtube-nocookie.com, so YouTube learns that you watched it. Channels you follow stay on your phone.',
  },
  {
    Icon: Users,
    tone: 'bg-sage-soft text-sage',
    title: 'Your choices',
    summary: 'Export your data or delete your account in Your data.',
    detail:
      'You can download everything as a file at any time, clear the copy on this phone, or delete your account and all synced data. Deleting your account cannot be undone.',
  },
  {
    Icon: Settings2,
    tone: 'bg-teal-soft text-teal',
    title: 'Where it is stored',
    summary: 'Secure cloud storage with backups.',
    detail:
      'Synced data is encrypted in transit and at rest, and each person can only read their own rows. [Hosting region to be confirmed: POPIA has rules on moving personal data out of South Africa.]',
  },
  {
    Icon: ShieldAlert,
    tone: 'bg-chip text-muted',
    title: 'Not medical advice',
    summary: 'TriggerTrack records and summarises your logs. It does not diagnose or recommend treatment.',
    detail: 'Patterns shown are clues, not proof. Talk to your doctor about your symptoms and treatment.',
  },
]

export default function PolicyScreen({ onNavigate }) {
  return (
    <>
      <PageHeader title="Privacy policy" subtitle={`Draft · Version ${POLICY_VERSION}`} onBack={() => onNavigate('privacy')} />
      <div className="flex flex-col gap-3">
        {SECTIONS.map(({ Icon, tone, title, summary, detail }) => (
          <details key={title} className="group rounded-3xl border border-line bg-card p-4">
            <summary className="flex cursor-pointer list-none items-center gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={20} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold leading-tight">{title}</span>
                <span className="block text-sm text-muted">{summary}</span>
              </span>
            </summary>
            <p className="mt-3 border-t border-line pt-3 text-sm leading-6 text-muted">{detail}</p>
          </details>
        ))}
      </div>
      <button onClick={() => onNavigate('privacy')} className="mt-5 min-h-12 w-full rounded-xl border-2 border-sage font-semibold text-sage">
        Manage consent
      </button>
      <p className="mt-4 text-center text-xs text-muted">Proposed wording. The privacy policy requires legal review before launch.</p>
    </>
  )
}
