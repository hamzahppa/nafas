import { HeartRate, Stress } from '@zos/sensor'

let heart = null
let stress = null
let heartCallback = null
let lastCallback = null
let heartTimer = 0
let stressCallback = null
let stressTimer = 0
let stressListener = null

function publishHeart(onSample, value) {
  if (typeof value === 'number' && value > 0) onSample(value)
}

export function startHeart(onSample) {
  stopHeart()
  heart = new HeartRate()
  heartCallback = () => {
    try {
      publishHeart(onSample, heart.getCurrent())
    } catch (err) {
      console.log('heart sample failed')
    }
  }
  lastCallback = () => {
    try {
      publishHeart(onSample, heart.getLast())
    } catch (err) {
      console.log('heart last failed')
    }
  }
  try {
    heart.onCurrentChange(heartCallback)
  } catch (err) {
    console.log('heart watch failed')
  }
  try {
    heart.onLastChange(lastCallback)
  } catch (err) {
    console.log('heart last watch failed')
  }
  lastCallback()
  heartTimer = setInterval(lastCallback, 1000)
}

export function stopHeart() {
  if (heartTimer) {
    clearInterval(heartTimer)
    heartTimer = 0
  }
  if (heart && heartCallback) {
    try {
      heart.offCurrentChange(heartCallback)
    } catch (err) {
      console.log('heart stop failed')
    }
  }
  if (heart && lastCallback) {
    try {
      heart.offLastChange(lastCallback)
    } catch (err) {
      console.log('heart last stop failed')
    }
  }
  heart = null
  heartCallback = null
  lastCallback = null
}

function asMs(time, now) {
  if (typeof time !== 'number' || time <= 0) return now
  if (time >= 1e12) return time
  if (time < 48 * 3600) {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return start.getTime() + time * 1000
  }
  return time * 1000
}

function sampleFrom(value, time, now) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!number || number <= 0 || number > 100) return null
  return { value: Math.round(number), time: asMs(time, now) }
}

function fromCurrent(current, now) {
  if (typeof current === 'number') return sampleFrom(current, now, now)
  if (!current || typeof current !== 'object') return null
  const value = current.value != null ? current.value : current.stress
  return sampleFrom(value, current.time || current.second, now)
}

function fromToday(list, now) {
  if (!Array.isArray(list)) return null
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i]
    if (item && typeof item === 'object') {
      const value = typeof item.stress === 'number' ? item.stress : item.value
      const sample = sampleFrom(value, item.second || item.time, now)
      if (sample) return sample
      continue
    }
    if (typeof item === 'number') {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      const sample = sampleFrom(item, start.getTime() + i * 60000, now)
      if (sample) return sample
    }
  }
  return null
}

function publishStress(reading) {
  if (!stress || !stressListener) return
  const now = Date.now()
  let sample = null
  try {
    sample = fromCurrent(reading, now) || fromCurrent(stress.getCurrent(), now)
  } catch (err) {
    console.log('stress current failed')
  }
  if (!sample) sample = todaySample(stress, now)
  if (sample) stressListener(sample)
}

function todaySample(sensor, now) {
  try {
    const minute = fromToday(sensor.getToday(), now)
    if (minute) return minute
  } catch (err) {
    console.log('stress today failed')
  }
  try {
    return fromHours(sensor.getTodayByHour(), now)
  } catch (err) {
    console.log('stress hour failed')
    return null
  }
}

function fromHours(list, now) {
  if (!Array.isArray(list)) return null
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const origin = start.getTime()
  for (let i = list.length - 1; i >= 0; i--) {
    const sample = sampleFrom(list[i], origin + i * 3600000, now)
    if (sample) return sample
  }
  return null
}

function watchStress() {
  if (stress || !stressListener) return
  try {
    stress = new Stress()
  } catch (err) {
    console.log('stress start failed')
    return
  }
  stressCallback = (reading) => {
    try {
      publishStress(reading)
    } catch (err) {
      console.log('stress sample failed')
    }
  }
  try {
    stress.onChange(stressCallback)
  } catch (err) {
    console.log('stress watch failed')
  }
  stressCallback()
  stressTimer = setInterval(stressCallback, 2000)
}

export function startStress(onSample) {
  stopStress()
  stressListener = onSample
  watchStress()
}

export function stopStress() {
  if (stressTimer) {
    clearInterval(stressTimer)
    stressTimer = 0
  }
  if (stress && stressCallback) {
    try {
      stress.offChange(stressCallback)
    } catch (err) {
      console.log('stress stop failed')
    }
  }
  stress = null
  stressCallback = null
  stressListener = null
}

export function readStress() {
  try {
    if (!stress) stress = new Stress()
    const now = Date.now()
    const current = fromCurrent(stress.getCurrent(), now)
    if (current) return current
    return todaySample(stress, now)
  } catch (err) {
    return null
  }
}
