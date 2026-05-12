import type { CachedFrame } from '../types/sequence'

export class FrameCache {
  private cache = new Map<string, CachedFrame>()
  private maxEntries: number

  constructor(maxEntries = 160) {
    this.maxEntries = maxEntries
  }

  get(key: string): CachedFrame | undefined {
    const cached = this.cache.get(key)
    if (!cached) return undefined

    this.cache.delete(key)
    this.cache.set(key, cached)
    return cached
  }

  set(key: string, frame: CachedFrame): void {
    if (this.cache.has(key)) this.cache.delete(key)
    this.cache.set(key, frame)
    this.evict()
  }

  evictScene(sceneId: string): void {
    for (const [key, value] of this.cache) {
      if (value.sceneId === sceneId) this.cache.delete(key)
    }
  }

  clear(): void {
    for (const value of this.cache.values()) {
      if ('close' in value.frame) value.frame.close()
    }

    this.cache.clear()
  }

  private evict(): void {
    while (this.cache.size > this.maxEntries) {
      const [key, value] = this.cache.entries().next().value as [string, CachedFrame]
      if ('close' in value.frame) value.frame.close()
      this.cache.delete(key)
    }
  }
}

export const frameCache = new FrameCache()
