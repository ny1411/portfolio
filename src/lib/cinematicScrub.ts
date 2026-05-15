import type { SequenceConfig } from '../types/sequence'
import { getFrameCount } from './sequenceLoader'

const DEFAULT_SCROLL_VH_PER_FRAME = 8
const MIN_SEQUENCE_SCROLL_VH = 1200
const MAX_SEQUENCE_SCROLL_VH = 4200

export function getCinematicPinDuration(sequence?: SequenceConfig, fallback = 900): number {
  if (!sequence) return fallback

  const frameCount = getFrameCount(sequence)
  const scrollVhPerFrame = sequence.scrollVhPerFrame ?? DEFAULT_SCROLL_VH_PER_FRAME

  return Math.round(
    Math.min(MAX_SEQUENCE_SCROLL_VH, Math.max(MIN_SEQUENCE_SCROLL_VH, frameCount * scrollVhPerFrame)),
  )
}

export function smoothScrubProgress({
  current,
  target,
  elapsedMs,
  sequence,
}: {
  current: number
  target: number
  elapsedMs: number
  sequence: SequenceConfig
}): number {
  const frameCount = Math.max(1, getFrameCount(sequence))
  const clampedCurrent = clamp(current, 0, 1)
  const clampedTarget = clamp(target, 0, 1)
  const smoothing = clamp(sequence.smoothing ?? 0.12, 0.01, 0.45)
  const maxFrameStep = sequence.maxFrameStep ?? 1.35
  const normalizedElapsed = Math.max(0.5, Math.min(3, elapsedMs / 16.67))
  const distanceFrames = Math.abs(clampedTarget - clampedCurrent) * Math.max(1, frameCount - 1)
  const catchUpBoost = clamp((distanceFrames - 1) / 28, 0, 1) * 0.14
  const damping = clamp(1 - Math.pow(1 - smoothing - catchUpBoost, normalizedElapsed), 0, 0.42)
  const next = clampedCurrent + (clampedTarget - clampedCurrent) * damping
  const maxProgressStep = (maxFrameStep * normalizedElapsed) / Math.max(1, frameCount - 1)
  const delta = clamp(next - clampedCurrent, -maxProgressStep, maxProgressStep)

  if (Math.abs(clampedTarget - clampedCurrent) <= maxProgressStep * 0.5) {
    return clampedTarget
  }

  return clamp(clampedCurrent + delta, 0, 1)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
