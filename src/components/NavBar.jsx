import { ChartColumn, Clapperboard, History, House, Plus, Settings, Heart } from 'lucide-react'

const ITEMS = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'log', label: 'Log', Icon: Plus },
  { id: 'history', label: 'History', Icon: History },
  { id: 'insights', label: 'Insights', Icon: ChartColumn },
  { id: 'videos', label: 'Videos', Icon: Clapperboard },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

// Sidebar on desktop, bottom tab bar on phones
export default function NavBar({ view, onNavigate }) {
  const active = view.startsWith('log') ? 'log' : view

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-app p-4 md:flex">
        <div className="mb-6 flex items-center gap-3 px-2 pt-2">
          <Logo />
          <div>
            <p className="font-bold leading-tight">TriggerTrack</p>
            <p className="text-xs text-muted">Reflux tracker</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-current={active === id ? 'page' : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-left font-medium transition-colors ${
                active === id ? 'bg-sage text-white' : 'text-ink hover:bg-chip'
              }`}
            >
              <Icon size={19} aria-hidden />
              {label}
            </button>
          ))}
        </nav>
        <p className="mt-auto px-2 text-xs text-muted">Personal tracking tool — not medical advice</p>
      </aside>

      {/* Phone bottom tab bar */}
      <nav
        aria-label="Main"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-card md:hidden"
      >
        {ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            aria-current={active === id ? 'page' : undefined}
            className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${
              active === id ? 'text-sage' : 'text-muted'
            }`}
          >
            <Icon size={22} aria-hidden />
            {label}
          </button>
        ))}
      </nav>
    </>
  )
}

export function Logo({ size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-sage to-teal text-white"
      style={{ width: size, height: size }}
    >
      <Heart size={size * 0.5} fill="currentColor" aria-hidden />
    </div>
  )
}
