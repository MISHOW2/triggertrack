import { TRIGGER_WINDOW_HOURS } from './constants'
import { computeInsights } from './insights'
import { isSameDay, startOfDay } from './dateUtils'

const HOUR = 3600 * 1000

export const PRESETS = {
  '4w': { label: 'Last 4 weeks', days: 28 },
  '3m': { label: 'Last 3 months', days: 91 },
  custom: { label: 'Custom…' },
}

export const DEFAULT_REPORT_OPTIONS = {
  preset: '4w',
  from: '',
  to: '',
  include: { meals: true, episodes: true, wakes: true, meds: true, scores: false },
}

// Resolve the options into a concrete from/to pair of Dates
export function resolveRange(options) {
  const now = new Date()
  if (options.preset === 'custom' && options.from) {
    const from = startOfDay(new Date(`${options.from}T00:00:00`))
    const to = options.to ? new Date(`${options.to}T00:00:00`) : now
    return { from, to: to > now ? now : to }
  }
  const days = PRESETS[options.preset]?.days ?? 28
  const from = startOfDay(now)
  from.setDate(from.getDate() - (days - 1))
  return { from, to: now }
}

// For each trigger tag: in how many episodes was it in a meal during the hours before?
function episodeTagCounts(entries, from, to) {
  const inRange = (e) => {
    const t = new Date(e.timestamp).getTime()
    return t >= from.getTime() && t <= to.getTime() + 24 * HOUR
  }
  const meals = entries.filter((e) => e.type === 'meal' && new Date(e.timestamp) <= to)
  const episodes = entries.filter((e) => e.type === 'symptom' && inRange(e) && new Date(e.timestamp) >= from && new Date(e.timestamp) <= to)
  const counts = {}
  episodes.forEach((ep) => {
    const t = new Date(ep.timestamp).getTime()
    const tags = new Set()
    meals.forEach((m) => {
      const mt = new Date(m.timestamp).getTime()
      if (mt <= t && t - mt <= TRIGGER_WINDOW_HOURS * HOUR) (m.tags || []).forEach((tag) => tags.add(tag))
    })
    tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1
    })
  })
  const list = Object.entries(counts)
    .map(([tag, episodesCount]) => ({ tag, episodes: episodesCount }))
    .sort((a, b) => b.episodes - a.episodes)
    .slice(0, 5)
  return { list, total: episodes.length }
}

function medicationSummary(meds, logs, from, to) {
  const dayList = []
  const d = new Date(from)
  while (d <= to) {
    dayList.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return meds.map((m) => {
    const mine = logs.filter((l) => l.medId === m.id && new Date(l.timestamp) >= from && new Date(l.timestamp) <= new Date(to.getTime() + 24 * HOUR))
    if (m.kind === 'daily') {
      const startsAt = startOfDay(m.createdAt || from)
      const first = startsAt > from ? startsAt : from
      const base = dayList.filter((day) => startOfDay(day) >= first)
      const taken = base.filter((day) => mine.some((l) => isSameDay(l.timestamp, day))).length
      return { ...m, text: `${taken} of ${base.length} days` }
    }
    return { ...m, text: `${mine.length} ${mine.length === 1 ? 'dose' : 'doses'}, as needed` }
  })
}

export function buildReport({ entries, options, meds, medLogs, scores }) {
  const { from, to } = resolveRange(options)
  const data = computeInsights(entries, { from, to })
  const tagData = episodeTagCounts(entries, from, to)
  const wakeAvg = data.wakeCount
    ? entries
        .filter((e) => e.type === 'wake' && new Date(e.timestamp) >= from && new Date(e.timestamp) <= to)
        .reduce((sum, e) => sum + (e.severity ?? 0), 0) / data.wakeCount
    : null
  return {
    from,
    to,
    data,
    tags: tagData,
    wakeAvg,
    meds: medicationSummary(meds, medLogs, from, to),
    scores: scores.filter((s) => new Date(s.timestamp) >= from && new Date(s.timestamp) <= new Date(to.getTime() + 24 * HOUR)),
  }
}
