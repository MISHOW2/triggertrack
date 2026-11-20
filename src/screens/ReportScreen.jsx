import { useMemo, useState } from 'react'
import { Download, ShieldAlert } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import useLocalStorage from '../hooks/useLocalStorage'
import { KEYS } from '../data/storage'
import { DEFAULT_REPORT_OPTIONS, buildReport } from '../utils/reportData'
import { formatDuration } from '../utils/dateUtils'
import { TRIGGER_WINDOW_HOURS } from '../utils/constants'
import { RSI_MAX } from '../utils/questionnaire'
import { downloadReportPdf } from '../utils/reportPdf'

const fmtDate = (d) => d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
const TREND_TEXT = { lower: 'Wake-up severity has been lower recently', higher: 'Wake-up severity has been higher recently', steady: 'Wake-up severity is about the same' }

function Section({ title, children }) {
  return (
    <section className="mb-4 rounded-3xl border border-line bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  )
}

export default function ReportScreen({ entries, onNavigate }) {
  const [stored] = useLocalStorage(KEYS.reportRange, DEFAULT_REPORT_OPTIONS)
  const [meds] = useLocalStorage(KEYS.meds, [])
  const [medLogs] = useLocalStorage(KEYS.medLogs, [])
  const [scores] = useLocalStorage(KEYS.questionnaire, [])
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const options = { ...DEFAULT_REPORT_OPTIONS, ...stored, include: { ...DEFAULT_REPORT_OPTIONS.include, ...stored.include } }
  const inc = options.include

  const report = useMemo(
    () => buildReport({ entries, options, meds, medLogs, scores }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, stored, meds, medLogs, scores],
  )
  const { data, tags, meds: medRows } = report
  const maxTag = Math.max(1, ...tags.list.map((t) => t.episodes))
  const downloadReport = async () => {
    setDownloading(true)
    setDownloadError('')
    try {
      await downloadReportPdf({ report, include: inc, triggerWindowHours: TRIGGER_WINDOW_HOURS, rsiMax: RSI_MAX })
    } catch (error) {
      console.error('Failed to create doctor report PDF', error)
      setDownloadError('The PDF could not be created. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Doctor report" subtitle={`${fmtDate(report.from)} – ${fmtDate(report.to)}`} onBack={() => onNavigate('report-options')} />

      {(inc.episodes || inc.wakes) && (
        <Section title="Summary">
          {inc.episodes && (
            <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
              <p>
                <span className="text-4xl font-bold text-sage">{data.episodeCount}</span>{' '}
                <span className="text-sm text-muted">{data.episodeCount === 1 ? 'episode' : 'episodes'}</span>
              </p>
              <p>
                <span className="text-4xl font-bold text-sage">{data.episodeCount ? formatDuration(data.avgDuration) : '—'}</span>{' '}
                <span className="text-sm text-muted">avg duration</span>
              </p>
            </div>
          )}
          <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            {inc.episodes && data.commonSymptom && (
              <p>
                Most common: {data.commonSymptom.toLowerCase()}
                {data.busiestPart && data.busiestPart.count > 0 ? ` · most often between ${String(data.busiestPart.from).padStart(2, '0')}:00 and ${String(data.busiestPart.to % 24).padStart(2, '0')}:00` : ''}
              </p>
            )}
            {inc.episodes && data.episodeCount > 0 && <p>Longest episode: {formatDuration(data.longest)}</p>}
            {inc.wakes && data.wakeTrend && <p className="font-medium text-sage">{TREND_TEXT[data.wakeTrend]}</p>}
            {inc.wakes && data.wakeCount > 0 && report.wakeAvg != null && (
              <p>
                {data.wakeCount} wake-ups logged · average severity {report.wakeAvg.toFixed(1)} of 5
              </p>
            )}
            {data.episodeCount === 0 && inc.episodes && <p className="text-muted">No symptom episodes were logged in this period.</p>}
          </div>
        </Section>
      )}

      {inc.meals && inc.episodes && (
        <Section title="Foods before flare-ups">
          {tags.list.length === 0 ? (
            <p className="text-sm text-muted">No tagged meals came before an episode in this period.</p>
          ) : (
            <ul className="space-y-3">
              {tags.list.map((t) => (
                <li key={t.tag}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-semibold">{t.tag}</span>
                    <span className="text-muted">
                      {t.episodes} of {tags.total} episodes
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-chip">
                    <div className="h-full rounded-full bg-sage" style={{ width: `${(t.episodes / maxTag) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">
            Counts of episodes that had a tagged meal in the {TRIGGER_WINDOW_HOURS} hours before. This shows what was logged, not what caused it.
          </p>
        </Section>
      )}

      {inc.meds && (
        <Section title="Medications">
          {medRows.length === 0 ? (
            <p className="text-sm text-muted">No medicines logged.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {medRows.map((m) => (
                <li key={m.id}>
                  <span className="font-semibold">
                    {m.name}
                    {m.dose ? ` ${m.dose}` : ''}
                  </span>{' '}
                  — {m.text}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {inc.scores && (
        <Section title="Weekly questionnaire">
          {report.scores.length === 0 ? (
            <p className="text-sm text-muted">No check-ins in this period.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {report.scores.map((s) => (
                <li key={s.id}>
                  {fmtDate(new Date(s.timestamp))} — {s.total} of {RSI_MAX}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-muted">Higher scores mean symptoms bothered you more.</p>
        </Section>
      )}

      <section className="mb-4 flex gap-3 rounded-3xl bg-amber-soft p-4 text-amber">
        <ShieldAlert size={18} className="mt-0.5 shrink-0" aria-hidden />
        <div>
          <h2 className="font-bold">Not medical advice</h2>
          <p className="text-sm">A summary of your own logs, for your visit. It does not diagnose or recommend treatment.</p>
        </div>
      </section>

      <button
        onClick={downloadReport}
        disabled={downloading}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sage font-bold text-white disabled:opacity-40"
      >
        <Download size={18} aria-hidden /> {downloading ? 'Preparing PDF…' : 'Download PDF'}
      </button>
      {downloadError && <p role="alert" className="mt-2 text-sm text-red-700">{downloadError}</p>}
    </div>
  )
}
