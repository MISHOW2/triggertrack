// Fixed lists used across the app. Edit these to change what you can tag.

export const TRIGGER_TAGS = [
  'Coffee',
  'Tomato',
  'Citrus',
  'Fried food',
  'Chocolate',
  'Spicy food',
  'Alcohol',
  'Dairy',
  'Carbonated',
  'Late-night meal',
]

export const WAKE_SYMPTOMS = [
  'Throat clearing',
  'Hoarseness',
  'Cough',
  'Burning',
  'Bad taste',
  'Sour regurgitation',
]

export const SYMPTOM_TYPES = [
  'Regurgitation',
  'Heartburn',
  'Throat clearing',
  'Hoarseness',
  'Cough',
  'Burning',
  'Bad taste',
  'Lump in throat',
]

export const BEDTIME_STRESS_LEVELS = [
  { value: 1, label: 'Very relaxed' },
  { value: 2, label: 'Relaxed' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Stressed' },
  { value: 5, label: 'Very stressed' },
]

export const BEDTIME_DIGESTION_STATES = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'slightly-full', label: 'Slightly full' },
  { value: 'very-full', label: 'Very full' },
  { value: 'uncomfortable', label: 'Uncomfortable' },
  { value: 'not-sure', label: 'Not sure' },
]

// 0 is only used for wake-ups ("woke with no symptoms")
export const SEVERITY_LABELS = {
  0: 'None',
  1: 'Very mild',
  2: 'Mild',
  3: 'Moderate',
  4: 'Significant',
  5: 'Severe',
}

// How many hours before a flare-up a meal counts as a possible trigger
export const TRIGGER_WINDOW_HOURS = 4

// How many days of history the Insights screen looks at
export const INSIGHT_DAYS = 14
