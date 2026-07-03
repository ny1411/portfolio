import type { CachedFrame } from '../types/sequence'
import { getAdaptiveDecodedFrameCacheSize } from './deviceMemory'

export class FrameCache {
  private cache = new Map<string, CachedFrame>()
  private maxEntryCount: number

  constructor(maxEntries = getAdaptiveDecodedFrameCacheSize()) {
    this.maxEntryCount = maxEntries
  }

  get(key: string): CachedFrame | undefined {
    const cached = this.cache.get(key)
    if (!cached) return undefined
    if (!isUsableFrame(cached)) {
      this.deleteFrame(key, cached)
      return undefined
    }

    this.cache.delete(key)
    this.cache.set(key, cached)
    return cached
  }

  has(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    if (isUsableFrame(cached)) return true

    this.deleteFrame(key, cached)
    return false
  }

  set(key: string, frame: CachedFrame): void {
    if (!isUsableFrame(frame)) return
    const previousFrame = this.cache.get(key)

    if (previousFrame) {
      this.cache.delete(key)
      if (previousFrame !== frame) closeFrame(previousFrame)
    }

    this.cache.set(key, frame)
    this.evict()
  }

  evictScene(sceneId: string): void {
    for (const [key, value] of this.cache) {
      if (value.sceneId === sceneId) this.deleteFrame(key, value)
    }
  }

  get size(): number {
    return this.cache.size
  }

  get maxEntries(): number {
    return this.maxEntryCount
  }

  setMaxEntries(maxEntries: number): void {
    if (!Number.isFinite(maxEntries)) return

    this.maxEntryCount = Math.max(1, Math.floor(maxEntries))
    this.evict()
  }

  clear(): void {
    for (const value of this.cache.values()) {
      closeFrame(value)
    }

    this.cache.clear()
  }

  private evict(): void {
    while (this.cache.size > this.maxEntryCount) {
      const [key, value] = this.cache.entries().next().value as [string, CachedFrame]
      this.deleteFrame(key, value)
    }
  }

  private deleteFrame(key: string, frame: CachedFrame): void {
    closeFrame(frame)
    this.cache.delete(key)
  }
}

export const frameCache = new FrameCache()

function isUsableFrame({ frame }: CachedFrame): boolean {
  return frame.width > 0 && frame.height > 0
}

function closeFrame({ frame }: CachedFrame): void {
  if (!('close' in frame)) return

  try {
    frame.close()
  } catch {
    // Closing is best-effort; a browser may already have detached the bitmap.
  }
}
