import { Bell, ChevronRight, ClipboardList, Cloud, FileText, FlaskConical, MessageSquare, Moon, Pill, RefreshCw, ShieldAlert, ShieldCheck, Sparkles, Sun, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Toggle from '../components/Toggle'
import { useSync } from '../context/SyncContext'
import { makeSampleEntries } from '../data/storage'

const outlineBtn = 'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 font-semibold transition-colors'

function LinkRow({ Icon, tone, title, sub, onClick }) {
  return (
    <button onClick={onClick} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={20} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-tight">{title}</span>
        <span className="block text-sm text-muted">{sub}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden />
    </button>
  )
}

function Group({ title, children }) {
  return (
    <section className="mb-5" aria-label={title}>
      <h2 className="mb-2 px-1 text-sm font-semibold text-muted">{title}</h2>
      <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-card">{children}</div>
    </section>
  )
}

export default function SettingsScreen({ entries, theme, setTheme, onNavigate, onAddSample, onRemoveSample }) {
  const dark = theme === 'dark'
  const sampleCount = entries.filter((e) => e.sample).length
  const { enabled, status, pendingCount } = useSync()

  const syncSub = !enabled
    ? 'Off · entries stay on this phone'
    : status === 'offline'
      ? `Offline · ${pendingCount} waiting`
      : status === 'syncing'
        ? 'Syncing…'
        : status === 'error'
          ? 'Needs retry'
          : 'Up to date'

  return (
    <>
      <PageHeader title="Settings" subtitle="Personalize your tracker" />

      <Group title="Your tracking">
        <LinkRow Icon={Pill} tone="bg-amber-soft text-amber" title="Medications" sub="Doses next to your entries" onClick={() => onNavigate('medications')} />
        <LinkRow Icon={Bell} tone="bg-sage-soft text-sage" title="Reminders" sub="Nudges you control" onClick={() => onNavigate('reminders')} />
        <LinkRow Icon={ClipboardList} tone="bg-teal-soft text-teal" title="Weekly check-in" sub="The questionnaire doctors already use" onClick={() => onNavigate('questionnaire')} />
        <LinkRow Icon={Moon} tone="bg-teal-soft text-teal" title="Sleep import" sub="Nights next to your episodes" onClick={() => onNavigate('sleep-import')} />
        <LinkRow Icon={FileText} tone="bg-sage-soft text-sage" title="Doctor report" sub="One-page PDF download" onClick={() => onNavigate('report-options')} />
      </Group>

      <Group title="Privacy and sync">
        <LinkRow Icon={RefreshCw} tone="bg-teal-soft text-teal" title="Sync details" sub={syncSub} onClick={() => onNavigate('sync')} />
        <LinkRow Icon={ShieldCheck} tone="bg-sage-soft text-sage" title="Privacy & consent" sub={enabled ? 'Sync is on' : 'Choose whether to sync'} onClick={() => onNavigate('privacy')} />
        <LinkRow Icon={Cloud} tone="bg-amber-soft text-amber" title="Your data" sub="Export, clear this phone, delete account" onClick={() => onNavigate('your-data')} />
      </Group>

      <Group title="Beta">
        <LinkRow Icon={MessageSquare} tone="bg-sage-soft text-sage" title="Send feedback" sub="Tell us what's working and what's not" onClick={() => onNavigate('feedback')} />
        <LinkRow Icon={Sparkles} tone="bg-teal-soft text-teal" title="About the beta" sub="What to expect" onClick={() => onNavigate('welcome')} />
      </Group>

      <section className="mb-4 flex items-center gap-3 rounded-3xl border border-line bg-card p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-soft text-amber">
          {dark ? <Moon size={20} aria-hidden /> : <Sun size={20} aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold leading-tight">Dark mode</h2>
          <p className="text-sm text-muted">Easy on the eyes for night and early morning</p>
        </div>
        <Toggle checked={dark} onChange={(on) => setTheme(on ? 'dark' : 'light')} label="Dark mode" />
      </section>

      <section className="mb-4 rounded-3xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-soft text-teal">
            <FlaskConical size={20} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold leading-tight">Try it with sample data</h2>
            <p className="text-sm text-muted">Adds 14 days of made-up entries so you can see how Insights works</p>
          </div>
        </div>
        {sampleCount > 0 ? (
          <button onClick={onRemoveSample} className={`${outlineBtn} border-teal text-teal`}>
            <Trash2 size={17} aria-hidden /> Remove {sampleCount} sample entries
          </button>
        ) : (
          <button onClick={() => onAddSample(makeSampleEntries(14))} className={`${outlineBtn} border-teal text-teal`}>
            Add sample data
          </button>
        )}
      </section>

      <section className="mb-4 flex gap-3 rounded-3xl bg-chip p-4">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-muted" aria-hidden />
        <div>
          <h2 className="font-bold">Not medical advice</h2>
          <p className="text-sm text-muted">
            TriggerTrack is a personal tracking tool. It does not provide medical advice, diagnosis, or treatment. Always consult
            your doctor or a qualified healthcare professional about your symptoms and treatment options.
          </p>
        </div>
      </section>

      <p className="text-center text-xs text-muted">
        Entries are saved on this phone first.{enabled ? ' With your consent they also sync to your account.' : ''} Videos contact YouTube only when you tap play.
      </p>
    </>
  )
}
