import { useEffect, useRef, useState } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { Settings } from 'lucide-react'
import NavBar from './components/NavBar'
import HomeScreen from './screens/HomeScreen'
import LogScreen from './screens/LogScreen'
import HistoryScreen from './screens/HistoryScreen'
import InsightsScreen from './screens/InsightsScreen'
import SettingsScreen from './screens/SettingsScreen'
import PolicyScreen from './screens/PolicyScreen'
import YourDataScreen from './screens/YourDataScreen'
import WelcomeScreen from './screens/WelcomeScreen'
import FeedbackScreen from './screens/FeedbackScreen'
import useEntries from './hooks/useEntries'
import useLocalStorage from './hooks/useLocalStorage'
import useReminders from './hooks/useReminders'
import { KEYS } from './data/storage'
import { SYNC_ENABLED } from './utils/constants'

// Which bottom-bar tab to highlight for each screen
function tabFor(view) {
  if (view.startsWith('log')) return 'log'
  if (['insights'].includes(view)) return 'insights'
  if (['home', 'history'].includes(view)) return view
  return 'settings'
}

export default function App() {
  const [onboarded, setOnboarded] = useLocalStorage(KEYS.onboarded, false)
  const [view, setView] = useState(onboarded ? 'home' : 'welcome')
  const [viewHistory, setViewHistory] = useState([])
  const viewRef = useRef(view)
  const [firstRun, setFirstRun] = useState(!onboarded)
  const [notice, setNotice] = useState(false)
  const entries = useEntries()
  const [medLogs] = useLocalStorage(KEYS.medLogs, [])
  const [scores] = useLocalStorage(KEYS.questionnaire, [])
  const reminders = useReminders(entries.entries, medLogs)
  // The running symptom timer lives here so it survives switching screens and reloads
  const [timer, setTimer] = useLocalStorage(KEYS.timer, null)
  const [theme, setTheme] = useLocalStorage(
    KEYS.theme,
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121212' : '#567f5d')
  }, [theme])

  useEffect(() => {
    viewRef.current = view
  }, [view])

  useEffect(() => {
    let handle

    const setup = async () => {
      handle = await CapacitorApp.addListener('backButton', () => {
        setViewHistory((history) => {
          if (history.length > 0) {
            const previous = history[history.length - 1]
            setView(previous)
            setFirstRun(false)
            return history.slice(0, -1)
          }

          if (viewRef.current !== 'home') {
            setView('home')
            setFirstRun(false)
            return history
          }

          CapacitorApp.exitApp()
          return history
        })
      })
    }

    setup()
    return () => {
      handle?.remove()
    }
  }, [])

  // Scroll to top when changing screens
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  // "Saved on this phone" note on Home after a save
  useEffect(() => {
    if (!notice) return undefined
    const id = setTimeout(() => setNotice(false), 6000)
    return () => clearTimeout(id)
  }, [notice])

  const navigate = (next) => {
    if (!SYNC_ENABLED && next === 'sync') next = 'settings'
    if (next !== 'privacy') setFirstRun(false)
    setViewHistory((history) => (view === next ? history : [...history, view]))
    setView(next)
  }

  const entriesApi = {
    ...entries,
    addEntry: (entry) => {
      entries.addEntry(entry)
      setNotice(true)
    },
  }

  const finishWelcome = () => {
    setOnboarded(true)
    setFirstRun(false)
    setViewHistory([])
    setView('home')
  }

  let screen
  if (view === 'welcome')
    screen = (
      <WelcomeScreen
        firstRun={!onboarded}
        onStart={onboarded ? () => navigate('settings') : finishWelcome}
        onFeedback={() => {
          setOnboarded(true)
          navigate('feedback')
        }}
        onBack={onboarded ? () => navigate('settings') : undefined}
      />
    )
  else if (view === 'home')
    screen = (
      <HomeScreen
        entries={entries.entries}
        timer={timer}
        onNavigate={navigate}
        notice={notice}
        due={reminders.due}
        onDismissReminder={reminders.dismiss}
      />
    )
  else if (view.startsWith('log'))
    screen = <LogScreen view={view} onNavigate={navigate} entries={entriesApi} timer={timer} setTimer={setTimer} />
  else if (view === 'history')
    screen = (
      <HistoryScreen
        entries={entries.entries}
        updateEntry={entries.updateEntry}
        deleteEntry={entries.deleteEntry}
        onNavigate={navigate}
      />
    )
  else if (view === 'insights')
    screen = <InsightsScreen entries={entries.entries} onNavigate={navigate} latestScore={scores[scores.length - 1]?.total} />
  else if (view === 'privacy-policy') screen = <PolicyScreen onNavigate={navigate} />
  else if (view === 'privacy') screen = <PolicyScreen onNavigate={navigate} />
  else if (view === 'your-data') screen = <YourDataScreen entries={entries.entries} onClearAll={entries.clearAll} onImport={entries.importEntries} onNavigate={navigate} />
  else if (view === 'feedback') screen = <FeedbackScreen onNavigate={navigate} />
  else
    screen = (
      <SettingsScreen
        theme={theme}
        setTheme={setTheme}
        onNavigate={navigate}
      />
    )

  const tab = tabFor(view)
  const bare = view === 'welcome' && !onboarded
  const centeredHome = view === 'home'

  return (
    <div className="min-h-screen bg-app text-ink">
      {!bare && <NavBar view={tab} onNavigate={navigate} hideBottomNav={view === 'log-bedtime'} centeredHome={centeredHome} />}
      <main
        className={`relative mx-auto max-w-2xl px-4 pb-28 pt-6 ${
          bare ? '' : centeredHome ? 'md:max-w-none md:px-10' : 'md:ml-60 md:max-w-none md:px-10 md:pb-12'
        }`}
      >
        {!view.startsWith('log') && !bare && view !== 'home' && (
          <button
            onClick={() => navigate('settings')}
            aria-label="Settings"
            aria-current={tab === 'settings' ? 'page' : undefined}
            className={`absolute right-4 top-4 z-30 flex h-12 w-12 items-center justify-center rounded-full md:hidden ${
              tab === 'settings' ? 'bg-sage-soft text-sage' : 'bg-card text-muted shadow-sm'
            }`}
          >
            <Settings size={22} aria-hidden />
          </button>
        )}
        <div key={view.startsWith('log') ? 'log' : view} className="screen-enter mx-auto max-w-2xl">
          {screen}
        </div>
      </main>
    </div>
  )
}
