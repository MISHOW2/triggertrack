import { useMemo, useState } from 'react'
import { Award, Clock, ClipboardList, FileText, Flame, Info, Leaf, Pill, Sun, TrendingUp, Sunrise } from 'lucide-react'
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

function Card({ Icon, tone, title, subtitle, children }) {
  return (
    <section className="mb-4 rounded-3xl border border-line bg-card p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={19} aria-hidden />
        </div>
        <div>
          <h2 className="font-bold leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

const chartAxis = { fill: 'var(--muted)', fontSize: 12 }
const tooltipStyle = { background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--ink)' }

const CONFIDENCE = {
  high: { label: 'High confidence', cls: 'bg-sage text-white' },
  medium: { label: 'Medium confidence', cls: 'bg-amber-soft text-amber' },
  low: { label: 'Early signs', cls: 'bg-chip text-muted' },
}

const RANGES = [
  { days: 14, label: '2 weeks' },
  { days: 28, label: '4 weeks' },
]

function ShortcutRow({ Icon, tone, title, sub, onClick }) {
  return (
    <button onClick={onClick} className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-line bg-card p-3 text-left">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={20} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-tight">{title}</span>
        <span className="block text-sm text-muted">{sub}</span>
      </span>
    </button>
  )
}

export default function InsightsScreen({ entries, onNavigate, latestScore }) {
  const [days, setDays] = useState(14)
  const data = useMemo(() => computeInsights(entries, { days }), [entries, days])
  const maxFollowed = Math.max(1, ...data.foods.map((f) => f.followed))
  const commonFoodPattern = data.foods[0]
  const maxBucket = Math.max(1, ...data.timeOfDay.map((b) => b.count))

  return (
    <>
      <PageHeader title="Insights" subtitle={`Patterns from your last ${data.days} days of tracking`} />

      <div className="mb-4 flex gap-2" role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => setDays(r.days)}
            aria-pressed={days === r.days}
            className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
              days === r.days ? 'border-sage bg-sage text-white' : 'border-line bg-card text-muted'
            }`}
          >
            Last {r.label}
          </button>
        ))}
      </div>

      {data.episodeCount === 0 && (
        <p className="mb-4 rounded-2xl border border-dashed border-line p-5 text-sm text-muted">
          No symptom episodes logged in the last {data.days} days yet. Keep logging meals and symptoms to see your personal patterns.
        </p>
      )}

      <Card
        Icon={Flame}
        tone="bg-teal-soft text-teal"
        title="Foods before flare-ups"
        subtitle={`Meals eaten in the ${TRIGGER_WINDOW_HOURS} hours before a symptom episode started`}
      >
        {data.foods.length === 0 ? (
          <p className="text-sm text-muted">No tagged meals were followed by a flare-up yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.foods.map((f) => (
              <li key={f.tag}>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{f.tag}</span>
                  <span className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${CONFIDENCE[f.confidence].cls}`}>
                      {CONFIDENCE[f.confidence].label}
                    </span>
                    <span className="text-muted">
                      {f.followed} of {f.eaten} {f.eaten === 1 ? 'time' : 'times'}
                    </span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-chip" role="presentation">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sage to-teal"
                    style={{ width: `${(f.followed / maxFollowed) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted">
          A food showing up here is a clue, not proof. A few episodes can look like a pattern by chance, so keep logging and
          compare over several weeks.
        </p>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-line bg-card p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sage-soft text-sage">
            <Clock size={19} aria-hidden />
          </div>
          <p className="text-2xl font-bold">{data.episodeCount ? formatDuration(data.avgDuration) : '—'}</p>
          <p className="text-sm text-muted">avg symptom duration</p>
        </div>
        <div className="rounded-3xl border border-line bg-card p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-soft text-amber">
            <Award size={19} aria-hidden />
          </div>
          <p className="text-2xl font-bold">{data.episodeCount ? formatDuration(data.longest) : '—'}</p>
          <p className="text-sm text-muted">longest episode</p>
        </div>
      </div>

      <Card Icon={Sunrise} tone="bg-teal-soft text-teal" title="Time of day" subtitle="When symptom episodes started">
        {data.episodeCount === 0 ? (
          <p className="text-sm text-muted">Log symptom episodes to see when they tend to start.</p>
        ) : (
          <ul className="space-y-2">
            {data.timeOfDay.map((b) => (
              <li key={b.id} className="flex items-center gap-3 text-sm">
                <span className="w-12 shrink-0 text-muted">{b.label}</span>
                <div className="h-3 flex-1 rounded-full bg-chip" role="presentation">
                  <div
                    className={`h-full rounded-full ${b.count === maxBucket ? 'bg-sage' : 'bg-sage/50'}`}
                    style={{ width: `${(b.count / maxBucket) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-semibold">{b.count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card Icon={Leaf} tone="bg-sage-soft text-sage" title="Your safe foods" subtitle="Logged often, never followed by an episode">
        {data.safeFoods.length === 0 ? (
          <p className="text-sm text-muted">
            A food appears here after you log it {SAFE_FOOD_MIN_LOGS}+ times in this period without an episode starting within{' '}
            {TRIGGER_WINDOW_HOURS} hours.
          </p>
        ) : (
          <>
            <ul className="flex flex-wrap gap-2">
              {data.safeFoods.map((f) => (
                <li key={f.name} className="rounded-full bg-sage-soft px-3 py-1.5 text-sm font-semibold text-sage">
                  {f.name} <span className="font-normal text-muted">· {f.count}×</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Not a guarantee. A food with no flare-ups so far can still bother you another day.</p>
          </>
        )}
      </Card>

      <Card
        Icon={Sun}
        tone="bg-amber-soft text-amber"
        title="Wake time vs. severity"
        subtitle="Your logged wake times and symptom severity"
      >
        {data.wakeSeries.length < 2 ? (
          <p className="text-sm text-muted">Log at least two wake-ups to see this chart.</p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.wakeSeries} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
                <XAxis dataKey="minutes" tickFormatter={clock} tick={chartAxis} stroke="var(--line)" interval="preserveStartEnd" />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={chartAxis} stroke="var(--line)" allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(m) => `Woke at ${clock(m)}`}
                  formatter={(v) => [`${v} (${SEVERITY_LABELS[v]})`, 'Severity']}
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
        )}
        {data.wakeSeries.length >= 2 && (
          <p className="mt-2 text-xs text-muted">A visual pattern is a clue, not proof; a few entries can be misleading.</p>
        )}
      </Card>

      <Card Icon={TrendingUp} tone="bg-sage-soft text-sage" title="Weekly trend" subtitle="Meals and symptom episodes, day by day">
        {data.mealCount === 0 && data.episodeCount === 0 ? (
          <p className="text-sm text-muted">Log meals and symptom episodes to see how they vary day by day.</p>
        ) : (
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
        )}
      </Card>

      <h2 className="mb-2 font-semibold text-muted">More</h2>
      <div className="mb-4 flex flex-col gap-2">
        <ShortcutRow
          Icon={ClipboardList}
          tone="bg-teal-soft text-teal"
          title="Weekly check-in"
          sub={latestScore != null ? `Latest score ${latestScore} · tap for a new check-in` : 'Nine quick questions, once a week'}
          onClick={() => onNavigate?.('questionnaire')}
        />
        <ShortcutRow Icon={FileText} tone="bg-sage-soft text-sage" title="Doctor report" sub="A one-page summary to print or save as PDF" onClick={() => onNavigate?.('report-options')} />
        <ShortcutRow Icon={Pill} tone="bg-amber-soft text-amber" title="Medications" sub="Doses next to your entries" onClick={() => onNavigate?.('medications')} />
      </div>

      <section className="mb-4 flex gap-3 rounded-3xl bg-chip p-4 text-sm text-muted" aria-label="Tracking summary">
        <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
        <p>
          You&apos;ve logged {data.mealCount} {data.mealCount === 1 ? 'meal' : 'meals'}, {data.wakeCount}{' '}
          {data.wakeCount === 1 ? 'wake-up' : 'wake-ups'}, and {data.episodeCount}{' '}
          {data.episodeCount === 1 ? 'symptom episode' : 'symptom episodes'} in the last {data.days} days.
          {commonFoodPattern && (
            <> Most often tagged before an episode: <span className="font-semibold text-ink">{commonFoodPattern.tag}</span>.</>
          )}
        </p>
      </section>
    </>
  )
}
