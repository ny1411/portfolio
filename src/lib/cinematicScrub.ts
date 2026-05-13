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
  const smoothing = sequence.smoothing ?? 0.075
  const maxFrameStep = sequence.maxFrameStep ?? 0.85
  const normalizedElapsed = Math.max(0.5, Math.min(2.5, elapsedMs / 16.67))
  const damping = 1 - Math.pow(1 - smoothing, normalizedElapsed)
  const easedTarget = cinematicEase(target)
  const next = current + (easedTarget - current) * damping
  const maxProgressStep = maxFrameStep / Math.max(1, frameCount - 1)

  return clamp(current + clamp(next - current, -maxProgressStep, maxProgressStep), 0, 1)
}

function cinematicEase(progress: number): number {
  const clamped = clamp(progress, 0, 1)

  return clamped * clamped * (3 - 2 * clamped)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
