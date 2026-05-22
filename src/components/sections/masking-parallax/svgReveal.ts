import type { MutableRefObject } from 'react'
import { BLOB_POINT_COUNT } from './constants'
import { getScaleMatrixTransform } from './geometry'
import { clamp, damp, fmt, length, pxNumber } from './math'
import type { HeroGeometry, MotionState, Rect, ViewportSnapshot } from './types'

export interface SvgCache {
  viewBox: string
  imgX: string
  imgY: string
  imgW: string
  imgH: string
}

export function createSvgCache(): SvgCache {
  return { viewBox: '', imgX: '', imgY: '', imgW: '', imgH: '' }
}

const targetXY = new Float64Array(36)
const smoothXY = new Float64Array(36)
const pathSegments: string[] = new Array(19)

export function updateSvgReveal({
  blobCorePath,
  blobFeatherPath,
  svgCacheRef,
  geometry,
  motion,
  revealAmount,
  revealLayer,
  reducedMotion,
  revealImage,
  revealSvg,
  time,
  viewport,
}: {
  blobCorePath: SVGPathElement
  blobFeatherPath: SVGPathElement
  svgCacheRef: MutableRefObject<SvgCache>
  geometry: HeroGeometry
  motion: MotionState
  revealAmount: number
  revealLayer: SVGGElement
  reducedMotion: boolean
  revealImage: SVGImageElement
  revealSvg: SVGSVGElement
  time: number
  viewport: ViewportSnapshot
}) {
  const cache = svgCacheRef.current
  const nextViewBox = `0 0 ${viewport.width} ${viewport.height}`
  if (cache.viewBox !== nextViewBox) {
    revealSvg.setAttribute('viewBox', nextViewBox)
    cache.viewBox = nextViewBox
  }

  const imgX = pxNumber(geometry.frame.x)
  if (cache.imgX !== imgX) {
    revealImage.setAttribute('x', imgX)
    cache.imgX = imgX
  }

  const imgY = pxNumber(geometry.frame.y)
  if (cache.imgY !== imgY) {
    revealImage.setAttribute('y', imgY)
    cache.imgY = imgY
  }

  const imgW = pxNumber(geometry.frame.width)
  if (cache.imgW !== imgW) {
    revealImage.setAttribute('width', imgW)
    cache.imgW = imgW
  }

  const imgH = pxNumber(geometry.frame.height)
  if (cache.imgH !== imgH) {
    revealImage.setAttribute('height', imgH)
    cache.imgH = imgH
  }

  revealLayer.setAttribute('transform', getScaleMatrixTransform(geometry.reveal))

  getBlobTargetPointsInPlace(targetXY, geometry.mask, motion, time, reducedMotion, revealAmount)
  
  const pointCount = BLOB_POINT_COUNT
  for (let i = 0; i < pointCount; i++) {
    const idx = i * 2
    smoothXY[idx] = damp(smoothXY[idx] || targetXY[idx], targetXY[idx], reducedMotion ? 1 : 0.32)
    smoothXY[idx + 1] = damp(smoothXY[idx + 1] || targetXY[idx + 1], targetXY[idx + 1], reducedMotion ? 1 : 0.32)
  }

  const path = buildPathFromBuffer(smoothXY, pointCount)
  blobCorePath.setAttribute('d', path)
  blobFeatherPath.setAttribute('d', path)
}

