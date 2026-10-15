import {
  completedBreaths,
  expandSchedule,
  hrStats,
  pacedRate,
} from './engine'
import { presetById, stepsFor } from './presets'

export function buildRecord(session, savedAt) {
  const preset = presetById(session.presetId)
  if (!preset || !session.clock) return null
  const schedule = expandSchedule(stepsFor(preset))
  const clock = session.clock
  const mark = session.lastCheckpoint || clock.runningSince
  const elapsed = Math.min(
    clock.paused ? clock.pauseMs : clock.offset + (mark - clock.runningSince),
    schedule.durationMs,
  )
  const breaths = completedBreaths(schedule, elapsed)
  const stats = hrStats(session.hrSamples || [])
  return {
    id: String(savedAt),
    presetId: session.presetId,
    savedAt,
    durationMs: elapsed,
    pacedRate: pacedRate(breaths, elapsed),
    avgHr: stats.avg,
    maxHr: stats.max,
    stressStart: session.stressStart,
    stressEnd: session.stressEnd,
    hrSamples: session.hrSamples || [],
    timeline: session.timeline || [],
  }
}
