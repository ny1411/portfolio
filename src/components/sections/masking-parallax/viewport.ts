import type { Point, Rect, ViewportSnapshot } from './types'

export function getViewportSnapshot(): ViewportSnapshot {
  if (typeof window === 'undefined') {
    return {
      height: 900,
      mobile: false,
      pointerFine: true,
      tablet: false,
      width: 1440,
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight

  return {
    height,
    mobile: width <= 760,
    pointerFine: window.matchMedia('(pointer: fine)').matches,
    tablet: width > 760 && width <= 1100,
    width,
  }
}

export function getPortraitFrame(width: number, height: number, mobile: boolean, tablet: boolean) {
  if (mobile) {
    const frameWidth = Math.min(width * 0.96, 420)
    const frameHeight = Math.min(height * 0.86, frameWidth * 2.05)

    return { width: frameWidth, height: frameHeight }
  }

  if (tablet) {
    const frameHeight = height * 0.9
    const frameWidth = Math.min(width * 0.78, frameHeight * 0.64, 700)

    return { width: frameWidth, height: frameHeight }
  }

  const frameHeight = height * 0.94
  const frameWidth = Math.min(frameHeight * 0.74, width * 0.62, 780)

  return { width: frameWidth, height: frameHeight }
}

export function getCenteredPortraitFrame(viewport: ViewportSnapshot): Rect {
  const frame = getPortraitFrame(viewport.width, viewport.height, viewport.mobile, viewport.tablet)

  return {
    x: (viewport.width - frame.width) * 0.5,
    y: (viewport.height - frame.height) * 0.5,
    width: frame.width,
    height: frame.height,
  }
}

export function getTransformedRect({
  frame,
  offset,
  origin,
  scale,
  viewport,
}: {
  frame: Rect
  offset: Point
  origin: Point
  scale: number
  viewport: ViewportSnapshot
}): Rect {
  const originX = origin.x - frame.x
  const originY = origin.y - frame.y
  const x = frame.x + offset.x + originX * (1 - scale)
  const y = frame.y + offset.y + originY * (1 - scale)
  const width = frame.width * scale
  const height = frame.height * scale

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.min(viewport.width, x + width) - Math.max(0, x),
    height: Math.min(viewport.height, y + height) - Math.max(0, y),
  }
}
