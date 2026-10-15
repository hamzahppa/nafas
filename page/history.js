import { getText } from '@zos/i18n'
import { push } from '@zos/router'
import { formatClock, formatWhen } from '../utils/format'
import { nameKey } from '../utils/presets'
import { loadHistory } from '../utils/store'
import { fill, label, onClick, separator } from '../utils/ui'

const COL_W = 320
const COL_X = 73

Page({
  build() {
    fill(0x000000)
    label({ y: 16, h: 36, text_size: 28, text: getText('history') })
    const list = loadHistory()
    if (!list.length) {
      label({ y: 200, color: 0xbbbbbb, text: getText('no_history') })
      return
    }
    let y = 64
    separator(COL_X, y, COL_W)
    for (let i = 0; i < list.length; i++) {
      const record = list[i]
      const top = y + 8
      const title = label({
        x: COL_X,
        y: top,
        w: COL_W,
        h: 36,
        text_size: 26,
        text: getText(nameKey(record.presetId)),
      })
      const subtitle = label({
        x: COL_X,
        y: top + 36,
        w: COL_W,
        h: 28,
        text_size: 22,
        color: 0xbbbbbb,
        text: `${formatClock(record.durationMs)} · ${formatWhen(record.savedAt)}`,
      })
      const open = () => push({ url: 'page/summary', params: `id=${record.id}` })
      onClick(title, open)
      onClick(subtitle, open)
      y += 84
      separator(COL_X, y, COL_W)
    }
    label({ x: COL_X, y: y + 12, w: COL_W, h: 48, text: ' ' })
  },
})
