import type { MutableRefObject } from 'react'
import { BLOB_POINT_COUNT } from './constants'
import { getScaleMatrixTransform } from './geometry'
import { clamp, damp, fmt, length, pxNumber } from './math'
import type { HeroGeometry, MotionState, Point, Rect, ViewportSnapshot } from './types'

export function updateSvgReveal({
  blobCorePath,
  blobFeatherPath,
  blobPointsRef,
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
  blobPointsRef: MutableRefObject<Point[] | null>
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
  revealSvg.setAttribute('viewBox', `0 0 ${viewport.width} ${viewport.height}`)
  revealImage.setAttribute('x', pxNumber(geometry.frame.x))
  revealImage.setAttribute('y', pxNumber(geometry.frame.y))
  revealImage.setAttribute('width', pxNumber(geometry.frame.width))
  revealImage.setAttribute('height', pxNumber(geometry.frame.height))
  revealLayer.setAttribute('transform', getScaleMatrixTransform(geometry.reveal))

  const targetPoints = getBlobTargetPoints(geometry.mask, motion, time, reducedMotion, revealAmount)
  if (!blobPointsRef.current || blobPointsRef.current.length !== targetPoints.length) {
    blobPointsRef.current = targetPoints
  } else {
    blobPointsRef.current = blobPointsRef.current.map((point, index) => ({
      x: damp(point.x, targetPoints[index].x, reducedMotion ? 1 : 0.32),
      y: damp(point.y, targetPoints[index].y, reducedMotion ? 1 : 0.32),
    }))
  }

  const path = pointsToClosedBezierPath(blobPointsRef.current)
  blobCorePath.setAttribute('d', path)
  blobFeatherPath.setAttribute('d', path)
}

function getBlobTargetPoints(
  mask: Rect,
  motion: MotionState,
  time: number,
  reducedMotion: boolean,
  revealAmount: number,
): Point[] {
  const center = {
    x: mask.x + mask.width * 0.5,
    y: mask.y + mask.height * 0.47,
  }
  const active = reducedMotion ? 0 : clamp(revealAmount, 0, 1)
  const speed = reducedMotion ? 0 : clamp(motion.speed, 0, 1)
  const acceleration = reducedMotion ? 0 : clamp(length(motion.acceleration) * 0.06, 0, 1)
  const idleEase = reducedMotion ? 1 : clamp(motion.idleMs / 900, 0, 1)
  const direction = speed > 0.02 ? motion.direction : { x: 0, y: 0 }
  const perpendicular = { x: -direction.y, y: direction.x }
  const horizontalBias = Math.abs(direction.x)
  const verticalBias = Math.abs(direction.y)
  const directionAngle = Math.atan2(direction.y, direction.x || 0.0001)
  const radiusX =
    mask.width *
    (0.24 + active * 0.12) *
    (1 + speed * (0.65 + horizontalBias * 0.7) + acceleration * 0.1)
  const radiusY =
    mask.height *
    (0.23 + active * 0.1) *
    (1 + speed * (0.48 + verticalBias * 0.62) + acceleration * 0.08)
  const breathing = reducedMotion ? 0 : Math.sin(time * 0.0012) * 0.004 * idleEase * active

  return Array.from({ length: BLOB_POINT_COUNT }, (_, index) => {
    const angle = (Math.PI * 2 * index) / BLOB_POINT_COUNT - Math.PI / 2
    const unit = { x: Math.cos(angle), y: Math.sin(angle) }
    const tangent = { x: -unit.y, y: unit.x }
    const forward = unit.x * direction.x + unit.y * direction.y
    const side = unit.x * perpendicular.x + unit.y * perpendicular.y
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
    const helmetPinch = -Math.max(unit.y, 0) * 0.1 + Math.max(-unit.y, 0) * 0.055
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
    const tangentPush =
      (Math.sin(angle * 2 - directionAngle) * 0.04 + Math.cos(angle + directionAngle) * speed * 0.045) *
      Math.min(mask.width, mask.height)

    return {
      x:
        center.x +
        unit.x * radiusX * (radius + helmetPinch) +
        tangent.x * tangentPush +
        direction.x * pull,
      y:
        center.y +
        unit.y * radiusY * (radius - helmetPinch * 0.45) +
        tangent.y * tangentPush +
        direction.y * pull * 0.72,
    }
  })
}

function pointsToClosedBezierPath(points: Point[]): string {
  if (points.length < 2) return ''

  return points
    .map((point, index) => {
      const previous = points[(index - 1 + points.length) % points.length]
      const next = points[(index + 1) % points.length]
      const afterNext = points[(index + 2) % points.length]
      const controlA = {
        x: point.x + (next.x - previous.x) / 6,
        y: point.y + (next.y - previous.y) / 6,
      }
      const controlB = {
        x: next.x - (afterNext.x - point.x) / 6,
        y: next.y - (afterNext.y - point.y) / 6,
      }

      if (index === 0) {
        return `M ${fmt(point.x)} ${fmt(point.y)} C ${fmt(controlA.x)} ${fmt(controlA.y)} ${fmt(controlB.x)} ${fmt(controlB.y)} ${fmt(next.x)} ${fmt(next.y)}`
      }

      return `C ${fmt(controlA.x)} ${fmt(controlA.y)} ${fmt(controlB.x)} ${fmt(controlB.y)} ${fmt(next.x)} ${fmt(next.y)}`
    })
    .join(' ')
    .concat(' Z')
}
