import type { SequenceConfig } from '../types/sequence'
import { getBuildVersion } from './buildMetadata'
import { getBundledFrameUrl } from './frameManifest'

/**
 * Persistent frame cache prefix. All portfolio frame caches start with this
 * string followed by a build-derived version tag.
 */
const FRAME_CACHE_PREFIX_PATTERN = 'portfolio-frames-'

/**
 * URL path segment used to identify cacheable frame requests.
 * Only requests whose pathname contains this prefix are eligible for
 * persistent caching.
 */
export const FRAME_CACHE_URL_PREFIX = '/frames/'

/**
 * The number of old caches to retain during cleanup.
 * Keeping one previous cache avoids redundant re-downloads when a user
 * has two tabs open across a deploy boundary.
 */
const OLD_CACHE_RETENTION_COUNT = 1

/**
 * Returns the current versioned cache name.
 *
 * The name includes a build-derived hash so that every deploy automatically
 * invalidates old caches. During development the hash changes on each
 * dev server restart.
 *
 * Format: `portfolio-frames-<8-char-hex>`
 *
 * @example
 * ```text
 * portfolio-frames-a1b2c3d4
 * ```
 */
export function getFrameCacheName(): string {
  return `${FRAME_CACHE_PREFIX_PATTERN}${getBuildVersion()}`
}

/**
 * @deprecated Use `getFrameCacheName()` instead. This static constant does
 * not include a build-derived version and will be removed in a future phase.
 */
export const FRAME_CACHE_NAME = getFrameCacheName()

/**
 * Re-export for backward compat with code that references FRAME_CACHE_PREFIX.
 */
export const FRAME_CACHE_PREFIX = FRAME_CACHE_URL_PREFIX

interface WarmPersistentFrameRangeOptions {
  concurrency?: number
  endIndex?: number
  frameLimit?: number
  signal?: AbortSignal
  startIndex?: number
}

export function isPersistentFrameCacheAvailable(): boolean {
  return typeof window !== 'undefined' && 'caches' in window
}

const metrics = {
  hits: 0,
  misses: 0,
}

export function getPersistentCacheMetrics(): { hits: number; misses: number } {
  return { ...metrics }
}

export async function getCachedFrameResponse(url: string): Promise<Response | undefined> {
  const cacheUrl = getPersistentFrameCacheUrl(url)
  if (!cacheUrl) return undefined

  try {
    const cache = await window.caches.open(getFrameCacheName())
    const response = await cache.match(cacheUrl)

    if (response) {
      metrics.hits += 1
    } else {
      metrics.misses += 1
    }

    return response ?? undefined
  } catch {
    return undefined
  }
}

export async function putFrameResponse(url: string, response: Response): Promise<void> {
  const cacheUrl = getPersistentFrameCacheUrl(url)
  if (!cacheUrl || !isCacheableFrameResponse(response)) return

  try {
    const cache = await window.caches.open(getFrameCacheName())
    await cache.put(cacheUrl, response.clone())
  } catch {
    // Cache Storage is opportunistic; quota/security failures should not affect rendering.
  }
}

/**
 * Deletes old `portfolio-frames-*` caches that no longer match the current
 * build version. Retains up to {@link OLD_CACHE_RETENTION_COUNT} previous
 * caches to avoid redundant re-downloads during rolling deploys.
 *
 * Called once at app startup from `ScrollyPage`.
 */
export async function deleteOldFrameCaches(currentName?: string): Promise<void> {
  if (!isPersistentFrameCacheAvailable()) return

  const activeName = currentName ?? getFrameCacheName()

  try {
    const cacheNames = await window.caches.keys()
    const oldCaches = cacheNames
      .filter((name) => name.startsWith(FRAME_CACHE_PREFIX_PATTERN) && name !== activeName)
      // Sort alphabetically so the most recent (highest hash) is kept.
      .sort()

    // Keep the N most recent old caches; delete the rest.
    const cachesToDelete = oldCaches.slice(0, Math.max(0, oldCaches.length - OLD_CACHE_RETENTION_COUNT))

    await Promise.all(cachesToDelete.map((name) => window.caches.delete(name)))
  } catch {
    // Old cache cleanup is best-effort.
  }
}

export async function warmPersistentFrameRange(
  sceneId: string,
  sequence: SequenceConfig,
  options: WarmPersistentFrameRangeOptions = {},
): Promise<void> {
  const indexes = getWarmRangeIndexes(sequence, options)
  const workerCount = Math.min(getWorkerCount(options.concurrency ?? 2), indexes.length)

  if (workerCount === 0) return

  let nextIndex = 0
  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < indexes.length) {
      if (options.signal?.aborted) return

      const frameIndex = indexes[nextIndex]
      nextIndex += 1
      const frameUrl = getFrameSrc(sequence, frameIndex)
      const cached = await getCachedFrameResponse(frameUrl)

      if (cached) continue

      const response = await fetch(frameUrl, { signal: options.signal })
      if (!response.ok) {
        throw new Error(`Failed to warm persistent frame ${sceneId}:${frameIndex}: ${response.status}`)
      }

      await putFrameResponse(frameUrl, response)
    }
  })

  await Promise.all(workers)
}

function getPersistentFrameCacheUrl(url: string): string | undefined {
  if (!isPersistentFrameCacheAvailable()) return undefined

  try {
    const resolvedUrl = new URL(url, window.location.href)
    if (resolvedUrl.origin !== window.location.origin) return undefined
    if (!resolvedUrl.pathname.includes(FRAME_CACHE_URL_PREFIX)) return undefined

    return resolvedUrl.href
  } catch {
    return undefined
  }
}

function isCacheableFrameResponse(response: Response): boolean {
  if (!response.ok) return false
  if (response.type !== 'basic' && response.type !== 'default') return false

  return true
}

function getWarmRangeIndexes(
  sequence: SequenceConfig,
  { endIndex, frameLimit, startIndex }: WarmPersistentFrameRangeOptions,
): number[] {
  const start = Math.max(sequence.startIndex, startIndex ?? sequence.startIndex)
  const end = Math.min(sequence.endIndex, endIndex ?? sequence.endIndex)
  const limit = getFrameLimit(sequence, frameLimit)
  const indexes: number[] = []

  for (let index = start; index <= end && indexes.length < limit; index += 1) {
    indexes.push(index)
  }

  return indexes
}

function getFrameLimit(sequence: SequenceConfig, frameLimit?: number): number {
  const sequenceFrameCount = sequence.endIndex - sequence.startIndex + 1
  if (frameLimit === undefined || !Number.isFinite(frameLimit)) return sequenceFrameCount

  return Math.min(sequenceFrameCount, Math.max(0, Math.floor(frameLimit)))
}

function getWorkerCount(concurrency: number): number {
  if (!Number.isFinite(concurrency)) return 0

  return Math.max(0, Math.floor(concurrency))
}

function getFrameSrc(sequence: SequenceConfig, index: number): string {
  const extension = sequence.extension ?? 'jpg'
  const padLength = sequence.padLength ?? 4
  const filename = `${sequence.prefix}${String(index).padStart(padLength, '0')}.${extension}`

  return getBundledFrameUrl(sequence.folder, filename)
}
