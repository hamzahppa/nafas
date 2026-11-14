import { getText } from '@zos/i18n'
import { push, replace } from '@zos/router'
import { align, text_style } from '@zos/ui'
import { formatMinutes } from '../utils/format'
import { nameKey, PRESETS } from '../utils/presets'
import { buildRecord } from '../utils/record'
import { readStress } from '../utils/sensors'
import { clearActive, loadActive, pushHistory } from '../utils/store'
import { button, CARD_FILL, card, fill, INK_SOFT, label, mark, onClick, presetAccent } from '../utils/ui'

const COL_W = 340
const COL_X = 63
const CARD_X = 40
const CARD_W = 386
const CARD_H = 170
const CARD_GAP = 14
const INNER_X = 76
const INNER_W = 326

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
    let y = 84
    if (active && active.presetId) {
      y = 48
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
    for (let i = 0; i < PRESETS.length; i++) {
      y = this.presetCard(PRESETS[i], y)
    }
    button({
      x: 83,
      y: y + 12,
      w: 300,
      h: 58,
      color: CARD_FILL,
      text: getText('history'),
      click_func: () => push({ url: 'page/history' }),
    })
    label({ x: COL_X, y: y + 88, w: COL_W, h: 48, text: ' ' })
  },

  presetCard(preset, y) {
    const open = () => push({ url: 'page/detail', params: `preset=${preset.id}` })
    const accent = presetAccent(preset.id)
    card({
      x: CARD_X,
      y,
      w: CARD_W,
      h: CARD_H,
      radius: 28,
      color: CARD_FILL,
      click_func: open,
    })
    mark({ x: 56, y: y + 28, h: 114, color: accent })
    const title = label({
      x: INNER_X,
      y: y + 16,
      w: INNER_W,
      h: 40,
      text_size: 30,
      align_h: align.LEFT,
      text: getText(nameKey(preset.id)),
    })
    const purpose = label({
      x: INNER_X,
      y: y + 58,
      w: INNER_W,
      h: 60,
      text_size: 20,
      align_h: align.LEFT,
      color: INK_SOFT,
      text_style: text_style.WRAP,
      text: getText(PURPOSE[preset.id]),
    })
    const duration = label({
      x: INNER_X,
      y: y + 124,
      w: INNER_W,
      h: 28,
      text_size: 22,
      align_h: align.LEFT,
      color: accent,
      text: `${formatMinutes(preset.durationSec)} ${getText('min')}`,
    })
    onClick(title, open)
    onClick(purpose, open)
    onClick(duration, open)
    return y + CARD_H + CARD_GAP
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
