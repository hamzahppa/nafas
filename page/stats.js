import { getText } from '@zos/i18n'
import { setScrollMode, SCROLL_MODE_FREE } from '@zos/page'
import { text_style } from '@zos/ui'
import { minuteHr } from '../utils/engine'
import { formatClock, formatNumber, readParam } from '../utils/format'
import { nameKey } from '../utils/presets'
import { findSession } from '../utils/store'
import { fill, label, SCREEN } from '../utils/ui'

const COL_W = 320
const COL_X = 73

function eventLine(event) {
  const time = formatClock(event.sessionMs)
  if (event.type === 'skip') return `${time} ${getText('skip')}`
  if (event.type === 'pause') return `${time} ${getText('pause')}`
  if (event.type === 'resume') return `${time} ${getText('resume')}`
  if (event.type === 'phase') {
    const name =
      event.kind === 'inhale'
        ? getText('phase_inhale')
        : event.kind === 'exhale'
          ? getText('phase_exhale')
          : getText('phase_hold')
    return `${time} ${name}`
  }
  return time
}

function stepLines(timeline) {
  const lines = []
  let lastStep = -1
  for (let i = 0; i < timeline.length; i++) {
    const event = timeline[i]
    if (event.type === 'phase') {
      if (event.stepIndex === lastStep) continue
      lastStep = event.stepIndex
    }
    lines.push(eventLine(event))
    if (lines.length >= 20) break
  }
  return lines
}

Page({
  onInit(params) {
    this.id = readParam(params, 'id')
  },

  build() {
    setScrollMode({ mode: SCROLL_MODE_FREE })
    const record = findSession(this.id)
    if (!record) {
      fill(0x000000)
      label({ y: 200, text: getText('missing') })
      return
    }

    const minutes = minuteHr(record.hrSamples || [])
    const lines = stepLines(record.timeline || [])
    const hrRows = minutes.length ? Math.min(minutes.length, 16) : 1
    const phaseRows = lines.length ? lines.length : 1
    const contentBottom = 72 + 72 + 52 + 40 + hrRows * 34 + 12 + 40 + phaseRows * 34 + 120
    fill(0x000000, Math.max(SCREEN, contentBottom))

    label({
      x: COL_X,
      y: 40,
      w: COL_W,
      h: 40,
      text_size: 26,
      color: 0xbbbbbb,
      text: getText('all_stats'),
    })
    label({
      x: COL_X,
      y: 84,
      w: COL_W,
      h: 48,
      text_size: 30,
      text_style: text_style.WRAP,
      text: getText(nameKey(record.presetId)),
    })

    let y = 144
    label({
      x: COL_X,
      y,
      w: COL_W,
      h: 44,
      text_size: 28,
      text: `${getText('max_hr')} ${formatNumber(record.maxHr)}`,
    })
    y += 52
    label({
      x: COL_X,
      y,
      w: COL_W,
      h: 36,
      text_size: 24,
      color: 0xbbbbbb,
      text: getText('hr_timeline'),
    })
    y += 40
    if (!minutes.length) {
      label({ x: COL_X, y, w: COL_W, h: 32, text_size: 24, color: 0x888888, text: '—' })
      y += 40
    }
    for (let i = 0; i < minutes.length && i < 16; i++) {
      label({
        x: COL_X,
        y,
        w: COL_W,
        h: 32,
        text_size: 24,
        color: 0xdddddd,
        text: `${minutes[i].minute} ${getText('min')} · ${minutes[i].avg}`,
      })
      y += 34
    }
    y += 12
    label({
      x: COL_X,
      y,
      w: COL_W,
      h: 36,
      text_size: 24,
      color: 0xbbbbbb,
      text: getText('phase_timeline'),
    })
    y += 40
    if (!lines.length) {
      label({ x: COL_X, y, w: COL_W, h: 32, text_size: 24, color: 0x888888, text: '—' })
      y += 40
    }
    for (let i = 0; i < lines.length; i++) {
      label({
        x: COL_X,
        y,
        w: COL_W,
        h: 32,
        text_size: 22,
        color: 0xdddddd,
        text: lines[i],
      })
      y += 34
    }
    label({ x: COL_X, y: y + 8, w: COL_W, h: 80, text: ' ' })
  },
})
