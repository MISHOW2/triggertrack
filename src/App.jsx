import { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import HomeScreen from './screens/HomeScreen'
import LogScreen from './screens/LogScreen'
import HistoryScreen from './screens/HistoryScreen'
import InsightsScreen from './screens/InsightsScreen'
import SettingsScreen from './screens/SettingsScreen'
import VideosScreen from './screens/VideosScreen'
import useEntries from './hooks/useEntries'
import useLocalStorage from './hooks/useLocalStorage'
import { KEYS } from './data/storage'

export default function App() {
  const [view, setView] = useState('home')
  const entries = useEntries()
  // The running symptom timer lives here so it survives switching screens and reloads
  const [timer, setTimer] = useLocalStorage(KEYS.timer, null)
  const [theme, setTheme] = useLocalStorage(
    KEYS.theme,
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121916' : '#567f5d')
  }, [theme])

  // Scroll to top when changing screens
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  let screen
  if (view === 'home') screen = <HomeScreen entries={entries.entries} timer={timer} onNavigate={setView} />
  else if (view.startsWith('log'))
    screen = <LogScreen view={view} onNavigate={setView} entries={entries} timer={timer} setTimer={setTimer} />
  else if (view === 'history')
    screen = <HistoryScreen entries={entries.entries} updateEntry={entries.updateEntry} deleteEntry={entries.deleteEntry} />
  else if (view === 'insights') screen = <InsightsScreen entries={entries.entries} />
  else if (view === 'videos') screen = <VideosScreen />
  else
    screen = (
      <SettingsScreen
        entries={entries.entries}
        theme={theme}
        setTheme={setTheme}
        onAddSample={entries.addMany}
        onRemoveSample={() => entries.removeWhere((e) => e.sample)}
        onClearAll={entries.clearAll}
      />
    )

  return (
    <div className="min-h-screen bg-app text-ink">
      <NavBar view={view} onNavigate={setView} />
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-6 md:ml-60 md:max-w-none md:px-10 md:pb-12">
        <div className="mx-auto max-w-2xl">{screen}</div>
      </main>
    </div>
  )
}
