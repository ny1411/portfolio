import { REDUCED_MOTION_PROGRESS } from './constants'
import { clamp, easeInOutCubic, fmt, px } from './math'
import type { HeroGeometry, Point, ViewportSnapshot } from './types'
import { getPortraitFrame, getTransformedRect } from './viewport'

export function getHeroGeometry({
  pointer,
  progress,
  revealAmount,
  reducedMotion,
  viewport,
}: {
  pointer: Point
  progress: number
  revealAmount: number
  reducedMotion: boolean
  viewport: ViewportSnapshot
}): HeroGeometry {
  const { height, mobile, tablet, width } = viewport
  const zoomProgress = clamp(progress / 1.08, 0, 1)
  const easedProgress = easeInOutCubic(zoomProgress)
  const cameraPush = reducedMotion ? REDUCED_MOTION_PROGRESS : easedProgress
  const scrollDrift = easedProgress
  const pointerStrength = reducedMotion ? 0 : mobile ? 1 : tablet ? 0.58 : 1
  const frameSize = getPortraitFrame(width, height, mobile, tablet)
  const frameWidth = frameSize.width
  const frameHeight = frameSize.height
  const frameX = (width - frameWidth) * 0.5
  const frameY = (height - frameHeight) * 0.5
  const faceRatioY = mobile ? 0.27 : tablet ? 0.25 : 0.24
  const origin = {
    x: frameX + frameWidth * 0.5,
    y: frameY + frameHeight * faceRatioY,
  }
  const focus = {
    x: width * 0.5,
    y: height * (mobile ? 0.34 : tablet ? 0.36 : 0.38),
  }
  const focusPull = {
    x: (focus.x - origin.x) * cameraPush,
    y: (focus.y - origin.y) * cameraPush,
  }
  const subjectScale = 1 + cameraPush * (mobile ? 0.18 : tablet ? 0.24 : 0.28)
  const revealScale = subjectScale * (1 + revealAmount * 0.05)
  const backdropScale = 1.04 + cameraPush * (mobile ? 0.08 : tablet ? 0.1 : 0.12)
  const atmosphereScale = 1.015 + cameraPush * (mobile ? 0.045 : tablet ? 0.06 : 0.07)
  const plateX =
    focusPull.x + pointer.x * (tablet ? 7 : 11) * pointerStrength
  const plateY =
    focusPull.y + pointer.y * (tablet ? 100 : 7) * pointerStrength
  const maskFrame = getTransformedRect({
    frame: { x: frameX, y: frameY, width: frameWidth, height: frameHeight },
    offset: { x: plateX, y: plateY },
    origin,
    scale: subjectScale,
    viewport,
  })

  const maskWidth = clamp(
    maskFrame.width * (mobile ? 0.34 : tablet ? 0.24 : 0.23),
    mobile ? 86 : tablet ? 72 : 86,
    Math.min(width * (mobile ? 0.58 : 0.42), maskFrame.width * (mobile ? 0.42 : 0.34)),
  )
  const maskHeight = clamp(
    maskFrame.height * (mobile ? 0.25 : tablet ? 0.2 : 0.19),
    mobile ? 122 : tablet ? 104 : 126,
    Math.min(height * (mobile ? 0.5 : 0.42), maskFrame.height * (mobile ? 0.34 : 0.3)),
  )

  const maskCenterX =
    maskFrame.x +
    maskFrame.width * (0.5 + pointer.x * (mobile ? 0.48 : tablet ? 0.45 : 0.46) * pointerStrength)
  const maskCenterY =
    maskFrame.y +
    maskFrame.height * (0.5 + pointer.y * (mobile ? 0.48 : tablet ? 0.46 : 0.46) * pointerStrength)

  const maskX = clamp(maskCenterX - maskWidth * 0.5, maskFrame.x, maskFrame.x + maskFrame.width - maskWidth)
  const maskY = clamp(maskCenterY - maskHeight * 0.5, maskFrame.y, maskFrame.y + maskFrame.height - maskHeight)
  const bgX =
    -focusPull.x * 0.18 - pointer.x * (tablet ? 8 : 12) * pointerStrength + scrollDrift * (mobile ? 8 : 12)
  const bgY =
    -focusPull.y * 0.18 - pointer.y * (tablet ? 6 : 9) * pointerStrength + scrollDrift * (mobile ? -8 : -12)
  const revealX = plateX
  const revealY = plateY

  return {
    frame: { x: frameX, y: frameY, width: frameWidth, height: frameHeight },
    mask: { x: maskX, y: maskY, width: maskWidth, height: maskHeight },
    plate: { x: plateX, y: plateY },
    reveal: { x: revealX, y: revealY, origin, scale: revealScale },
    variables: {
      '--atmo-x': px(bgX * -0.46),
      '--atmo-y': px(bgY * -0.38),
      '--atmo-scale': fmt(atmosphereScale),
      '--bg-x': px(bgX),
      '--bg-y': px(bgY),
      '--bg-scale': fmt(backdropScale),
      '--frame-height': px(frameHeight),
      '--frame-width': px(frameWidth),
      '--frame-x': px(frameX),
      '--frame-y': px(frameY),
      '--mask-height': px(maskHeight),
      '--mask-x': px(maskX),
      '--mask-y': px(maskY),
      '--mask-width': px(maskWidth),
      '--plate-origin-x': '50%',
      '--plate-origin-y': `${(faceRatioY * 100).toFixed(2)}%`,
      '--plate-scale': fmt(subjectScale),
      '--plate-x': px(plateX),
      '--plate-y': px(plateY),
      '--reveal-opacity': String(revealAmount * (reducedMotion ? 0 : 0.92)),
      '--vignette-scale': fmt(1 + cameraPush * 0.045),
    },
  }
}

const VAR_KEYS = [
  '--atmo-x', '--atmo-y', '--atmo-scale',
  '--bg-x', '--bg-y', '--bg-scale',
  '--frame-height', '--frame-width', '--frame-x', '--frame-y',
  '--mask-height', '--mask-x', '--mask-y', '--mask-width',
  '--plate-origin-x', '--plate-origin-y', '--plate-scale',
  '--plate-x', '--plate-y',
  '--reveal-opacity', '--vignette-scale',
] as const

const prevVars: Record<string, string> = {}

export function applyHeroVariables(element: HTMLElement, variables: Record<string, string>) {
  const style = element.style
  for (let i = 0; i < VAR_KEYS.length; i++) {
    const key = VAR_KEYS[i]
    const val = variables[key]
    if (val !== undefined && val !== prevVars[key]) {
      style.setProperty(key, val)
      prevVars[key] = val
    }
  }
}

export function getScaleMatrixTransform(layer: Point & { origin: Point; scale: number }): string {
  const tx = layer.x + layer.origin.x * (1 - layer.scale)
  const ty = layer.y + layer.origin.y * (1 - layer.scale)

  return `matrix(${fmt(layer.scale)} 0 0 ${fmt(layer.scale)} ${fmt(tx)} ${fmt(ty)})`
}
