import { INSIGHT_DAYS, SAFE_FOOD_MIN_LOGS, TIME_BUCKETS, TRIGGER_WINDOW_HOURS } from './constants'
import { minutesOfDay, startOfDay } from './dateUtils'

const HOUR = 3600 * 1000

// How sure we are that a tag keeps showing up before episodes.
// Needs enough meals, a decent share followed by an episode, and clearly more than a random meal.
export function confidenceFor({ eaten, followed }, baseline) {
  const rate = eaten ? followed / eaten : 0
  if (eaten >= 6 && followed >= 3 && rate >= 0.6 && rate >= baseline * 1.5) return 'high'
  if (eaten >= 4 && followed >= 2 && rate >= 0.35) return 'medium'
  return 'low'
}

// Works out the numbers shown on Insights and in the doctor report.
// range: { days } for "the last N days", or { from, to } (Dates) for an exact range.
export function computeInsights(entries, range = {}) {
  const now = new Date()
  let from
  let to
  if (range.from) {
    from = startOfDay(range.from)
    to = new Date(range.to ?? now)
    to.setHours(23, 59, 59, 999)
    if (to > now) to = now
  } else {
    const days = range.days ?? INSIGHT_DAYS
    from = startOfDay(now)
    from.setDate(from.getDate() - (days - 1))
    to = now
  }
  const dayCount = Math.max(1, Math.round((startOfDay(to) - from) / (24 * HOUR)) + 1)

  const recent = entries.filter((e) => {
    const t = new Date(e.timestamp).getTime()
    return t >= from.getTime() && t <= to.getTime()
  })
  const meals = recent.filter((e) => e.type === 'meal')
  const wakes = recent.filter((e) => e.type === 'wake')
  const symptoms = recent.filter((e) => e.type === 'symptom')

  // Did a symptom episode start within the window after this meal?
  const followedByEpisode = (meal) => {
    const t = new Date(meal.timestamp).getTime()
    return symptoms.some((s) => {
      const st = new Date(s.timestamp).getTime()
      return st >= t && st - t <= TRIGGER_WINDOW_HOURS * HOUR
    })
  }
  const mealFlags = meals.map((meal) => ({ meal, followed: followedByEpisode(meal) }))
  const baseline = meals.length ? mealFlags.filter((m) => m.followed).length / meals.length : 0

  // --- Foods before flare-ups (per trigger tag) ---
  const perTag = {}
  mealFlags.forEach(({ meal, followed }) => {
    ;(meal.tags || []).forEach((tag) => {
      perTag[tag] = perTag[tag] || { tag, eaten: 0, followed: 0 }
      perTag[tag].eaten += 1
      if (followed) perTag[tag].followed += 1
    })
  })
  const allFoods = Object.values(perTag)
    .filter((f) => f.followed > 0)
    .map((f) => ({ ...f, rate: f.followed / f.eaten, confidence: confidenceFor(f, baseline) }))
    .sort((a, b) => b.followed - a.followed || b.rate - a.rate)
  const foods = allFoods.slice(0, 5)

  // --- Foods never followed by an episode ---
  const perName = {}
  mealFlags.forEach(({ meal, followed }) => {
    const key = (meal.name || '').trim().toLowerCase()
    if (!key) return
    perName[key] = perName[key] || { name: meal.name.trim(), count: 0, followed: 0 }
    perName[key].count += 1
    if (followed) perName[key].followed += 1
  })
  const safeFoods = Object.values(perName)
    .filter((f) => f.count >= SAFE_FOOD_MIN_LOGS && f.followed === 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  // --- Symptom duration ---
  const durations = symptoms.map((s) => s.durationMin || 0)
  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
  const longest = durations.length ? Math.max(...durations) : 0

  // --- When episodes start ---
  const timeOfDay = TIME_BUCKETS.map((b) => ({ ...b, count: 0 }))
  symptoms.forEach((s) => {
    const hour = new Date(s.timestamp).getHours()
    const bucket = timeOfDay.find((b) => hour >= b.from && hour < b.to)
    if (bucket) bucket.count += 1
  })
  const topBucket = timeOfDay.reduce((best, b) => (b.count > best.count ? b : best), timeOfDay[0])
  const busiestPart = symptoms.length ? topBucket : null

  // --- Most common symptom type ---
  const perType = {}
  symptoms.forEach((s) => {
    if (s.symptomType) perType[s.symptomType] = (perType[s.symptomType] || 0) + 1
  })
  const commonSymptom = Object.entries(perType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // --- Wake time vs severity, and whether recent wake-ups are milder ---
  const wakeSeries = wakes
    .map((w) => ({ minutes: minutesOfDay(w.timestamp), severity: w.severity ?? 0 }))
    .sort((a, b) => a.minutes - b.minutes)
  let wakeTrend = null
  if (wakes.length >= 4) {
    const byTime = [...wakes].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    const half = Math.floor(byTime.length / 2)
    const avg = (list) => list.reduce((sum, w) => sum + (w.severity ?? 0), 0) / list.length
    const diff = avg(byTime.slice(-half)) - avg(byTime.slice(0, half))
    wakeTrend = diff <= -0.5 ? 'lower' : diff >= 0.5 ? 'higher' : 'steady'
  }

  // --- Meals and episodes per day (last 14 days of the range) ---
  const weeklyTrend = []
  const trendDays = Math.min(14, dayCount)
  for (let i = trendDays - 1; i >= 0; i--) {
    const day = startOfDay(to)
    day.setDate(day.getDate() - i)
    const next = new Date(day)
    next.setDate(day.getDate() + 1)
    const countForDay = (list) =>
      list.filter((entry) => {
        const t = new Date(entry.timestamp).getTime()
        return t >= day.getTime() && t < next.getTime()
      }).length
    weeklyTrend.push({
      dateLabel: day.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      label: day.toLocaleDateString([], { weekday: 'short' }),
      meals: countForDay(meals),
      symptoms: countForDay(symptoms),
    })
  }

  return {
    from,
    to,
    days: dayCount,
    episodeCount: symptoms.length,
    mealCount: meals.length,
    wakeCount: wakes.length,
    baseline,
    foods,
    allFoods,
    safeFoods,
    avgDuration,
    longest,
    timeOfDay,
    busiestPart,
    commonSymptom,
    wakeSeries,
    wakeTrend,
    week: weeklyTrend,
  }
}
