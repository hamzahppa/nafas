import {
  pauseDropWristScreenOff,
  pausePalmScreenOff,
  resetDropWristScreenOff,
  resetPalmScreenOff,
} from '@zos/display'

export function keepAwake() {
  pauseDropWristScreenOff({ duration: 0 })
  pausePalmScreenOff({ duration: 0 })
}

export function releaseAwake() {
  resetDropWristScreenOff()
  resetPalmScreenOff()
}
