const NATURAL = { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0 }
const BOX = { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 }
const SLEEP_456 = { inhale: 4, holdIn: 5, exhale: 6, holdOut: 0 }
const SLEEP_467 = { inhale: 4, holdIn: 6, exhale: 7, holdOut: 0 }
const SLEEP_478 = { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 }

export const STRESS_MAX_AGE_MS = 10 * 60 * 1000
export const HISTORY_LIMIT = 100
export const SLICE_COUNT = 4

export const HAPTIC_KIND = {
  inhale: 'short',
  holdIn: 'long',
  exhale: 'double',
  holdOut: 'long',
  end: 'end',
}

export const PRESETS = [
  {
    id: 'coherence',
    durationSec: 15 * 60,
    target: { inhale: 6, holdIn: 0, exhale: 6, holdOut: 0 },
    measured: false,
  },
  {
    id: 'relax',
    durationSec: 15 * 60,
    target: BOX,
    measured: false,
    steps: [{ pattern: BOX, durationSec: 15 * 60 }],
  },
  {
    id: 'relax-short',
    durationSec: 5 * 60,
    target: BOX,
    measured: false,
    steps: [{ pattern: BOX, durationSec: 5 * 60 }],
  },
  {
    id: 'tranquility',
    durationSec: 10 * 60,
    target: SLEEP_478,
    measured: false,
    // Progressive 4-7-8: ease in over the first 5 minutes, then hold target.
    steps: [
      { pattern: SLEEP_456, durationSec: 2 * 60 },
      { pattern: SLEEP_467, durationSec: 3 * 60 },
      { pattern: SLEEP_478, durationSec: 5 * 60 },
    ],
  },
]

export function nameKey(id) {
  if (id === 'relax-short') return 'name_relax_short'
  return `name_${id}`
}

export function presetById(id) {
  for (let i = 0; i < PRESETS.length; i++) {
    if (PRESETS[i].id === id) return PRESETS[i]
  }
  return null
}

function lerpPattern(from, to, amount) {
  return {
    inhale: Math.max(0, Math.round(from.inhale + (to.inhale - from.inhale) * amount)),
    holdIn: Math.max(0, Math.round(from.holdIn + (to.holdIn - from.holdIn) * amount)),
    exhale: Math.max(0, Math.round(from.exhale + (to.exhale - from.exhale) * amount)),
    holdOut: Math.max(0, Math.round(from.holdOut + (to.holdOut - from.holdOut) * amount)),
  }
}

export function stepsFor(preset) {
  if (Array.isArray(preset.steps) && preset.steps.length) {
    return preset.steps
  }
  const slice = Math.floor(preset.durationSec / SLICE_COUNT)
  const steps = []
  for (let i = 0; i < SLICE_COUNT; i++) {
    const amount = i / (SLICE_COUNT - 1)
    const durationSec =
      i === SLICE_COUNT - 1 ? preset.durationSec - slice * (SLICE_COUNT - 1) : slice
    steps.push({
      pattern: lerpPattern(NATURAL, preset.target, amount),
      durationSec,
    })
  }
  return steps
}

export function patternText(pattern) {
  const parts = []
  if (pattern.inhale) parts.push(`${pattern.inhale}`)
  if (pattern.holdIn) parts.push(`${pattern.holdIn}`)
  if (pattern.exhale) parts.push(`${pattern.exhale}`)
  if (pattern.holdOut) parts.push(`${pattern.holdOut}`)
  return parts.join(' · ')
}
