import { getText } from '@zos/i18n'
import { push } from '@zos/router'
import { text_style } from '@zos/ui'
import { formatMinutes, readParam } from '../utils/format'
import { nameKey, patternText, presetById } from '../utils/presets'
import { button, fill, label } from '../utils/ui'

const COL_W = 320
const COL_X = 73

const PURPOSE = {
  coherence: 'purpose_coherence',
  relax: 'purpose_relax',
  'relax-short': 'purpose_relax_short',
  tranquility: 'purpose_tranquility',
}

Page({
  onInit(params) {
    this.presetId = readParam(params, 'preset')
  },

  build() {
    const preset = presetById(this.presetId)
    fill(0x000000)
    if (!preset) {
      label({ y: 200, text: getText('missing') })
      return
    }
    label({
      x: COL_X,
      y: 96,
      w: COL_W,
      h: 84,
      text_size: 32,
      text_style: text_style.WRAP,
      text: getText(nameKey(preset.id)),
    })
    label({
      x: COL_X,
      y: 188,
      w: COL_W,
      h: 64,
      text_size: 26,
      color: 0xbbbbbb,
      text_style: text_style.WRAP,
      text: getText(PURPOSE[preset.id]),
    })
    label({
      x: COL_X,
      y: 260,
      w: COL_W,
      h: 40,
      text_size: 32,
      text: `${formatMinutes(preset.durationSec)} ${getText('min')}`,
    })
    label({
      x: COL_X,
      y: 308,
      w: COL_W,
      h: 40,
      text_size: 26,
      color: 0xbbbbbb,
      text: `${getText('pattern')} ${patternText(preset.target)}`,
    })
    let buttonY = 368
    const easesIn = !preset.steps || preset.steps.length > 1
    if (easesIn) {
      label({
        x: COL_X,
        y: 356,
        w: COL_W,
        h: 56,
        text_size: 22,
        color: 0x888888,
        text_style: text_style.WRAP,
        text: getText('eases_in'),
      })
      buttonY = 424
    }
    button({
      x: 83,
      y: buttonY,
      w: 300,
      h: 64,
      text_size: 30,
      color: 0x1b7a45,
      text: getText('start'),
      click_func: () => {
        push({ url: 'page/session', params: `preset=${preset.id}` })
      },
    })
    label({ x: COL_X, y: buttonY + 72, w: COL_W, h: 36, text: ' ' })
  },
})
