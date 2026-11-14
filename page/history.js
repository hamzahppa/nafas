import { getText } from '@zos/i18n'
import { push } from '@zos/router'
import { align } from '@zos/ui'
import { formatClock, formatWhen } from '../utils/format'
import { nameKey } from '../utils/presets'
import { loadHistory } from '../utils/store'
import { CARD_FILL, card, fill, INK_SOFT, label, mark, onClick, presetAccent } from '../utils/ui'

const CARD_X = 48
const CARD_W = 370
const CARD_H = 108
const CARD_GAP = 12
const INNER_X = 78
const INNER_W = 316

Page({
  build() {
    fill(0x000000)
    label({ y: 78, h: 36, text_size: 26, color: INK_SOFT, text: getText('history') })
    const list = loadHistory()
    if (!list.length) {
      label({ y: 210, color: INK_SOFT, text: getText('no_history') })
      return
    }
    let y = 124
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
      radius: 26,
      color: CARD_FILL,
      click_func: open,
    })
    mark({ x: 64, y: y + 26, h: 56, color: presetAccent(record.presetId) })
    const title = label({
      x: INNER_X,
      y: y + 14,
      w: INNER_W,
      h: 40,
      text_size: 26,
      align_h: align.LEFT,
      text: getText(nameKey(record.presetId)),
    })
    const subtitle = label({
      x: INNER_X,
      y: y + 56,
      w: INNER_W,
      h: 32,
      text_size: 20,
      align_h: align.LEFT,
      color: INK_SOFT,
      text: `${formatClock(record.durationMs)} · ${formatWhen(record.savedAt)}`,
    })
    onClick(title, open)
    onClick(subtitle, open)
    return y + CARD_H + CARD_GAP
  },
})
