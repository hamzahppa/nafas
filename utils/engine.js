const PHASE_ORDER = ['inhale', 'holdIn', 'exhale', 'holdOut']

export function createClock(now) {
  return { runningSince: now, offset: 0, paused: false, pauseMs: 0 }
}

export function sessionMs(clock, now) {
  if (clock.paused) return clock.pauseMs
  return clock.offset + (now - clock.runningSince)
}

export function pauseClock(clock, now) {
  if (clock.paused) return clock.pauseMs
  clock.pauseMs = sessionMs(clock, now)
  clock.paused = true
  return clock.pauseMs
}

export function resumeClock(clock, now) {
  if (!clock.paused) return
  clock.offset = clock.pauseMs
  clock.runningSince = now
  clock.paused = false
}

export function jumpClock(clock, now, targetMs) {
  clock.offset = targetMs
  clock.pauseMs = targetMs
  clock.runningSince = now
  clock.paused = false
}

export function expandSchedule(steps) {
  const phases = []
  const stepBounds = []
  let cursor = 0
  for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
    const step = steps[stepIndex]
    const stepStart = cursor
    const stepEnd = cursor + step.durationSec * 1000
    const cycle = []
    for (let i = 0; i < PHASE_ORDER.length; i++) {
      const kind = PHASE_ORDER[i]
      const sec = step.pattern[kind] || 0
      if (sec > 0) cycle.push({ kind, length: sec * 1000 })
    }
    if (!cycle.length) {
      cursor = stepEnd
    } else {
      let guard = 0
      while (cursor < stepEnd && guard < 20000) {
        guard += 1
        let moved = false
        for (let i = 0; i < cycle.length && cursor < stepEnd; i++) {
          const phase = cycle[i]
          const end = Math.min(cursor + phase.length, stepEnd)
          if (end <= cursor) continue
          phases.push({
            kind: phase.kind,
            start: cursor,
            end,
            stepIndex,
            full: end - cursor >= phase.length - 1,
          })
          cursor = end
          moved = true
        }
        if (!moved) break
      }
      cursor = stepEnd
    }
    stepBounds.push({ stepIndex, start: stepStart, end: stepEnd })
  }
  return { phases, stepBounds, durationMs: cursor }
}

export function phaseAt(schedule, elapsed) {
  if (elapsed < 0 || elapsed >= schedule.durationMs) return null
  for (let i = 0; i < schedule.phases.length; i++) {
    const phase = schedule.phases[i]
    if (elapsed >= phase.start && elapsed < phase.end) {
      return {
        index: i,
        kind: phase.kind,
        stepIndex: phase.stepIndex,
        start: phase.start,
        end: phase.end,
        elapsed: elapsed - phase.start,
        remaining: phase.end - elapsed,
      }
    }
  }
  return null
}

export function nextStepStart(schedule, elapsed) {
  let current = null
  for (let i = 0; i < schedule.stepBounds.length; i++) {
    const bound = schedule.stepBounds[i]
    if (elapsed >= bound.start && elapsed < bound.end) {
      current = bound
      break
    }
  }
  if (!current) return schedule.durationMs
  for (let i = 0; i < schedule.stepBounds.length; i++) {
    const bound = schedule.stepBounds[i]
    if (bound.stepIndex === current.stepIndex + 1) return bound.start
  }
  return schedule.durationMs
}

export function completedBreaths(schedule, elapsed) {
  let count = 0
  for (let i = 0; i < schedule.phases.length; i++) {
    const phase = schedule.phases[i]
    if (phase.kind === 'exhale' && phase.full && phase.end <= elapsed) count += 1
  }
  return count
}

export function pacedRate(breaths, elapsed) {
  if (elapsed < 1000) return null
  return breaths / (elapsed / 60000)
}

export function barCount(phase, total) {
  if (!phase || total <= 0) return 0
  if (phase.kind === 'holdIn') return total
  if (phase.kind === 'holdOut') return 0
  const span = Math.max(1, phase.end - phase.start)
  const index = Math.min(total - 1, Math.floor((phase.elapsed * total) / span))
  if (phase.kind === 'inhale') return index + 1
  if (phase.kind === 'exhale') return total - index
  return 0
}

export function hrStats(samples) {
  let sum = 0
  let count = 0
  let max = 0
  for (let i = 0; i < samples.length; i++) {
    const value = samples[i]
    if (!value) continue
    sum += value
    count += 1
    if (value > max) max = value
  }
  if (!count) return { avg: null, max: null }
  return { avg: Math.round(sum / count), max }
}

export function minuteHr(samples) {
  const lines = []
  const minutes = Math.ceil(samples.length / 60)
  for (let minute = 0; minute < minutes; minute++) {
    let sum = 0
    let count = 0
    const start = minute * 60
    const end = Math.min(samples.length, start + 60)
    for (let i = start; i < end; i++) {
      if (!samples[i]) continue
      sum += samples[i]
      count += 1
    }
    if (count) lines.push({ minute, avg: Math.round(sum / count) })
  }
  return lines
}

export function stressDelta(start, end) {
  if (!start || !end) return null
  if (typeof start.value !== 'number' || typeof end.value !== 'number') return null
  if (start.value <= 0 || end.value <= 0) return null
  return end.value - start.value
}
