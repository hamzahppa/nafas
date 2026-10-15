import {
  Vibrator,
  VIBRATOR_SCENE_DURATION,
  VIBRATOR_SCENE_SHORT_STRONG,
  VIBRATOR_SCENE_STRONG_REMINDER,
} from '@zos/sensor'
import { HAPTIC_KIND } from './presets'

const vibrator = { current: null }

function motor() {
  if (!vibrator.current) vibrator.current = new Vibrator()
  return vibrator.current
}

function buzz(mode) {
  try {
    motor().start({ mode })
  } catch (err) {
    console.log('haptic failed')
  }
}

export function tap() {
  buzz(VIBRATOR_SCENE_SHORT_STRONG)
}

export function pulse(kind) {
  const pattern = HAPTIC_KIND[kind] || HAPTIC_KIND.inhale
  if (pattern === 'short') {
    buzz(VIBRATOR_SCENE_SHORT_STRONG)
    return
  }
  if (pattern === 'double') {
    buzz(VIBRATOR_SCENE_SHORT_STRONG)
    setTimeout(() => buzz(VIBRATOR_SCENE_SHORT_STRONG), 180)
    return
  }
  if (pattern === 'long') {
    buzz(VIBRATOR_SCENE_DURATION)
    return
  }
  buzz(VIBRATOR_SCENE_STRONG_REMINDER)
}

export function stopPulse() {
  if (!vibrator.current) return
  try {
    vibrator.current.stop()
  } catch (err) {
    console.log('haptic stop failed')
  }
}
