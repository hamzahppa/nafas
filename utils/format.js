export function readParam(params, key) {
  if (params == null || params === '') return ''
  if (typeof params === 'object') {
    const value = params[key]
    return value == null ? '' : String(value)
  }
  const parts = String(params).split('&')
  for (let i = 0; i < parts.length; i++) {
    const pair = parts[i].split('=')
    if (pair[0] === key) return decodeURIComponent(pair[1] || '')
  }
  return ''
}

export function formatClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  const padded = seconds < 10 ? `0${seconds}` : String(seconds)
  return `${minutes}:${padded}`
}

export function formatMinutes(sec) {
  return String(Math.round(sec / 60))
}

export function formatNumber(value) {
  if (value == null || value !== value) return '—'
  return String(Math.round(value))
}

export function formatDelta(value) {
  if (value == null || value !== value) return '—'
  if (value > 0) return `+${value}`
  return String(value)
}

export function formatWhen(ts) {
  const date = new Date(ts)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const padded = minute < 10 ? `0${minute}` : String(minute)
  return `${month}/${day} ${hour}:${padded}`
}
