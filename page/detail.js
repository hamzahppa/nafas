import { getText } from '@zos/i18n'
import { push } from '@zos/router'
import { align, text_style } from '@zos/ui'
import { formatMinutes, readParam } from '../utils/format'
import { nameKey, patternText, presetById } from '../utils/presets'
import { button, CARD_FILL, card, fill, INK_SOFT, label, mark, presetAccent } from '../utils/ui'

const COL_W = 314
const COL_X = 84

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
    const accent = presetAccent(preset.id)
    const cardY = preset.steps ? 64 : 48
    const cardH = preset.steps ? 236 : 292
    card({
      x: 40,
      y: cardY,
      w: 386,
      h: cardH,
      radius: 28,
      color: CARD_FILL,
    })
    mark({ x: 58, y: cardY + 28, h: 52, color: accent })
    label({
      x: COL_X,
      y: cardY + 16,
      w: COL_W,
      h: 64,
      text_size: 32,
      align_h: align.LEFT,
      text_style: text_style.WRAP,
      text: getText(nameKey(preset.id)),
    })
    label({
      x: COL_X,
      y: cardY + 84,
      w: COL_W,
      h: 64,
      text_size: 22,
      align_h: align.LEFT,
      color: INK_SOFT,
      text_style: text_style.WRAP,
      text: getText(PURPOSE[preset.id]),
    })
    label({
      x: COL_X,
      y: cardY + 152,
      w: COL_W,
      h: 32,
      text_size: 26,
      align_h: align.LEFT,
      color: accent,
      text: `${formatMinutes(preset.durationSec)} ${getText('min')}`,
    })
    label({
      x: COL_X,
      y: cardY + 188,
      w: COL_W,
      h: 32,
      text_size: 22,
      align_h: align.LEFT,
      color: INK_SOFT,
      text: `${getText('pattern')} ${patternText(preset.target)}`,
    })
    let buttonY = cardY + cardH + 16
    if (!preset.steps) {
      label({
        x: COL_X,
        y: cardY + 228,
        w: COL_W,
        h: 44,
        text_size: 20,
        align_h: align.LEFT,
        color: INK_SOFT,
        text_style: text_style.WRAP,
        text: getText('eases_in'),
      })
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
