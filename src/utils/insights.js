import { INSIGHT_DAYS, TRIGGER_WINDOW_HOURS } from './constants'
import { minutesOfDay, startOfDay } from './dateUtils'

const HOUR = 3600 * 1000

// Works out the numbers shown on the Insights screen from the logged entries.
export function computeInsights(entries) {
  const now = new Date()
  const firstDay = startOfDay(now)
  firstDay.setDate(firstDay.getDate() - (INSIGHT_DAYS - 1))
  const since = firstDay.getTime()
  const recent = entries.filter((e) => {
    const timestamp = new Date(e.timestamp).getTime()
    return timestamp >= since && timestamp <= now.getTime()
  })

  const meals = recent.filter((e) => e.type === 'meal')
  const wakes = recent.filter((e) => e.type === 'wake')
  const symptoms = recent.filter((e) => e.type === 'symptom')

  // --- Foods before flare-ups ---
  // For every tagged meal: did a symptom episode start within the next few hours?
  const perTag = {}
  meals.forEach((meal) => {
    const t = new Date(meal.timestamp).getTime()
    const followed = symptoms.some((s) => {
      const st = new Date(s.timestamp).getTime()
      return st >= t && st - t <= TRIGGER_WINDOW_HOURS * HOUR
    })
    ;(meal.tags || []).forEach((tag) => {
      perTag[tag] = perTag[tag] || { tag, eaten: 0, followed: 0 }
      perTag[tag].eaten += 1
      if (followed) perTag[tag].followed += 1
    })
  })
  const foods = Object.values(perTag)
    .filter((f) => f.followed > 0)
    .sort((a, b) => b.followed - a.followed || b.followed / b.eaten - a.followed / a.eaten)
    .slice(0, 5)

  // --- Symptom duration ---
  const durations = symptoms.map((s) => s.durationMin || 0)
  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
  const longest = durations.length ? Math.max(...durations) : 0

  // --- Wake time vs severity (one point per wake-up, ordered by time of day) ---
  const wakeSeries = wakes
    .map((w) => ({ minutes: minutesOfDay(w.timestamp), severity: w.severity ?? 0 }))
    .sort((a, b) => a.minutes - b.minutes)

  // --- Meals and episodes per day for the last 14 calendar days ---
  const weeklyTrend = []
  for (let i = 13; i >= 0; i--) {
    const day = startOfDay(now)
    day.setDate(day.getDate() - i)
    const next = new Date(day)
    next.setDate(day.getDate() + 1)
    const countForDay = (list) => list.filter((entry) => {
      const t = new Date(entry.timestamp).getTime()
      return t >= day.getTime() && t < next.getTime()
    }).length
    weeklyTrend.push({
      dateLabel: day.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      label: day.toLocaleDateString([], { weekday: 'short' }),
      meals: countForDay(recent.filter((entry) => entry.type === 'meal')),
      symptoms: countForDay(symptoms),
    })
  }

  return {
    days: INSIGHT_DAYS,
    episodeCount: symptoms.length,
    mealCount: meals.length,
    wakeCount: wakes.length,
    foods,
    avgDuration,
    longest,
    wakeSeries,
    week: weeklyTrend,
  }
}
