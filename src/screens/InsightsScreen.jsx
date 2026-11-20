import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlarmClock,
  Award,
  ChevronRight,
  Clock,
  ClipboardList,
  FileText,
  Flame,
  Leaf,
  Pill,
  Sparkles,
  Sun,
  Sunrise,
  TrendingUp,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageHeader from '../components/PageHeader'
import { computeInsights } from '../utils/insights'
import { formatDuration } from '../utils/dateUtils'
import { SEVERITY_LABELS, SAFE_FOOD_MIN_LOGS, TRIGGER_WINDOW_HOURS } from '../utils/constants'

const clock = (mins) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const chartAxis = { fill: 'var(--muted)', fontSize: 12 }
const tooltipStyle = { background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--ink)' }

const CONFIDENCE = {
  high: { label: 'High confidence', cls: 'bg-sage text-white' },
  medium: { label: 'Medium confidence', cls: 'bg-amber-soft text-amber' },
  low: { label: 'Early signs', cls: 'bg-chip text-muted' },
}

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
]

const EXPLORE_PATTERNS = [
  { id: 'time-of-day', Icon: Sunrise, tone: 'bg-teal-soft text-teal', title: 'Time of day', sub: 'When symptom episodes started' },
  { id: 'safe-foods', Icon: Leaf, tone: 'bg-sage-soft text-sage', title: 'Your safe foods', sub: 'Logged often, never followed by an episode' },
  { id: 'wake-severity', Icon: Sun, tone: 'bg-amber-soft text-amber', title: 'Wake time vs. severity', sub: 'Your logged wake times and symptom severity' },
  { id: 'weekly-trend', Icon: TrendingUp, tone: 'bg-sage-soft text-sage', title: 'Weekly trend', sub: 'Meals and symptom episodes, day by day' },
  { id: 'food-patterns', Icon: Flame, tone: 'bg-teal-soft text-teal', title: 'Foods before flare-ups', sub: 'Meals before symptom episodes' },
  { id: 'duration', Icon: Clock, tone: 'bg-amber-soft text-amber', title: 'Episode duration', sub: 'Average and longest episode' },
]

const EXPLORE_TOOLS = [
  { id: 'questionnaire', Icon: ClipboardList, tone: 'bg-teal-soft text-teal', title: 'Weekly check-in', sub: 'Nine quick questions, once a week' },
  { id: 'report-options', Icon: FileText, tone: 'bg-sage-soft text-sage', title: 'Doctor report', sub: 'A one-page summary to print or save as PDF' },
  { id: 'medications', Icon: Pill, tone: 'bg-amber-soft text-amber', title: 'Medications', sub: 'Doses next to your entries' },
]

function ExploreOption({ Icon, tone, title, sub, onClick }) {
  return (
    <button onClick={onClick} className="flex min-h-14 w-full items-center gap-3 rounded-full bg-card px-3 py-2 text-left shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon size={20} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-tight">{title}</span>
        <span className="block truncate text-sm text-muted">{sub}</span>
      </span>
      <ChevronRight size={17} className="shrink-0 text-muted" aria-hidden />
    </button>
  )
}

