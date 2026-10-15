import { getText } from '@zos/i18n'
import { push } from '@zos/router'
import { align, text_style } from '@zos/ui'
import { stressDelta } from '../utils/engine'
import { formatClock, formatDelta, formatNumber, readParam } from '../utils/format'
import { nameKey } from '../utils/presets'
import { findSession } from '../utils/store'
import { button, fill, label } from '../utils/ui'

const COL_W = 320
const COL_X = 73

function stressRow(change, y) {
  const caption = `${getText('stress_change')} ${formatDelta(change)}`
  const arrow = change > 0 ? '↑' : change < 0 ? '↓' : ''
  const textW = caption.length * 13
  const arrowW = arrow ? 30 : 0
  const x = COL_X + Math.max(0, Math.round((COL_W - textW - arrowW) / 2))
  label({
    x,
    y,
    w: textW + 6,
    h: 36,
    text_size: 26,
    align_h: align.LEFT,
    text: caption,
  })
  if (!arrow) return
  label({
    x: x + textW,
    y,
    w: arrowW,
    h: 36,
    text_size: 28,
    align_h: align.LEFT,
    color: change > 0 ? 0xd64545 : 0x2eae6a,
    text: arrow,
  })
}

Page({
  onInit(params) {
    this.id = readParam(params, 'id')
  },

  build() {
    fill(0x000000)
    const record = findSession(this.id)
    if (!record) {
      label({ y: 200, text: getText('missing') })
      return
    }
    label({
      x: COL_X,
      y: 72,
      w: COL_W,
      h: 72,
      text_size: 32,
      text_style: text_style.WRAP,
      text: getText(nameKey(record.presetId)),
    })
    label({
      x: COL_X,
      y: 152,
      w: COL_W,
      h: 40,
      text_size: 28,
      text: `${getText('duration')} ${formatClock(record.durationMs)}`,
    })
    label({
      x: COL_X,
      y: 196,
      w: COL_W,
      h: 48,
      text_size: 26,
      text_style: text_style.WRAP,
      text: `${getText('paced_rate')} ${formatNumber(record.pacedRate)}`,
    })
    label({
      x: COL_X,
      y: 248,
      w: COL_W,
      h: 40,
      text_size: 26,
      text: `${getText('avg_hr')} ${formatNumber(record.avgHr)}`,
    })
    stressRow(stressDelta(record.stressStart, record.stressEnd), 292)
    button({
      x: 93,
      y: 340,
      w: 280,
      h: 52,
      text: getText('all_stats'),
      click_func: () =>
        push({
          url: 'page/stats',
          params: `id=${record.id}`,
        }),
    })
  },
})
