import { getDeviceMemoryGb } from './deviceMemory'

export interface DeviceProfile {
  tier: 'low' | 'mid' | 'high'
  maxDPR: number
  maxFrames: number
  prefersReducedMotion: boolean
  isLowPower: boolean
}

/**
 * Concurrency limits applied per-priority when the user is idle (not scrolling).
 * Higher limits allow more background work to proceed.
 */
export interface ConcurrencyPolicy {
  /** Maximum total in-flight jobs across all priorities. */
  totalLimit: number
  /** Per-priority concurrency ceilings while idle. */
  idleLimits: PriorityConcurrencyLimits
  /** Per-priority concurrency ceilings while actively scrolling. */
  scrollingLimits: PriorityConcurrencyLimits
  /** Concurrency for hero startup phase. */
  startupHeroConcurrency: number
  /** Concurrency for remaining hero frames after startup. */
  heroRemainderConcurrency: number
  /** Concurrency for background contact frame warming. */
  contactBackgroundConcurrency: number
  /** Milliseconds to yield between background job batches. */
  backgroundYieldMs: number
}

export interface PriorityConcurrencyLimits {
  critical: number
  hot: number
  warm: number
  background: number
}

let cachedProfile: DeviceProfile | undefined

export function getDeviceProfile(): DeviceProfile {
  if (cachedProfile) return cachedProfile

  if (typeof window === 'undefined') {
    return {
      tier: 'mid',
      maxDPR: 1,
      maxFrames: 120,
      prefersReducedMotion: false,
      isLowPower: false,
    }
  }

  const cores = navigator.hardwareConcurrency ?? 4
  const memory = getDeviceMemoryGb() ?? 4
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isTouch = window.matchMedia('(pointer: coarse)').matches
  const isLowPower = cores <= 4 || memory <= 4 || isTouch
  const tier = cores >= 8 && memory >= 8 ? 'high' : isLowPower ? 'low' : 'mid'

  cachedProfile = {
    tier,
    maxDPR: tier === 'high' ? 2 : tier === 'mid' ? 1.5 : 1,
    maxFrames: tier === 'high' ? 180 : tier === 'mid' ? 120 : 72,
    prefersReducedMotion,
    isLowPower,
  }

  return cachedProfile
}

/**
 * Returns a concurrency policy tailored to the current device tier.
 *
 * High-end devices get more aggressive background work and higher total
 * in-flight limits. Low-end devices keep background work minimal and
 * yield more often to avoid request storms and decoder pressure.
 */
export function getConcurrencyPolicy(): ConcurrencyPolicy {
  const { tier } = getDeviceProfile()

  switch (tier) {
    case 'high':
      return {
        totalLimit: 8,
        idleLimits: { critical: 6, hot: 4, warm: 3, background: 5 },
        scrollingLimits: { critical: 6, hot: 4, warm: 1, background: 2 },
        startupHeroConcurrency: 6,
        heroRemainderConcurrency: 5,
        contactBackgroundConcurrency: 3,
        backgroundYieldMs: 0,
      }
    case 'mid':
      return {
        totalLimit: 6,
        idleLimits: { critical: 6, hot: 4, warm: 2, background: 4 },
        scrollingLimits: { critical: 6, hot: 3, warm: 1, background: 1 },
        startupHeroConcurrency: 6,
        heroRemainderConcurrency: 4,
        contactBackgroundConcurrency: 2,
        backgroundYieldMs: 4,
      }
    case 'low':
      return {
        totalLimit: 4,
        idleLimits: { critical: 4, hot: 3, warm: 1, background: 2 },
        scrollingLimits: { critical: 4, hot: 2, warm: 0, background: 0 },
        startupHeroConcurrency: 4,
        heroRemainderConcurrency: 3,
        contactBackgroundConcurrency: 1,
        backgroundYieldMs: 8,
      }
  }
}
