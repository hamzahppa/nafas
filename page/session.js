import { getText } from '@zos/i18n'
import { replace } from '@zos/router'
import { text_style } from '@zos/ui'
import { KEY_BACK, KEY_EVENT_CLICK, offKey, onKey } from '@zos/interaction'
import { playCue } from '../utils/audio'
import { keepAwake, releaseAwake } from '../utils/awake'
import {
  barCount,
  createClock,
  expandSchedule,
  pauseClock,
  phaseAt,
  sessionMs,
} from '../utils/engine'
import { formatClock, readParam } from '../utils/format'
import { tap, pulse, stopPulse } from '../utils/haptics'
import { presetById, stepsFor } from '../utils/presets'
import { buildRecord } from '../utils/record'
import { readStress, startHeart, startStress, stopHeart, stopStress } from '../utils/sensors'
import { attach, checkpointFromLive, clearActive, loadActive, pushHistory, saveActive } from '../utils/store'
import { SCREEN, button, createBreathArcs, createPrepRing, fill, hideRing, label, setBars, setH, setRing, setText, setVisible, setY, showRing } from '../utils/ui'

const PHASE_Y = 252
const PHASE_LEFT_Y = 298
const CLOCK_Y = 346
const HR_Y = 382

const TICK_MS = 50
const CHECKPOINT_MS = 30000
const PREP_MS = 30000
const CLOSE_MS = 15000
const BODY_W = 320
const BODY_X = Math.round((SCREEN - BODY_W) / 2)
const BODY_SIZE = 24
const LINE_H = 32
const COUNT_H = 76

function wrappedLines(text) {
  const max = Math.floor(BODY_W / (BODY_SIZE * 0.46))
  const words = String(text).split(' ')
  let lines = 1
  let used = 0
  for (let i = 0; i < words.length; i++) {
    const word = words[i].length
    const need = used === 0 ? word : used + 1 + word
    if (used > 0 && need > max) {
      lines += 1
      used = word
    } else {
      used = need
    }
  }
  return lines
}

function bodyHeight(text) {
  return wrappedLines(text) * LINE_H
}

function freshStress(sample) {
  return sample && sample.value > 0
}

function takeStart(session, sample) {
  if (freshStress(sample)) session.stressStart = sample
}

function takeEnd(session, sample) {
  if (freshStress(sample)) session.stressEnd = sample
}

function prepKey(id) {
  if (id === 'tranquility') return 'prep_tidur'
  if (id === 'relax' || id === 'relax-short') return 'prep_fokus'
  return 'prep_resonansi'
}

function closeKey(id) {
  if (id === 'tranquility') return 'close_tidur'
  if (id === 'relax-short') return 'close_fokus_short'
  if (id === 'relax') return 'close_fokus_long'
  return 'close_resonansi'
}

function phaseName(kind) {
  if (kind === 'inhale') return getText('phase_inhale')
  if (kind === 'exhale') return getText('phase_exhale')
  return getText('phase_hold')
}

