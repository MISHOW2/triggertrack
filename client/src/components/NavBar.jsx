import { ChartColumn, History, House, Plus, Settings, Heart } from 'lucide-react'

const ITEMS = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'log', label: 'Log', Icon: Plus },
  { id: 'history', label: 'History', Icon: History },
  { id: 'insights', label: 'Insights', Icon: ChartColumn },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

// Settings lives in a gear at the top right on phones, so the bar stays roomy
const LEFT = ITEMS.filter((i) => ['home', 'history'].includes(i.id))
const RIGHT = ITEMS.filter((i) => ['insights', 'settings'].includes(i.id))

function TabButton({ item, active, onNavigate }) {
  const { id, label, Icon } = item
  return (
    <button
      onClick={() => onNavigate(id)}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
        active ? 'text-sage' : 'text-muted'
      }`}
    >
      <span
        className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200 ${
          active ? 'bg-sage-soft' : 'bg-transparent'
        }`}
      >
        <Icon size={22} aria-hidden />
      </span>
      {label}
    </button>
  )
}

// Home keeps the mobile-style bottom bar centered at desktop widths to match its dashboard layout.
export default function NavBar({ view, onNavigate, hideBottomNav = false, centeredHome = false }) {
  const active = view.startsWith('log') ? 'log' : view

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-app p-4 ${centeredHome ? '' : 'md:flex'}`}>
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

      {!hideBottomNav && (
        <nav
          aria-label="Main"
          className={`safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto flex items-end rounded-t-3xl bg-card px-2 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] ${
            centeredHome ? 'md:max-w-sm' : 'md:hidden'
          }`}
        >
          {LEFT.map((item) => (
            <TabButton key={item.id} item={item} active={active === item.id} onNavigate={onNavigate} />
          ))}
          <div className="relative h-16 w-24 shrink-0">
            <button
              onClick={() => onNavigate('log')}
              aria-label="Log"
              aria-current={active === 'log' ? 'page' : undefined}
              className={`log-fab absolute left-1/2 flex items-center justify-center text-white ${
                active === 'log' ? 'log-fab-active' : ''
              }`}
            >
              <Plus size={30} aria-hidden />
            </button>
          </div>
          {RIGHT.map((item) => (
            <TabButton key={item.id} item={item} active={active === item.id} onNavigate={onNavigate} />
          ))}
        </nav>
      )}
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
