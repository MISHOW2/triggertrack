import { SEVERITY_LABELS } from '../utils/constants'

const STYLES = {
  0: 'bg-sage-soft text-sage',
  1: 'bg-sage-soft text-sage',
  2: 'bg-sage-soft text-sage',
  3: 'bg-amber-soft text-amber',
  4: 'bg-amber-soft text-amber',
  5: 'bg-danger-soft text-danger',
}

export default function SeverityBadge({ level }) {
  if (level === undefined || level === null) return null
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[level]}`}>
      {SEVERITY_LABELS[level]}
    </span>
  )
}
