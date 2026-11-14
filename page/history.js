import { getText } from '@zos/i18n'
import { push } from '@zos/router'
import { formatClock, formatWhen } from '../utils/format'
import { nameKey } from '../utils/presets'
import { loadHistory } from '../utils/store'
import { card, fill, label, onClick, presetSurface, TEXT_SOFT } from '../utils/ui'

const CARD_X = 48
const CARD_W = 370
const CARD_H = 104
const CARD_GAP = 12
const INNER_X = 66
const INNER_W = 334

Page({
  build() {
    fill(0x000000)
    label({ y: 72, h: 36, text_size: 28, text: getText('history') })
    const list = loadHistory()
    if (!list.length) {
      label({ y: 210, color: TEXT_SOFT, text: getText('no_history') })
      return
    }
    let y = 120
    for (let i = 0; i < list.length; i++) {
      y = this.historyCard(list[i], y)
    }
    label({ x: INNER_X, y: y + 8, w: INNER_W, h: 48, text: ' ' })
  },

  historyCard(record, y) {
    const open = () => push({ url: 'page/summary', params: `id=${record.id}` })
    card({
      x: CARD_X,
      y,
      w: CARD_W,
      h: CARD_H,
      color: presetSurface(record.presetId),
      click_func: open,
    })
    const title = label({
      x: INNER_X,
      y: y + 12,
      w: INNER_W,
      h: 40,
      text_size: 28,
      text: getText(nameKey(record.presetId)),
    })
    const subtitle = label({
      x: INNER_X,
      y: y + 54,
      w: INNER_W,
      h: 36,
      text_size: 22,
      color: TEXT_SOFT,
      text: `${formatClock(record.durationMs)} · ${formatWhen(record.savedAt)}`,
    })
    onClick(title, open)
    onClick(subtitle, open)
    return y + CARD_H + CARD_GAP
  },
})
