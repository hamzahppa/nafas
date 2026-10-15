import { getText } from '@zos/i18n'
import { push, replace } from '@zos/router'
import { text_style } from '@zos/ui'
import { formatMinutes } from '../utils/format'
import { nameKey, PRESETS } from '../utils/presets'
import { buildRecord } from '../utils/record'
import { readStress } from '../utils/sensors'
import { clearActive, loadActive, pushHistory } from '../utils/store'
import { button, fill, label, onClick, separator } from '../utils/ui'

const COL_W = 340
const COL_X = 63

const PURPOSE = {
  coherence: 'purpose_coherence',
  relax: 'purpose_relax',
  'relax-short': 'purpose_relax_short',
  tranquility: 'purpose_tranquility',
}

Page({
  build() {
    fill(0x000000)
    const active = loadActive()
    let y = 48
    if (active && active.presetId) {
      label({
        x: COL_X,
        y,
        w: COL_W,
        h: 36,
        text_size: 26,
        text: getText('session_paused'),
      })
      button({
        x: 83,
        y: y + 42,
        w: 300,
        h: 58,
        color: 0x1b7a45,
        text: getText('resume'),
        click_func: () => push({ url: 'page/session', params: 'resume=1' }),
      })
      button({
        x: 83,
        y: y + 108,
        w: 300,
        h: 58,
        color: 0x1a4e9c,
        text: getText('save'),
        click_func: () => this.savePaused(active),
      })
      y += 178
    }
    separator(COL_X, y, COL_W)
    for (let i = 0; i < PRESETS.length; i++) {
      const preset = PRESETS[i]
      const top = y + 6
      const title = label({
        x: COL_X,
        y: top,
        w: COL_W,
        h: 76,
        text_size: 32,
        text_style: text_style.WRAP,
        text: getText(nameKey(preset.id)),
      })
      const subtitle = label({
        x: COL_X,
        y: top + 76,
        w: COL_W,
        h: 64,
        text_size: 26,
        color: 0xbbbbbb,
        text_style: text_style.WRAP,
        text: `${getText(PURPOSE[preset.id])} · ${formatMinutes(preset.durationSec)} ${getText('min')}`,
      })
      const open = () => push({ url: 'page/detail', params: `preset=${preset.id}` })
      onClick(title, open)
      onClick(subtitle, open)
      y += 156
      separator(COL_X, y, COL_W)
    }
    button({
      x: 83,
      y: y + 12,
      w: 300,
      h: 58,
      text: getText('history'),
      click_func: () => push({ url: 'page/history' }),
    })
    label({ x: COL_X, y: y + 88, w: COL_W, h: 48, text: ' ' })
  },

  savePaused(active) {
    if (!active.stressEnd) {
      const sample = readStress()
      if (sample && sample.value > 0) {
        if (!active.stressStart) active.stressStart = sample
        else if (sample.time !== active.stressStart.time) active.stressEnd = sample
      }
    }
    const record = buildRecord(active, Date.now())
    if (!record) return
    pushHistory(record)
    clearActive()
    replace({ url: 'page/summary', params: `id=${record.id}` })
  },
})