function getBlobTargetPointsInPlace(
  out: Float64Array,
  mask: Rect,
  motion: MotionState,
  time: number,
  reducedMotion: boolean,
  revealAmount: number,
): void {
  const center_x = mask.x + mask.width * 0.5
  const center_y = mask.y + mask.height * 0.47
  
  const active = reducedMotion ? 0 : clamp(revealAmount, 0, 1)
  const speed = reducedMotion ? 0 : clamp(motion.speed, 0, 1)
  const acceleration = reducedMotion ? 0 : clamp(length(motion.acceleration) * 0.06, 0, 1)
  const idleEase = reducedMotion ? 1 : clamp(motion.idleMs / 900, 0, 1)
  
  const dir_x = speed > 0.02 ? motion.direction.x : 0
  const dir_y = speed > 0.02 ? motion.direction.y : 0
  const perp_x = -dir_y
  const perp_y = dir_x
  
  const horizontalBias = Math.abs(dir_x)
  const verticalBias = Math.abs(dir_y)
  const directionAngle = Math.atan2(dir_y, dir_x || 0.0001)
  
  const radiusX =
    mask.width *
    (0.24 + active * 0.12) *
    (1 + speed * (0.65 + horizontalBias * 0.7) + acceleration * 0.1)
  const radiusY =
    mask.height *
    (0.23 + active * 0.1) *
    (1 + speed * (0.48 + verticalBias * 0.62) + acceleration * 0.08)
    
  const breathing = reducedMotion ? 0 : Math.sin(time * 0.0012) * 0.004 * idleEase * active

  const pointCount = BLOB_POINT_COUNT
  for (let i = 0; i < pointCount; i++) {
    const angle = (Math.PI * 2 * i) / pointCount - Math.PI / 2
    const unit_x = Math.cos(angle)
    const unit_y = Math.sin(angle)
    const tangent_x = -unit_y
    const tangent_y = unit_x
    
    const forward = unit_x * dir_x + unit_y * dir_y
    const side = unit_x * perp_x + unit_y * perp_y
    
    const directionalLobe = Math.max(forward, 0)
    const trailingLobe = Math.max(-forward, 0)
    const phase = directionAngle * 0.85 + time * 0.00018
    
    const longWave = Math.sin(angle * 2 + phase) * (0.11 + speed * 0.08)
    const shoulderWave = Math.cos(angle * 3 - phase * 0.7) * (0.045 + speed * 0.045)
    const directionalDent = Math.sin(angle - directionAngle + Math.PI * 0.45) * speed * 0.075
    
    const organic =
      (Math.sin(angle * 2.5 + time * 0.00042) * 0.028 +
        Math.cos(angle * 1.5 - time * 0.00031) * 0.02) *
      idleEase *
      active
      
    const stretch = speed * (directionalLobe * 0.7 - trailingLobe * 0.24)
    const compression = -Math.abs(side) * speed * 0.13
    const asymmetry = side * acceleration * 0.09
    
    const helmetPinch = -Math.max(unit_y, 0) * 0.1 + Math.max(-unit_y, 0) * 0.055
    
    const radius =
      1 +
      longWave +
      shoulderWave +
      organic +
      breathing +
      stretch +
      compression +
      asymmetry +
      directionalDent
      
    const pull = speed * directionalLobe * (mask.width * 0.18)
    const minMask = Math.min(mask.width, mask.height)
    
    const tangentPush =
      (Math.sin(angle * 2 - directionAngle) * 0.04 + Math.cos(angle + directionAngle) * speed * 0.045) * minMask

    out[i * 2] = center_x + unit_x * radiusX * (radius + helmetPinch) + tangent_x * tangentPush + dir_x * pull
    out[i * 2 + 1] = center_y + unit_y * radiusY * (radius - helmetPinch * 0.45) + tangent_y * tangentPush + dir_y * pull * 0.72
  }
}

function buildPathFromBuffer(pts: Float64Array, count: number): string {
  if (count < 2) return ''

  for (let i = 0; i < count; i++) {
    const px = pts[i * 2]
    const py = pts[i * 2 + 1]
    
    const prev_i = (i - 1 + count) % count
    const next_i = (i + 1) % count
    const afterNext_i = (i + 2) % count
    
    const prev_x = pts[prev_i * 2]
    const prev_y = pts[prev_i * 2 + 1]
    const next_x = pts[next_i * 2]
    const next_y = pts[next_i * 2 + 1]
    const afterNext_x = pts[afterNext_i * 2]
    const afterNext_y = pts[afterNext_i * 2 + 1]
    
    const ca_x = px + (next_x - prev_x) / 6
    const ca_y = py + (next_y - prev_y) / 6
    const cb_x = next_x - (afterNext_x - px) / 6
    const cb_y = next_y - (afterNext_y - py) / 6

    if (i === 0) {
      pathSegments[i] = `M ${fmt(px)} ${fmt(py)} C ${fmt(ca_x)} ${fmt(ca_y)} ${fmt(cb_x)} ${fmt(cb_y)} ${fmt(next_x)} ${fmt(next_y)}`
    } else {
      pathSegments[i] = `C ${fmt(ca_x)} ${fmt(ca_y)} ${fmt(cb_x)} ${fmt(cb_y)} ${fmt(next_x)} ${fmt(next_y)}`
    }
  }
  
  pathSegments[count] = 'Z'
  return pathSegments.slice(0, count + 1).join(' ')
}
