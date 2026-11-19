import { Activity, ArrowRight, Moon, Sun, UtensilsCrossed } from 'lucide-react'
import { formatDuration, formatTime } from '../utils/dateUtils'

// Colour per entry type. Text colours are chosen to stay above WCAG AA on each background.
const META = {
  meal: { label: 'Meal', Icon: UtensilsCrossed, card: 'bg-sage text-white' },
  wake: { label: 'Wake-up', Icon: Sun, card: 'bg-amber text-[#1f2d27]' },
  bedtime: { label: 'Bedtime', Icon: Moon, card: 'bg-teal text-white' },
  symptom: { label: 'Symptom', Icon: Activity, card: 'bg-[#5b4a8a] text-white' },
}

const MAX_CARDS = 8

function titleFor(e) {
  if (e.type === 'meal') return e.name
  if (e.type === 'wake') return 'Woke up'
  if (e.type === 'bedtime') return 'Bedtime'
  return e.symptomType
}

function detailFor(e) {
  if (e.type === 'meal') {
    const tags = e.tags || []
    if (tags.length === 0) return 'No tags'
    return tags.length > 2 ? `${tags.slice(0, 2).join(', ')} +${tags.length - 2}` : tags.join(', ')
  }
  if (e.type === 'symptom') return `Lasted ${formatDuration(e.durationMin)}`
  return ''
}

// Today's entries as a swipeable row, so a long day never makes the Home screen a long list.
// Newest first. Shows the latest few, then a card that opens the full History.
export default function TodayCarousel({ entries, onSeeAll }) {
  const shown = entries.slice(0, MAX_CARDS)
  const hidden = entries.length - shown.length

  return (
    <section aria-label="Today's log">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-muted">
          Today's log <span className="font-normal">· {entries.length}</span>
        </h2>
        <button onClick={onSeeAll} className="flex min-h-11 items-center gap-1 px-1 text-sm font-semibold text-sage">
          See all <ArrowRight size={16} aria-hidden />
        </button>
      </div>

      <ul
        tabIndex={0}
        aria-label="Today's entries, swipe sideways"
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-3"
      >
        {shown.map((e) => {
          const { label, Icon, card } = META[e.type]
          const detail = detailFor(e)
          return (
            <li key={e.id} className={`flex h-36 w-40 shrink-0 snap-start flex-col rounded-3xl p-4 shadow-md ${card}`}>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <Icon size={15} aria-hidden />
                  {label}
                </span>
                <span>{formatTime(e.timestamp)}</span>
              </div>
              <p className="mt-3 line-clamp-2 text-lg font-bold leading-tight">{titleFor(e)}</p>
              {detail && <p className="mt-auto truncate text-sm">{detail}</p>}
            </li>
          )
        })}
        <li className="shrink-0 snap-start">
          <button
            onClick={onSeeAll}
            className="flex h-36 w-32 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line bg-card text-sm font-semibold text-sage"
          >
            <ArrowRight size={22} aria-hidden />
            {hidden > 0 ? `${hidden} more` : 'All history'}
          </button>
        </li>
      </ul>
    </section>
  )
}
