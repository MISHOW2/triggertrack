import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import useLocalStorage from '../hooks/useLocalStorage'
import { KEYS, newId } from '../data/storage'
import { RSI_ITEMS, RSI_MAX, RSI_SCALE, scoreTrend } from '../utils/questionnaire'

function ScoreChart({ scores }) {
  if (scores.length < 2) return <p className="text-sm text-muted">Do a check-in on two different weeks to see your trend.</p>
  const w = 300
  const h = 70
  const pad = 8
  const xs = scores.map((_, i) => pad + (i * (w - pad * 2)) / (scores.length - 1))
  const ys = scores.map((s) => pad + (1 - s.total / RSI_MAX) * (h - pad * 2))
  const points = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`Scores over time: ${scores.map((s) => s.total).join(', ')}`}>
      <polyline points={points} fill="none" stroke="var(--sage)" strokeWidth="2" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="4" fill="var(--sage)" />
      ))}
    </svg>
  )
}

const TREND_TEXT = {
  down: 'Scores are lower than before (fewer symptoms).',
  up: 'Scores are higher than before (more symptoms).',
  steady: 'Scores are about the same.',
}

export default function QuestionnaireScreen({ onNavigate }) {
  const [history, setHistory] = useLocalStorage(KEYS.questionnaire, [])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => Array(RSI_ITEMS.length).fill(null))
  const [done, setDone] = useState(false)

  const recent = history.slice(-6)
  const trend = scoreTrend(recent)

  const finish = (finalAnswers) => {
    const total = finalAnswers.reduce((sum, a) => sum + a, 0)
    setHistory((prev) => [...prev, { id: newId(), timestamp: new Date().toISOString(), answers: finalAnswers, total }])
    setDone(true)
  }

  if (done) {
    const latest = history[history.length - 1]
    return (
      <>
        <PageHeader title="Check-in saved" onBack={() => onNavigate('insights')} />
        <section className="mb-4 rounded-3xl border border-line bg-card p-5 text-center">
          <p className="text-sm text-muted">Your score this week</p>
          <p className="mt-1 text-5xl font-bold text-sage">
            {latest?.total}
            <span className="text-xl font-semibold text-muted"> / {RSI_MAX}</span>
          </p>
          <p className="mt-2 text-sm text-muted">Higher means symptoms bothered you more.</p>
        </section>
        <section className="mb-4 rounded-3xl border border-line bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold text-muted">Your scores over time</h2>
          <ScoreChart scores={recent} />
          {trend && <p className="mt-2 text-sm">{TREND_TEXT[trend]} Bring this to your doctor.</p>}
        </section>
        <button onClick={() => onNavigate('insights')} className="min-h-14 w-full rounded-2xl bg-sage font-bold text-white">
          Done
        </button>
      </>
    )
  }

  const answer = answers[index]
  const select = (value) => setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)))
  const last = index === RSI_ITEMS.length - 1
  const next = () => (last ? finish(answers) : setIndex(index + 1))

  return (
    <>
      <PageHeader
        title="Weekly check-in"
        subtitle={`Question ${index + 1} of ${RSI_ITEMS.length}`}
        onBack={() => (index === 0 ? onNavigate('insights') : setIndex(index - 1))}
      />

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-chip" role="progressbar" aria-valuemin={1} aria-valuemax={RSI_ITEMS.length} aria-valuenow={index + 1}>
        <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${((index + 1) / RSI_ITEMS.length) * 100}%` }} />
      </div>

      <section className="mb-5 rounded-3xl border border-line bg-card p-5">
        <h2 className="text-lg font-bold leading-snug">In the last week, how much did {RSI_ITEMS[index]} bother you?</h2>
      </section>

      <div className="mb-5 grid grid-cols-6 gap-2" role="radiogroup" aria-label="Score from 0 to 5">
        {RSI_SCALE.map(({ value, label }) => (
          <button
            key={value}
            role="radio"
            aria-checked={answer === value}
            onClick={() => select(value)}
            className={`flex min-h-16 flex-col items-center justify-center rounded-xl border text-lg font-bold ${
              answer === value ? 'border-sage bg-sage text-white' : 'border-line bg-card'
            }`}
          >
            {value}
            <span className="text-[10px] font-normal">{label || ' '}</span>
          </button>
        ))}
      </div>

      <button onClick={next} disabled={answer === null} className="mb-5 min-h-14 w-full rounded-2xl bg-sage font-bold text-white disabled:opacity-40">
        {last ? 'Save check-in' : 'Next'}
      </button>

      <section className="rounded-3xl border border-line bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold text-muted">Your scores over time</h2>
        <ScoreChart scores={recent} />
        {trend && <p className="mt-2 text-sm">{TREND_TEXT[trend]} Bring this to your doctor.</p>}
      </section>
    </>
  )
}
