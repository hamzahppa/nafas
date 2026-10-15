import { createWidget, widget, align, prop, event } from '@zos/ui'

export const SCREEN = 466

export function fill(color) {
  return createWidget(widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: SCREEN,
    h: SCREEN,
    color,
  })
}

export function label(options) {
  const props = {
    x: options.x == null ? 40 : options.x,
    y: options.y,
    w: options.w == null ? SCREEN - 80 : options.w,
    h: options.h == null ? 40 : options.h,
    color: options.color == null ? 0xffffff : options.color,
    text_size: options.text_size == null ? 28 : options.text_size,
    align_h: options.align_h == null ? align.CENTER_H : options.align_h,
    align_v: align.CENTER_V,
    text: options.text || '',
  }
  if (options.text_style != null) props.text_style = options.text_style
  return createWidget(widget.TEXT, props)
}

function lighten(color) {
  const red = Math.min(255, ((color >> 16) & 255) + 48)
  const green = Math.min(255, ((color >> 8) & 255) + 48)
  const blue = Math.min(255, (color & 255) + 48)
  return (red << 16) | (green << 8) | blue
}

export function button(options) {
  const normal = options.color == null ? 0x1a4e9c : options.color
  const height = options.h == null ? 58 : options.h
  return createWidget(widget.BUTTON, {
    x: options.x,
    y: options.y,
    w: options.w == null ? 280 : options.w,
    h: height,
    radius: options.radius == null ? Math.round(height / 2) : options.radius,
    normal_color: normal,
    press_color: options.press == null ? lighten(normal) : options.press,
    color: 0xffffff,
    text_size: options.text_size == null ? 28 : options.text_size,
    text: options.text || '',
    click_func: options.click_func,
  })
}

export function separator(x, y, w) {
  return createWidget(widget.FILL_RECT, {
    x,
    y,
    w,
    h: 2,
    color: 0x3a4550,
  })
}

export function setText(node, text) {
  node.setProperty(prop.TEXT, text)
}

export function setY(node, y) {
  node.setProperty(prop.Y, y)
}

export function setButtonText(node, text) {
  try {
    node.text = text
  } catch (err) {
    console.log('button text failed')
  }
  node.setProperty(prop.TEXT, text)
}

const ARC_X = 233
const ARC_Y = 198
const BAR_WIDTH = 16
const BAR_RADII = [36, 69, 102, 135, 168]
let shownBars = -1

function layerColor(amount) {
  const red = Math.round(0x08 + (0x3d - 0x08) * amount)
  const green = Math.round(0x12 + (0x8b - 0x12) * amount)
  const blue = Math.round(0x20 + (0xfd - 0x20) * amount)
  return (red << 16) | (green << 8) | blue
}

export function createBreathArcs() {
  shownBars = -1
  const arcs = []
  for (let i = 0; i < BAR_RADII.length; i++) {
    const rad = BAR_RADII[i]
    arcs.push(
      createWidget(widget.ARC, {
        x: -80,
        y: -80,
        w: rad * 2,
        h: rad * 2,
        start_angle: 180,
        end_angle: 360,
        line_width: BAR_WIDTH,
        color: layerColor(i / (BAR_RADII.length - 1)),
      }),
    )
  }
  return arcs
}

export function setBars(arcs, count) {
  if (count === shownBars) return
  shownBars = count
  for (let i = 0; i < arcs.length; i++) {
    const node = arcs[i]
    const rad = BAR_RADII[i]
    const size = rad * 2
    if (i < count) {
      node.setProperty(prop.X, ARC_X - rad)
      node.setProperty(prop.Y, ARC_Y - rad)
      node.setProperty(prop.W, size)
      node.setProperty(prop.H, size)
      node.setProperty(prop.LINE_WIDTH, BAR_WIDTH)
      node.setProperty(prop.VISIBLE, true)
    } else {
      node.setProperty(prop.VISIBLE, false)
      node.setProperty(prop.X, -80)
      node.setProperty(prop.Y, -80)
    }
  }
}

export function setVisible(node, visible) {
  node.setProperty(prop.VISIBLE, visible)
}

export function onClick(node, handler) {
  node.addEventListener(event.CLICK_UP, handler)
}
