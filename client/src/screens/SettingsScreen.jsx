import { ChevronRight, Database, MessageSquare, Moon, ShieldCheck, Sun } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Toggle from '../components/Toggle'

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

export default function SettingsScreen({ theme, setTheme, onNavigate }) {
  const dark = theme === 'dark'

  return (
    <>
      <PageHeader title="Settings" subtitle="Private and local to this device" />

      <section className="mb-5 overflow-hidden rounded-3xl border border-line bg-card">
        <LinkRow
          Icon={Database}
          tone="bg-sage-soft text-sage"
          title="Your data"
          sub="Export, import, or delete entries"
          onClick={() => onNavigate('your-data')}
        />
        <div className="border-t border-line">
          <LinkRow
            Icon={ShieldCheck}
            tone="bg-teal-soft text-teal"
            title="Privacy policy"
            sub="How this local-only app works"
            onClick={() => onNavigate('privacy-policy')}
          />
        </div>
        <div className="border-t border-line">
          <LinkRow
            Icon={MessageSquare}
            tone="bg-amber-soft text-amber"
            title="Send feedback"
            sub="Open your own email app"
            onClick={() => onNavigate('feedback')}
          />
        </div>
      </section>

      <section className="mb-4 flex items-center gap-3 rounded-3xl border border-line bg-card p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-soft text-amber">
          {dark ? <Moon size={20} aria-hidden /> : <Sun size={20} aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold leading-tight">Dark mode</h2>
          <p className="text-sm text-muted">Easy on the eyes at night</p>
        </div>
        <Toggle checked={dark} onChange={(on) => setTheme(on ? 'dark' : 'light')} label="Dark mode" />
      </section>

      <section className="mb-5 flex gap-3 rounded-3xl bg-chip p-4">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-muted" aria-hidden />
        <div>
          <h2 className="font-bold">Not medical advice</h2>
          <p className="text-sm text-muted">TriggerTrack is a personal tracker. It does not diagnose or recommend treatment.</p>
        </div>
      </section>
    </>
  )
}
