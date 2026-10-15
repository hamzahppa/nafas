import { create, id } from '@zos/media'

const FILES = {
  inhale: 'tone-inhale.opus',
  holdIn: 'tone-hold.opus',
  exhale: 'tone-exhale.opus',
  holdOut: 'tone-hold.opus',
  end: 'tone-end.opus',
}

let player = null

function ensurePlayer() {
  if (player) return player
  player = create(id.PLAYER)
  const start = () => {
    try {
      player.start()
    } catch (err) {
      console.log('audio start failed')
    }
  }
  if (player.addEventListener && player.event && player.event.PREPARE) {
    player.addEventListener(player.event.PREPARE, (result) => {
      if (result) start()
    })
  } else if (player.on) {
    player.on('prepared', start)
  }
  return player
}

export function playCue(kind, volume) {
  if (!volume) return
  const file = FILES[kind]
  if (!file) return
  try {
    const active = ensurePlayer()
    if (active.setVolume) active.setVolume(volume)
    if (active.stop) active.stop()
    active.setSource(active.source.FILE, { file })
    active.prepare()
  } catch (err) {
    console.log('audio cue failed')
  }
}

export const VOLUME_STEPS = [0, 40, 100]

export function nextVolume(current) {
  const index = VOLUME_STEPS.indexOf(current)
  return VOLUME_STEPS[(index + 1) % VOLUME_STEPS.length]
}