function ExploreMenu({ onClose, onSelectPattern, onNavigate, latestScore }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/35 px-4 pb-[calc(10.5rem+env(safe-area-inset-bottom))] pt-8 backdrop-blur-sm md:items-center md:pb-8"
      role="dialog"
      aria-modal="true"
      aria-label="Explore insights"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="max-h-[calc(100dvh-12rem)] w-full max-w-sm overflow-y-auto">
        <div className="mb-2 flex justify-end">
          <span className="rounded-full bg-card px-3 py-1 text-xs font-bold uppercase tracking-wide text-sage">Patterns</span>
        </div>
        <div className="flex flex-col gap-2">
          {EXPLORE_PATTERNS.map(({ id, ...item }) => (
            <ExploreOption key={id} {...item} onClick={() => onSelectPattern(id)} />
          ))}
        </div>
        <div className="mb-2 mt-4 flex justify-end">
          <span className="rounded-full bg-card px-3 py-1 text-xs font-bold uppercase tracking-wide text-sage">Tools</span>
        </div>
        <div className="flex flex-col gap-2">
          {EXPLORE_TOOLS.map(({ id, ...item }) => (
            <ExploreOption
              key={id}
              {...item}
              sub={id === 'questionnaire' && latestScore != null ? `Latest score ${latestScore} · tap for a new check-in` : item.sub}
              onClick={() => onNavigate(id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyInsight({ Icon, tone, children }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-card px-6 py-7 text-center">
      <span className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${tone}`}>
        <Icon size={24} aria-hidden />
      </span>
      <p className="text-sm text-muted">{children}</p>
    </div>
  )
}

function InsightSheet({ insightId, data, onClose, onNavigate }) {
  const insight = EXPLORE_PATTERNS.find((item) => item.id === insightId)
  const maxFollowed = Math.max(1, ...data.foods.map((food) => food.followed))
  const maxBucket = Math.max(1, ...data.timeOfDay.map((bucket) => bucket.count))
  let action
  let content

  if (insightId === 'food-patterns') {
    if (data.foods.length === 0) {
      action = { label: 'Log a meal', view: 'log-meal' }
      content = (
        <EmptyInsight Icon={Flame} tone="bg-teal-soft text-teal">
          No tagged meals were followed by a flare-up in this period.
        </EmptyInsight>
      )
    } else {
      content = (
        <>
          <ul className="space-y-3">
            {data.foods.map((food) => (
              <li key={food.tag}>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{food.tag}</span>
                  <span className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${CONFIDENCE[food.confidence].cls}`}>
                      {CONFIDENCE[food.confidence].label}
                    </span>
                    <span className="text-muted">
                      {food.followed} of {food.eaten} {food.eaten === 1 ? 'time' : 'times'}
                    </span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-chip" role="presentation">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sage to-teal"
                    style={{ width: `${(food.followed / maxFollowed) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            A food showing up here is a clue, not proof. A few episodes can look like a pattern by chance, so keep logging and compare over several weeks.
          </p>
        </>
      )
    }
  } else if (insightId === 'duration') {
    if (data.episodeCount === 0) {
      action = { label: 'Start symptom timer', view: 'log-timer' }
      content = (
        <EmptyInsight Icon={Clock} tone="bg-amber-soft text-amber">
          Log symptom episodes to see your average and longest episode.
        </EmptyInsight>
      )
    } else {
      content = (
        <div className="grid grid-cols-2 gap-3">
          <section className="rounded-3xl border border-line bg-card p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sage-soft text-sage">
              <Clock size={19} aria-hidden />
            </div>
            <p className="text-2xl font-bold">{formatDuration(data.avgDuration)}</p>
            <p className="text-sm text-muted">avg symptom duration</p>
          </section>
          <section className="rounded-3xl border border-line bg-card p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-soft text-amber">
              <Award size={19} aria-hidden />
            </div>
            <p className="text-2xl font-bold">{formatDuration(data.longest)}</p>
            <p className="text-sm text-muted">longest episode</p>
          </section>
        </div>
      )
    }
  } else if (insightId === 'time-of-day') {
    if (data.episodeCount === 0) {
      action = { label: 'Start symptom timer', view: 'log-timer' }
      content = (
        <EmptyInsight Icon={Sunrise} tone="bg-teal-soft text-teal">
          Log symptom episodes to see when they tend to start.
        </EmptyInsight>
      )
    } else {
      content = (
        <ul className="space-y-2 rounded-3xl border border-line bg-card p-4">
          {data.timeOfDay.map((bucket) => (
            <li key={bucket.id} className="flex items-center gap-3 text-sm">
              <span className="w-12 shrink-0 text-muted">{bucket.label}</span>
              <div className="h-3 flex-1 rounded-full bg-chip" role="presentation">
                <div
                  className={`h-full rounded-full ${bucket.count === maxBucket ? 'bg-sage' : 'bg-sage/50'}`}
                  style={{ width: `${(bucket.count / maxBucket) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right font-semibold">{bucket.count}</span>
            </li>
          ))}
        </ul>
      )
    }
  } else if (insightId === 'safe-foods') {
    if (data.safeFoods.length === 0) {
      action = { label: 'Log a meal', view: 'log-meal' }
      content = (
        <EmptyInsight Icon={Leaf} tone="bg-sage-soft text-sage">
          A food appears here after you log it {SAFE_FOOD_MIN_LOGS}+ times in this period without an episode starting within {TRIGGER_WINDOW_HOURS} hours.
        </EmptyInsight>
      )
    } else {
      content = (
        <div className="rounded-3xl border border-line bg-card p-4">
          <ul className="flex flex-wrap gap-2">
            {data.safeFoods.map((food) => (
              <li key={food.name} className="rounded-full bg-sage-soft px-3 py-1.5 text-sm font-semibold text-sage">
                {food.name} <span className="font-normal text-muted">· {food.count}×</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Not a guarantee. A food with no flare-ups so far can still bother you another day.</p>
        </div>
      )
    }
  } else if (insightId === 'wake-severity') {
    if (data.wakeSeries.length < 2) {
      action = { label: 'Log a wake-up', view: 'log-wake' }
      content = (
        <EmptyInsight Icon={Sun} tone="bg-amber-soft text-amber">
          Log at least two wake-ups to see this chart.
        </EmptyInsight>
      )
    } else {
      content = (
        <>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.wakeSeries} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
                <XAxis dataKey="minutes" tickFormatter={clock} tick={chartAxis} stroke="var(--line)" interval="preserveStartEnd" />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={chartAxis} stroke="var(--line)" allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(minutes) => `Woke at ${clock(minutes)}`}
                  formatter={(value) => [`${value} (${SEVERITY_LABELS[value]})`, 'Severity']}
                />
                <Line
                  type="monotone"
                  dataKey="severity"
                  stroke="var(--teal)"
                  strokeWidth={2}
                  dot={{ r: 5, fill: 'var(--teal)', stroke: 'var(--card)', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted">A visual pattern is a clue, not proof; a few entries can be misleading.</p>
        </>
      )
    }
  } else if (data.mealCount === 0 && data.episodeCount === 0) {
    action = { label: 'Log something', view: 'log' }
    content = (
      <EmptyInsight Icon={TrendingUp} tone="bg-sage-soft text-sage">
        Log meals and symptom episodes to see how they vary day by day.
      </EmptyInsight>
    )
  } else {
    content = (
      <>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.week} margin={{ top: 8, right: 12, bottom: 0, left: -20 }} barGap={2}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={chartAxis} stroke="var(--line)" interval={0} />
              <YAxis allowDecimals={false} tick={chartAxis} stroke="var(--line)" />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: 'var(--chip)' }}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.dateLabel ?? label}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                formatter={(value) => (value === 'meals' ? 'Meals' : 'Symptoms')}
                wrapperStyle={{ color: 'var(--muted)', fontSize: 12 }}
              />
              <Bar dataKey="meals" name="meals" fill="var(--sage)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="symptoms" name="symptoms" fill="var(--teal)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted">These counts show what you logged, not whether one caused the other.</p>
      </>
    )
  }

  if (!insight) return null
  const { Icon, tone, title, sub } = insight

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 px-0 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="insight-sheet-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="flex max-h-[82dvh] w-full max-w-xl flex-col rounded-t-[2rem] bg-app px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2 shadow-2xl">
        <button onClick={onClose} aria-label="Close insight" className="mb-3 flex min-h-6 w-full items-center justify-center">
          <span className="h-1.5 w-24 rounded-full bg-chip" />
        </button>
        <header className="mb-5 flex items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}>
            <Icon size={20} aria-hidden />
          </span>
          <span>
            <h2 id="insight-sheet-title" className="font-bold">{title}</h2>
            <p className="text-sm text-muted">{sub}</p>
          </span>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto pb-4">{content}</div>
        {action && (
          <button
            onClick={() => onNavigate(action.view)}
            className="min-h-12 w-full rounded-full bg-gradient-to-br from-sage to-teal px-4 font-semibold text-white shadow-sm"
          >
            {action.label}
          </button>
        )}
      </section>
    </div>
  )
}