Page({
  onInit(params) {
    const resume = readParam(params, 'resume') === '1'
    const saved = resume ? loadActive() : null
    if (saved && presetById(saved.presetId)) {
      this.session = saved
      this.session.settled = false
      this.session.hrSamples = this.session.hrSamples || []
      this.session.timeline = this.session.timeline || []
      if (this.session.phaseIndex == null) this.session.phaseIndex = -1
      if (saved.status === 'prepare' && saved.prepUntil > Date.now()) {
        const clock = this.session.clock || createClock(Date.now())
        clock.paused = true
        clock.pauseMs = 0
        clock.offset = 0
        this.session.clock = clock
        this.session.status = 'prepare'
      } else {
        const clock = this.session.clock
        const mark = this.session.lastCheckpoint || clock.runningSince
        const frozen = saved.status === 'prepare' ? 0 : clock.paused ? clock.pauseMs : clock.offset + (mark - clock.runningSince)
        const now = Date.now()
        clock.offset = frozen
        clock.pauseMs = frozen
        clock.runningSince = now
        clock.paused = false
        this.session.status = 'running'
        this.session.timeline.push({ sessionMs: frozen, type: 'resume' })
      }
    } else {
      const preset = presetById(readParam(params, 'preset'))
      const now = Date.now()
      const clock = createClock(now)
      clock.paused = true
      clock.pauseMs = 0
      this.session = {
        presetId: preset ? preset.id : 'coherence',
        status: 'prepare',
        prepUntil: now + PREP_MS,
        clock,
        hrSamples: [],
        liveHr: 0,
        stressStart: null,
        stressEnd: null,
        timeline: [],
        audioVolume: 0,
        phaseIndex: -1,
        lastCheckpoint: now,
        settled: false,
      }
    }
    this.schedule = expandSchedule(stepsFor(presetById(this.session.presetId)))
    attach(this.session)
  },

  build() {
    const session = this.session
    fill(0x000000)
    keepAwake()
    this.arcs = createBreathArcs()
    this.ring = createPrepRing()
    this.hrText = label({
      y: HR_Y,
      h: 28,
      text_size: 22,
      color: 0xbbbbbb,
      text: `${getText('hr')} ${session.liveHr || '—'}`,
    })
    if (session.status === 'prepare') {
      setVisible(this.hrText, false)
      startStress((sample) => takeStart(session, sample))
    } else {
      hideRing(this.ring)
      this.watchHeart()
    }
    const preparing = session.status === 'prepare'
    const prepCopy = getText(prepKey(session.presetId))
    const prepBodyH = bodyHeight(prepCopy)
    const prepTop = Math.round((SCREEN - (COUNT_H + 20 + prepBodyH)) / 2)
    this.prepCount = label({ y: prepTop, h: COUNT_H, text_size: 64, text: '' })
    this.prepText = label({
      x: BODY_X,
      y: prepTop + COUNT_H + 20,
      w: BODY_W,
      h: prepBodyH,
      text_size: BODY_SIZE,
      text_style: text_style.WRAP,
      text: prepCopy,
    })
    this.phaseText = label({ y: PHASE_Y, h: 42, text_size: 36, text: '' })
    this.phaseRemain = label({ y: PHASE_LEFT_Y, h: 42, text_size: 36, text: '' })
    this.sessionRemain = label({
      y: CLOCK_Y,
      h: 30,
      text_size: 24,
      color: 0xbbbbbb,
      text: '',
    })
    this.statsButton = button({
      x: 83,
      y: -80,
      w: 300,
      h: 58,
      text: getText('view_stats'),
      click_func: () => this.save(),
    })
    setVisible(this.statsButton, false)
    if (preparing) {
      setVisible(this.phaseText, false)
      setVisible(this.phaseRemain, false)
      setVisible(this.sessionRemain, false)
      setBars(this.arcs, 0)
    } else {
      setVisible(this.prepCount, false)
      setVisible(this.prepText, false)
    }

    onKey((key, keyEvent) => {
      if (keyEvent !== KEY_EVENT_CLICK) return false
      if (key === KEY_BACK) {
        if (session.status === 'prepare') this.cancelPrep()
        else if (session.status === 'close' || session.status === 'done') this.save()
        else this.finish()
        return true
      }
      return false
    })

    this.timer = setInterval(() => this.tick(), TICK_MS)
    this.paint()
    saveActive(session)
    if (session.status === 'running' && sessionMs(session.clock, Date.now()) >= this.schedule.durationMs) {
      this.complete()
    }
  },

  tick() {
    const session = this.session
    if (!session || session.settled) return
    if (session.status === 'prepare') {
      const left = session.prepUntil - Date.now()
      if (left <= 0) this.begin()
      else this.paintPrep(left)
      return
    }
    if (session.status === 'close') {
      const left = session.closeUntil - Date.now()
      if (left <= 0) this.showStats()
      else this.paintClose(left)
      return
    }
    if (session.status !== 'running') return
    const now = Date.now()
    const elapsed = sessionMs(session.clock, now)
    if (elapsed >= this.schedule.durationMs) {
      this.complete()
      return
    }
    const phase = phaseAt(this.schedule, elapsed)
    if (phase && phase.index !== session.phaseIndex) {
      session.phaseIndex = phase.index
      session.timeline.push({
        sessionMs: phase.start,
        type: 'phase',
        kind: phase.kind,
        stepIndex: phase.stepIndex,
      })
      pulse(phase.kind)
      playCue(phase.kind, session.audioVolume)
      this.checkpoint(now)
    }
    if (session.liveHr > 0) {
      const second = Math.floor(elapsed / 1000)
      if (session.hrSamples[second] == null) session.hrSamples[second] = session.liveHr
    }
    if (now - (session.lastCheckpoint || 0) >= CHECKPOINT_MS) this.checkpoint(now)
    this.paintPhase(phase, elapsed)
  },

  paint() {
    if (this.session.status === 'prepare') {
      this.paintPrep(this.session.prepUntil - Date.now())
      return
    }
    const elapsed = sessionMs(this.session.clock, Date.now())
    this.paintPhase(phaseAt(this.schedule, elapsed), elapsed)
  },

  paintPrep(left) {
    setRing(this.ring, Math.max(0, left) / PREP_MS)
    setText(this.prepCount, String(Math.max(1, Math.ceil(left / 1000))))
  },

  paintClose(left) {
    setRing(this.ring, Math.max(0, left) / CLOSE_MS)
  },

  begin() {
    const now = Date.now()
    this.session.status = 'running'
    this.session.prepUntil = 0
    this.session.clock = createClock(now)
    this.session.lastCheckpoint = now
    this.session.phaseIndex = -1
    stopStress()
    hideRing(this.ring)
    setVisible(this.hrText, true)
    setText(this.hrText, `${getText('hr')} ${this.session.liveHr || '—'}`)
    this.watchHeart()
    setVisible(this.prepCount, false)
    setVisible(this.prepText, false)
    setVisible(this.phaseText, true)
    setVisible(this.phaseRemain, true)
    setVisible(this.sessionRemain, true)
    this.checkpoint(now)
    this.paint()
  },

  cancelPrep() {
    this.session.settled = true
    clearActive()
    this.release()
    replace({ url: 'page/index' })
  },

  paintPhase(phase, elapsed) {
    setBars(this.arcs, barCount(phase, this.arcs.length))
    if (!phase) {
      setText(this.phaseText, '')
      setText(this.phaseRemain, '')
    } else {
      setText(this.phaseText, phaseName(phase.kind))
      setText(this.phaseRemain, String(Math.ceil(phase.remaining / 1000)))
    }
    const left = Math.max(0, this.schedule.durationMs - elapsed)
    setText(this.sessionRemain, formatClock(left))
  },

  finish() {
    if (!this.session || this.session.settled) return
    if (this.session.status === 'close' || this.session.status === 'done') return
    const now = Date.now()
    this.session.status = 'close'
    this.session.closeUntil = now + CLOSE_MS
    pauseClock(this.session.clock, now)
    tap()
    playCue('end', this.session.audioVolume)
    setVisible(this.prepCount, false)
    setVisible(this.phaseText, false)
    setVisible(this.phaseRemain, false)
    setVisible(this.sessionRemain, false)
    setVisible(this.hrText, false)
    setBars(this.arcs, 0)
    const closeCopy = getText(closeKey(this.session.presetId))
    const closeH = bodyHeight(closeCopy)
    setY(this.prepText, Math.round((SCREEN - closeH) / 2))
    setH(this.prepText, closeH)
    setText(this.prepText, closeCopy)
    setVisible(this.prepText, true)
    showRing(this.ring)
    stopHeart()
    startStress((sample) => takeEnd(this.session, sample))
    this.paintClose(CLOSE_MS)
  },

  watchHeart() {
    const session = this.session
    startHeart((value) => {
      session.liveHr = value
      if (session.status !== 'running') return
      const second = Math.floor(sessionMs(session.clock, Date.now()) / 1000)
      if (session.hrSamples[second] == null) session.hrSamples[second] = value
      setText(this.hrText, `${getText('hr')} ${value}`)
    })
  },

  showStats() {
    if (this.session.status !== 'close') return
    this.session.status = 'done'
    stopStress()
    hideRing(this.ring)
    setBars(this.arcs, 0)
    setY(this.statsButton, 348)
    setVisible(this.statsButton, true)
  },

  complete() {
    this.finish()
  },

  checkpoint(now) {
    this.session.lastCheckpoint = now || Date.now()
    saveActive(this.session)
  },

  release() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = 0
    }
    stopHeart()
    stopStress()
    stopPulse()
    releaseAwake()
    offKey()
  },

  save() {
    const savedAt = Date.now()
    if (!this.session.stressEnd) takeEnd(this.session, readStress())
    const record = buildRecord(this.session, savedAt)
    this.session.settled = true
    if (record) pushHistory(record)
    clearActive()
    this.release()
    replace({ url: 'page/summary', params: record ? `id=${record.id}` : '' })
  },

  onDestroy() {
    const session = this.session
    if (session && !session.settled && (session.status === 'close' || session.status === 'done')) {
      this.save()
      return
    }
    this.release()
    if (session && !session.settled) checkpointFromLive(session)
  },
})
