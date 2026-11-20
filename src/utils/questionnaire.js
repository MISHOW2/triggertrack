// Weekly check-in: the nine-item Reflux Symptom Index (RSI), each item scored 0 (no problem) to 5 (severe problem).
// Source: Belafsky PC et al., J Voice 2002. It is a published clinical questionnaire, so confirm you are happy with
// its use and attribution before launch. Edit the wording here; nothing else depends on it.

export const RSI_ITEMS = [
  'hoarseness or a problem with your voice',
  'clearing your throat',
  'excess throat mucus or postnasal drip',
  'difficulty swallowing food, liquids or pills',
  'coughing after you ate or after lying down',
  'breathing difficulties or choking episodes',
  'a troublesome or annoying cough',
  'a sensation of something sticking in your throat, or a lump in your throat',
  'heartburn, chest pain, indigestion or stomach acid coming up',
]

export const RSI_MAX = RSI_ITEMS.length * 5

export const RSI_SCALE = [
  { value: 0, label: 'None' },
  { value: 1, label: '' },
  { value: 2, label: '' },
  { value: 3, label: '' },
  { value: 4, label: '' },
  { value: 5, label: 'Severe' },
]

// How the last few scores moved (a lower score means fewer symptoms)
export function scoreTrend(scores) {
  if (scores.length < 2) return null
  const last = scores[scores.length - 1].total
  const first = scores[0].total
  if (last <= first - 3) return 'down'
  if (last >= first + 3) return 'up'
  return 'steady'
}
