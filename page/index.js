import { getText } from '@zos/i18n'
import { push, replace } from '@zos/router'
import { text_style } from '@zos/ui'
import { formatMinutes } from '../utils/format'
import { nameKey, PRESETS } from '../utils/presets'
import { buildRecord } from '../utils/record'
import { readStress } from '../utils/sensors'
import { clearActive, loadActive, pushHistory } from '../utils/store'
import { button, card, fill, label, onClick } from '../utils/ui'

const COL_W = 340
const COL_X = 63
const CARD_X = 40
const CARD_W = 386
const CARD_H = 188
const CARD_GAP = 16
const INNER_X = 58
const INNER_W = 350

const PURPOSE = {
  coherence: 'purpose_coherence',
  relax: 'purpose_relax',
  'relax-short': 'purpose_relax_short',
  tranquility: 'purpose_tranquility',
}

const CARD_STYLE = {
  coherence: { color: 0x1a3d2e, accent: 0x7dcea0 },
  relax: { color: 0x1a3358, accent: 0x8eb6ff },
  'relax-short': { color: 0x243e66, accent: 0xa8c8ff },
  tranquility: { color: 0x3a2a52, accent: 0xd4b4f0 },
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
      text: getText('history'),
      click_func: () => push({ url: 'page/history' }),
    })
    label({ x: COL_X, y: y + 88, w: COL_W, h: 48, text: ' ' })
  },

  presetCard(preset, y) {
    const style = CARD_STYLE[preset.id] || { color: 0x1a1f27, accent: 0xbbbbbb }
    const open = () => push({ url: 'page/detail', params: `preset=${preset.id}` })
    card({
      x: CARD_X,
      y,
      w: CARD_W,
      h: CARD_H,
      color: style.color,
      click_func: open,
    })
    const title = label({
      x: INNER_X,
      y: y + 16,
      w: INNER_W,
      h: 44,
      text_size: 32,
      text: getText(nameKey(preset.id)),
    })
    const purpose = label({
      x: INNER_X,
      y: y + 64,
      w: INNER_W,
      h: 72,
      text_size: 22,
      color: 0xd0d0d0,
      text_style: text_style.WRAP,
      text: getText(PURPOSE[preset.id]),
    })
    const duration = label({
      x: INNER_X,
      y: y + 140,
      w: INNER_W,
      h: 32,
      text_size: 24,
      color: style.accent,
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
