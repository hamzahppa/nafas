import { localStorage } from '@zos/storage'
import { pauseClock } from './engine'
import { HISTORY_LIMIT } from './presets'

const ACTIVE_KEY = 'breathwork.active'
const HISTORY_KEY = 'breathwork.history'

let live = null

function readJson(key, fallback) {
  const raw = localStorage.getItem(key, '')
  if (raw == null || raw === '') return fallback
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch (err) {
    return fallback
  }
}

function writeJson(key, value) {
  const result = localStorage.setItem(key, JSON.stringify(value))
  if (result === false) throw new Error('storage')
}

export function attach(session) {
  live = session
}

export function loadActive() {
  return readJson(ACTIVE_KEY, null)
}

export function saveActive(session) {
  writeJson(ACTIVE_KEY, {
    presetId: session.presetId,
    status: session.status,
    clock: session.clock,
    hrSamples: session.hrSamples,
    liveHr: session.liveHr || 0,
    stressStart: session.stressStart,
    stressEnd: session.stressEnd,
    timeline: session.timeline,
    audioVolume: session.audioVolume || 0,
    phaseIndex: session.phaseIndex,
    lastCheckpoint: session.lastCheckpoint || 0,
    prepUntil: session.prepUntil || 0,
  })
}

export function clearActive() {
  localStorage.removeItem(ACTIVE_KEY)
  live = null
}

export function checkpointFromLive(session) {
  const current = session || live
  if (!current || current.settled) return
  if (current.status === 'running') {
    const at = pauseClock(current.clock, Date.now())
    current.status = 'paused'
    current.timeline.push({ sessionMs: at, type: 'pause' })
  }
  saveActive(current)
}

export function loadHistory() {
  const list = readJson(HISTORY_KEY, [])
  return Array.isArray(list) ? list : []
}

export function saveHistory(list) {
  let next = list.slice(0, HISTORY_LIMIT)
  while (next.length) {
    try {
      writeJson(HISTORY_KEY, next)
      return next
    } catch (err) {
      next = next.slice(0, next.length - 1)
    }
  }
  writeJson(HISTORY_KEY, [])
  return []
}

export function pushHistory(record) {
  const list = loadHistory()
  list.unshift(record)
  return saveHistory(list)
}

export function findSession(id) {
  const list = loadHistory()
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i]
  }
  return null
}
