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
