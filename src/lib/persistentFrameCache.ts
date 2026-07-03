import type { SequenceConfig } from '../types/sequence'
import { getFrameSrc } from './sequenceLoader'

export const FRAME_CACHE_NAME = 'portfolio-frames-v1'
export const FRAME_CACHE_PREFIX = '/frames/'

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

export async function getCachedFrameResponse(url: string): Promise<Response | undefined> {
  const cacheUrl = getPersistentFrameCacheUrl(url)
  if (!cacheUrl) return undefined

  try {
    const cache = await window.caches.open(FRAME_CACHE_NAME)
    const response = await cache.match(cacheUrl)

    return response ?? undefined
  } catch {
    return undefined
  }
}

export async function putFrameResponse(url: string, response: Response): Promise<void> {
  const cacheUrl = getPersistentFrameCacheUrl(url)
  if (!cacheUrl || !isCacheableFrameResponse(response)) return

  try {
    const cache = await window.caches.open(FRAME_CACHE_NAME)
    await cache.put(cacheUrl, response.clone())
  } catch {
    // Cache Storage is opportunistic; quota/security failures should not affect rendering.
  }
}

export async function deleteOldFrameCaches(currentName = FRAME_CACHE_NAME): Promise<void> {
  if (!isPersistentFrameCacheAvailable()) return

  try {
    const cacheNames = await window.caches.keys()
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith('portfolio-frames-') && cacheName !== currentName)
        .map((cacheName) => window.caches.delete(cacheName)),
    )
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
    if (!resolvedUrl.pathname.includes(FRAME_CACHE_PREFIX)) return undefined

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