export default function InsightsScreen({ entries, onNavigate, latestScore }) {
  const [days, setDays] = useState(14)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [activeInsight, setActiveInsight] = useState(null)
  const data = useMemo(() => computeInsights(entries, { days }), [entries, days])

  useEffect(() => {
    if (!exploreOpen && !activeInsight) return undefined
    const scrollY = window.scrollY
    const bodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      overscrollBehavior: document.body.style.overscrollBehavior,
    }
    const rootStyles = {
      overflow: document.documentElement.style.overflow,
      overscrollBehavior: document.documentElement.style.overscrollBehavior,
    }

    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        if (activeInsight) setActiveInsight(null)
        else setExploreOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      Object.assign(document.body.style, bodyStyles)
      Object.assign(document.documentElement.style, rootStyles)
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [activeInsight, exploreOpen])

  const openInsight = (id) => {
    setExploreOpen(false)
    setActiveInsight(id)
  }

  const goToTool = (view) => {
    setExploreOpen(false)
    setActiveInsight(null)
    onNavigate?.(view)
  }

  const maxWeeklyCount = Math.max(1, ...data.week.map((day) => day.meals + day.symptoms))
  const noActivity = data.mealCount === 0 && data.episodeCount === 0
  const previewHeights = [42, 74, 25, 92, 63, 48, 82]

  return (
    <>
      <PageHeader title="Insights" subtitle="Your patterns at a glance" />

      <div className="mb-5 grid grid-cols-3 gap-1 rounded-full bg-chip p-1" role="group" aria-label="Time range">
        {RANGES.map((range) => (
          <button
            key={range.days}
            onClick={() => setDays(range.days)}
            aria-pressed={days === range.days}
            className={`min-h-10 rounded-full px-3 text-sm font-semibold ${
              days === range.days ? 'bg-card text-ink shadow-sm' : 'text-muted'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { Icon: UtensilsCrossed, count: data.mealCount, label: 'Meals' },
          { Icon: AlarmClock, count: data.wakeCount, label: 'Wake-ups' },
          { Icon: Activity, count: data.episodeCount, label: 'Episodes' },
        ].map(({ Icon, count, label }) => (
          <section key={label} className="rounded-3xl border border-line bg-card p-3 shadow-sm sm:p-4">
            <Icon size={17} className="mb-3 text-teal" aria-hidden />
            <p className="text-xl font-bold leading-tight">{count}</p>
            <p className="mt-1 text-xs text-muted">{label}</p>
          </section>
        ))}
      </div>

      <h2 className="mb-2 text-sm font-semibold text-muted">Highlight</h2>
      <button
        onClick={() => openInsight('weekly-trend')}
        className="mb-5 block w-full rounded-3xl border border-line bg-card p-4 text-left shadow-sm"
        aria-label="Explore weekly trend"
      >
        <span className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage">
            <TrendingUp size={19} aria-hidden />
          </span>
          <span>
            <span className="block font-bold">Weekly trend</span>
            <span className="block text-sm text-muted">Meals and symptom episodes, day by day</span>
          </span>
        </span>
        <span className="flex h-12 items-end gap-1.5" aria-hidden="true">
          {data.week.slice(-7).map((day, index) => {
            const count = day.meals + day.symptoms
            const height = noActivity ? previewHeights[index] : count ? Math.max(12, (count / maxWeeklyCount) * 100) : 4
            return (
              <span
                key={day.dateLabel}
                className={`flex-1 rounded-t-xl ${noActivity || count ? 'bg-sage/25' : 'bg-chip'}`}
                style={{ height: `${height}%` }}
              />
            )
          })}
        </span>
        <span className="mt-2 block text-[11px] text-muted">
          {noActivity ? 'Preview — fills in once you start logging.' : 'Last 7 days · counts only, not cause and effect'}
        </span>
      </button>

      <h2 className="mb-2 text-sm font-semibold text-muted">Pinned</h2>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => openInsight('safe-foods')}
          className="min-h-24 rounded-3xl border border-line bg-card p-4 text-left shadow-sm"
        >
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-sage-soft text-sage">
            <Leaf size={17} aria-hidden />
          </span>
          <span className="block font-bold">Your safe foods</span>
          <span className="mt-1 block truncate text-xs text-muted">{data.safeFoods[0]?.name || 'Patterns from your meals'}</span>
        </button>
        <button
          onClick={() => goToTool('report-options')}
          className="min-h-24 rounded-3xl border border-line bg-card p-4 text-left shadow-sm"
        >
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-sage-soft text-sage">
            <FileText size={17} aria-hidden />
          </span>
          <span className="block font-bold">Doctor report</span>
          <span className="mt-1 block truncate text-xs text-muted">Print or save as PDF</span>
        </button>
      </div>

      <section className="mb-5 flex items-start gap-3 rounded-3xl bg-chip p-4 text-sm text-muted">
        <Activity size={17} className="mt-0.5 shrink-0" aria-hidden />
        <p>More insights live behind Explore. Open one at a time.</p>
      </section>

      {!activeInsight && (
        <button
          onClick={() => setExploreOpen((open) => !open)}
          aria-label={exploreOpen ? 'Close Explore menu' : 'Explore insights'}
          aria-haspopup="dialog"
          aria-expanded={exploreOpen}
          className={`fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-[70] flex min-h-14 items-center justify-center rounded-full bg-gradient-to-br from-sage to-teal font-semibold text-white shadow-[0_8px_24px_rgba(34,67,57,0.28)] md:bottom-8 md:right-8 ${
            exploreOpen ? 'w-14 border-4 border-card p-0' : 'gap-2 px-5'
          }`}
        >
          {exploreOpen ? <X size={22} aria-hidden /> : <><Sparkles size={18} aria-hidden />Explore</>}
        </button>
      )}

      {exploreOpen && (
        <ExploreMenu
          onClose={() => setExploreOpen(false)}
          onSelectPattern={openInsight}
          latestScore={latestScore}
          onNavigate={goToTool}
        />
      )}

      {activeInsight && (
        <InsightSheet insightId={activeInsight} data={data} onClose={() => setActiveInsight(null)} onNavigate={goToTool} />
      )}
    </>
  )
}
