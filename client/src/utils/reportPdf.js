import { formatDuration, toDateInput } from './dateUtils'

const TREND_TEXT = {
  lower: 'Wake-up severity has been lower recently',
  higher: 'Wake-up severity has been higher recently',
  steady: 'Wake-up severity is about the same',
}

function pdfText(value) {
  return String(value)
    .replace(/[–—]/g, '-')
    .replace(/[·•]/g, '|')
    .replace(/×/g, 'x')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e\xa0-\xff]/g, '?')
}

function formatDate(date) {
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

export async function downloadReportPdf({ report, include, triggerWindowHours, rsiMax }) {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = document.internal.pageSize.getWidth()
  const pageHeight = document.internal.pageSize.getHeight()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  let y = margin

  document.setProperties({
    title: 'TriggerTrack doctor report',
    subject: 'Personal health tracking summary',
    author: 'TriggerTrack',
  })

  const ensureSpace = (height) => {
    if (y + height > pageHeight - margin) {
      document.addPage()
      y = margin
    }
  }

  const addText = (value, { size = 10, style = 'normal', color = [38, 48, 42], indent = 0, gap = 2 } = {}) => {
    document.setFont('helvetica', style)
    document.setFontSize(size)
    document.setTextColor(...color)
    const lines = document.splitTextToSize(pdfText(value), contentWidth - indent)
    const lineHeight = (size / 72) * 25.4 * 1.25
    const blockHeight = lines.length * lineHeight
    ensureSpace(blockHeight + gap)
    document.text(lines, margin + indent, y)
    y += blockHeight + gap
  }

  const addSection = (title) => {
    ensureSpace(11)
    y += 2
    addText(title.toUpperCase(), { size: 10, style: 'bold', color: [70, 112, 78], gap: 1 })
    document.setDrawColor(217, 226, 218)
    document.line(margin, y, pageWidth - margin, y)
    y += 4
  }

  addText('TriggerTrack doctor report', { size: 18, style: 'bold', color: [55, 96, 65], gap: 2 })
  addText(`${formatDate(report.from)} - ${formatDate(report.to)}  |  Made ${formatDate(new Date())}`, {
    size: 9,
    color: [95, 105, 98],
    gap: 6,
  })

  const { data } = report
  if (include.episodes || include.wakes) {
    addSection('Summary')
    if (include.episodes) {
      addText(`Episodes: ${data.episodeCount}`)
      addText(`Average duration: ${data.episodeCount ? formatDuration(data.avgDuration) : 'No episodes logged'}`, { indent: 4 })
      if (data.commonSymptom) addText(`Most common: ${data.commonSymptom.toLowerCase()}`, { indent: 4 })
      if (data.busiestPart && data.busiestPart.count > 0) {
        addText(`Most often between ${String(data.busiestPart.from).padStart(2, '0')}:00 and ${String(data.busiestPart.to % 24).padStart(2, '0')}:00`, { indent: 4 })
      }
      if (data.episodeCount > 0) addText(`Longest episode: ${formatDuration(data.longest)}`, { indent: 4 })
    }
    if (include.wakes) {
      if (data.wakeTrend) addText(TREND_TEXT[data.wakeTrend])
      if (data.wakeCount > 0 && report.wakeAvg != null) {
        addText(`${data.wakeCount} wake-ups logged; average severity ${report.wakeAvg.toFixed(1)} of 5`, { indent: 4 })
      } else {
        addText('No wake-ups logged in this period.', { indent: 4 })
      }
    }
  }

  if (include.meals && include.episodes) {
    addSection('Foods before flare-ups')
    if (report.tags.list.length === 0) {
      addText('No tagged meals came before an episode in this period.')
    } else {
      report.tags.list.forEach((tag) => addText(`${tag.tag}: ${tag.episodes} of ${report.tags.total} episodes`, { indent: 4 }))
    }
    addText(`Counts show logged meals within ${triggerWindowHours} hours before an episode. This is not proof of cause.`, {
      size: 8,
      color: [95, 105, 98],
      gap: 3,
    })
  }

  if (include.meds) {
    addSection('Medications')
    if (report.meds.length === 0) {
      addText('No medicines logged.')
    } else {
      report.meds.forEach((med) => addText(`${med.name}${med.dose ? ` ${med.dose}` : ''} - ${med.text}`, { indent: 4 }))
    }
  }

  if (include.scores) {
    addSection('Weekly questionnaire')
    if (report.scores.length === 0) {
      addText('No check-ins in this period.')
    } else {
      report.scores.forEach((score) => {
        addText(`${formatDate(new Date(score.timestamp))} - ${score.total} of ${rsiMax}`, { indent: 4 })
      })
    }
    addText('Higher scores mean symptoms bothered you more.', { size: 8, color: [95, 105, 98] })
  }

  addSection('Not medical advice')
  addText('This report summarizes your own logs for a healthcare visit. It does not diagnose or recommend treatment.')

  document.save(`triggertrack-report-${toDateInput(report.from)}-to-${toDateInput(report.to)}.pdf`)
}
