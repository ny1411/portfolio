import { frameCache } from './frameCache'
import { framePreloadScheduler } from './framePreloadScheduler'
import { getPersistentCacheMetrics, isPersistentFrameCacheAvailable } from './persistentFrameCache'
import { getPendingFrameCount } from './sequenceLoader'

export interface PreloadDebugState {
  decodedCacheSize: number
  decodedCacheMax: number
  pendingFrameCount: number
  persistentCacheEnabled: boolean
  persistentCacheHits: number
  persistentCacheMisses: number
  schedulerQueueLength: Record<string, number>
  schedulerInFlight: Record<string, number>
  lastFailedFrameUrl: string | undefined
}

export function getPreloadDebugState(): PreloadDebugState {
  return {
    decodedCacheSize: frameCache.size,
    decodedCacheMax: frameCache.maxEntries,
    pendingFrameCount: getPendingFrameCount(),
    persistentCacheEnabled: isPersistentFrameCacheAvailable(),
    persistentCacheHits: getPersistentCacheMetrics().hits,
    persistentCacheMisses: getPersistentCacheMetrics().misses,
    schedulerQueueLength: framePreloadScheduler.queueLengthByPriority,
    schedulerInFlight: framePreloadScheduler.inFlightByPriority,
    lastFailedFrameUrl: framePreloadScheduler.lastFailedFrameUrl,
  }
}

declare global {
  interface Window {
    __portfolioPreloadDebug?: () => PreloadDebugState
  }
}

export function initPreloadDebug(): void {
  if (typeof window === 'undefined') return

  if (import.meta.env.DEV) {
    window.__portfolioPreloadDebug = getPreloadDebugState
  }
}
