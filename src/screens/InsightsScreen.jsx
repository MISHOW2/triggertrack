import { useMemo } from 'react'
import { Award, Clock, Flame, Sun, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageHeader from '../components/PageHeader'
import { computeInsights } from '../utils/insights'
import { formatDuration } from '../utils/dateUtils'
import { SEVERITY_LABELS, TRIGGER_WINDOW_HOURS } from '../utils/constants'

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

export default function InsightsScreen({ entries }) {
  const data = useMemo(() => computeInsights(entries), [entries])
  const maxFollowed = Math.max(1, ...data.foods.map((f) => f.followed))

  return (
    <>
      <PageHeader title="Insights" subtitle={`Patterns from your last ${data.days} days of tracking`} />

      {data.episodeCount === 0 && (
        <p className="mb-4 rounded-2xl border border-dashed border-line p-5 text-sm text-muted">
          No symptom episodes logged in the last {data.days} days yet. Insights appear once you have some episodes and meals logged.
          You can try the app with sample data in Settings.
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
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{f.tag}</span>
                  <span className="text-muted">
                    {f.followed} of {f.eaten} {f.eaten === 1 ? 'time' : 'times'}
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

      <Card
        Icon={Sun}
        tone="bg-amber-soft text-amber"
        title="Wake time vs. severity"
        subtitle="How bad your symptoms were on waking, by the time you woke up"
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
                {/* Dots only: lines between different times of day would suggest a trend that isn't there */}
                <Line type="linear" dataKey="severity" stroke="transparent" strokeWidth={0} dot={{ r: 5, fill: 'var(--teal)', stroke: 'var(--card)', strokeWidth: 2 }} activeDot={{ r: 7 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card Icon={TrendingUp} tone="bg-sage-soft text-sage" title="This week" subtitle="Symptom episodes per day">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.week} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={chartAxis} stroke="var(--line)" />
              <YAxis allowDecimals={false} tick={chartAxis} stroke="var(--line)" />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--chip)' }} formatter={(v) => [v, 'Episodes']} />
              <Bar dataKey="count" fill="var(--sage)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  )
}
