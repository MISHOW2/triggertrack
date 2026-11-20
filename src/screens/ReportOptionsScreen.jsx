import { useMemo, useState } from 'react'
import { Download, Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { ToggleRow } from '../components/Toggle'
import useLocalStorage from '../hooks/useLocalStorage'
import { KEYS } from '../data/storage'
import { TRIGGER_WINDOW_HOURS } from '../utils/constants'
import { RSI_MAX } from '../utils/questionnaire'
import { DEFAULT_REPORT_OPTIONS, buildReport, PRESETS } from '../utils/reportData'
import { downloadReportPdf } from '../utils/reportPdf'
import { toDateInput } from '../utils/dateUtils'
import { inputClass } from '../components/fields'

const INCLUDE = [
  ['meals', 'Meals and trigger tags'],
  ['episodes', 'Symptom episodes'],
  ['wakes', 'Wake-up pattern'],
  ['meds', 'Medication log'],
  ['scores', 'Questionnaire scores'],
]

export default function ReportOptionsScreen({ entries, onNavigate }) {
  const [options, setOptions] = useLocalStorage(KEYS.reportRange, DEFAULT_REPORT_OPTIONS)
  const [meds] = useLocalStorage(KEYS.meds, [])
  const [medLogs] = useLocalStorage(KEYS.medLogs, [])
  const [scores] = useLocalStorage(KEYS.questionnaire, [])
  const today = toDateInput(new Date())
  const set = (patch) => setOptions((prev) => ({ ...DEFAULT_REPORT_OPTIONS, ...prev, ...patch }))
  const toggle = (key) => set({ include: { ...DEFAULT_REPORT_OPTIONS.include, ...options.include, [key]: !(options.include ?? DEFAULT_REPORT_OPTIONS.include)[key] } })
  const include = { ...DEFAULT_REPORT_OPTIONS.include, ...options.include }
  const reportOptions = { ...DEFAULT_REPORT_OPTIONS, ...options, include }
  const customIncomplete = options.preset === 'custom' && !options.from
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const report = useMemo(
    () => buildReport({ entries, options: reportOptions, meds, medLogs, scores }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, options, meds, medLogs, scores],
  )
  const downloadReport = async () => {
    setDownloading(true)
    setDownloadError('')
    try {
      await downloadReportPdf({ report, include, triggerWindowHours: TRIGGER_WINDOW_HOURS, rsiMax: RSI_MAX })
    } catch (error) {
      console.error('Failed to create doctor report PDF', error)
      setDownloadError('The PDF could not be created. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <PageHeader title="Report options" onBack={() => onNavigate('insights')} />

      <section className="mb-4" aria-label="Date range">
        <h2 className="mb-2 font-bold">Date range</h2>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {Object.entries(PRESETS).map(([id, { label }]) => (
            <button
              key={id}
              onClick={() => set({ preset: id })}
              aria-pressed={options.preset === id}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold ${
                options.preset === id ? 'border-sage bg-sage text-white' : 'border-line bg-card text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {options.preset === 'custom' && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold">
              From
              <input type="date" className={`${inputClass} mt-1`} max={today} value={options.from} onChange={(e) => set({ from: e.target.value })} />
            </label>
            <label className="text-sm font-semibold">
              To
              <input type="date" className={`${inputClass} mt-1`} max={today} min={options.from || undefined} value={options.to} onChange={(e) => set({ to: e.target.value })} />
            </label>
          </div>
        )}
      </section>

      <section className="mb-4 rounded-3xl border border-line bg-card px-4 py-2" aria-label="Include">
        <h2 className="pt-2 font-bold">Include</h2>
        <div className="divide-y divide-line">
          {INCLUDE.map(([key, label]) => (
            <ToggleRow key={key} title={label} checked={Boolean(include[key])} onChange={() => toggle(key)} />
          ))}
        </div>
      </section>

      <section className="mb-4 rounded-3xl bg-sage-soft p-4">
        <h2 className="font-bold text-sage">Private by default</h2>
        <p className="text-sm text-muted">The report is made on this phone. Nothing is sent anywhere unless you share it yourself.</p>
      </section>

      <button
        onClick={() => onNavigate('report')}
        disabled={customIncomplete}
        className="mb-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sage font-bold text-white disabled:opacity-40"
      >
        <Eye size={18} aria-hidden /> Preview report
      </button>
      <button
        onClick={downloadReport}
        disabled={customIncomplete || downloading}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-sage font-bold text-sage disabled:opacity-40"
      >
        <Download size={18} aria-hidden /> {downloading ? 'Preparing PDF…' : 'Download PDF'}
      </button>
      {downloadError && <p role="alert" className="mt-2 text-sm text-red-700">{downloadError}</p>}
    </>
  )
}
