import { frameCache } from './frameCache'
import { getBundledFrameUrl } from './frameManifest'
import { getCachedFrameResponse, putFrameResponse } from './persistentFrameCache'
import type { CachedFrame, SequenceConfig } from '../types/sequence'

const pendingFrames = new Map<string, Promise<CachedFrame>>()

export function getFrameCount(sequence: SequenceConfig): number {
  return sequence.endIndex - sequence.startIndex + 1
}

export function getFrameIndex(sequence: SequenceConfig, progress: number): number {
  const count = getFrameCount(sequence)
  const clamped = Math.min(1, Math.max(0, progress))
  return sequence.startIndex + Math.round(clamped * (count - 1))
}

export function getFrameSrc(sequence: SequenceConfig, index: number): string {
  const extension = sequence.extension ?? 'jpg'
  const padLength = sequence.padLength ?? 4
  const filename = `${sequence.prefix}${String(index).padStart(padLength, '0')}.${extension}`

  return getBundledFrameUrl(sequence.folder, filename) ?? `/src/assets/frames/${sequence.folder}/${filename}`
}

export function isFrameDecoded(sequence: SequenceConfig, index: number): boolean {
  return frameCache.has(getFrameSrc(sequence, index))
}

export function isFramePending(sequence: SequenceConfig, index: number): boolean {
  return pendingFrames.has(getFrameSrc(sequence, index))
}

export async function loadFrame(
  sceneId: string,
  sequence: SequenceConfig,
  index: number,
  signal?: AbortSignal,
): Promise<CachedFrame> {
  const src = getFrameSrc(sequence, index)
  const cached = frameCache.get(src)
  if (cached) return cached

  const pending = pendingFrames.get(src)
  if (pending) return pending

  const pendingFrame = loadRawFrameResponse(src, signal)
    .then((response) => decodeAndCacheFrame(sceneId, src, response))
    .finally(() => pendingFrames.delete(src))

  pendingFrames.set(src, pendingFrame)
  return pendingFrame
}

async function loadRawFrameResponse(src: string, signal?: AbortSignal): Promise<Response> {
  if (signal?.aborted) throw createAbortError()

  const cachedResponse = await getCachedFrameResponse(src)
  if (cachedResponse) return cachedResponse
  if (signal?.aborted) throw createAbortError()

  const response = await fetch(src, { signal })
  if (!response.ok) {
    throw new Error(`Failed to load frame ${src}: ${response.status}`)
  }

  void putFrameResponse(src, response.clone())
  return response
}

async function decodeAndCacheFrame(
  sceneId: string,
  src: string,
  response: Response,
): Promise<CachedFrame> {
  const blob = await response.blob()
  const frame =
    'createImageBitmap' in window
      ? await createImageBitmap(blob)
      : await loadImageElement(URL.createObjectURL(blob))
  const cachedFrame = { key: src, sceneId, frame, priority: 1 }

  frameCache.set(src, cachedFrame)
  return cachedFrame
}

/**
 * @deprecated Use `framePreloadScheduler.preloadFrameWindow()` instead.
 * This function does not support direction-aware or device-adaptive frame ordering.
 * Kept for backward compatibility only.
 */
export function preloadFrameWindow(sceneId: string, sequence: SequenceConfig, centerIndex: number): void {
  const radius = sequence.preloadRadius ?? 12
  const startIndex = Math.max(sequence.startIndex, centerIndex - radius)
  const endIndex = Math.min(sequence.endIndex, centerIndex + radius)

  if (sequence.preloadStrategy === 'cinematic') {
    const nearbyIndexes = getNearbyIndexes(centerIndex, startIndex, endIndex).slice(0, 8)

    nearbyIndexes.forEach((index, order) => {
      window.setTimeout(() => {
        void loadFrame(sceneId, sequence, index).catch(() => undefined)
      }, order * 48)
    })
    return
  }

  for (let index = startIndex; index <= endIndex; index += 1) {
    void loadFrame(sceneId, sequence, index).catch(() => undefined)
  }
}

export function preloadSequenceFrames(sequence: SequenceConfig, count: number): void {
  if (typeof document === 'undefined') return

  const endIndex = Math.min(sequence.endIndex, sequence.startIndex + count - 1)

  for (let index = sequence.startIndex; index <= endIndex; index += 1) {
    const href = getFrameSrc(sequence, index)
    const existing = document.head.querySelector(`link[rel="preload"][href="${href}"]`)
    if (existing) continue

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = href
    link.setAttribute('fetchpriority', 'high')
    document.head.appendChild(link)
  }
}

export async function preloadSequenceFrameRange(
  sceneId: string,
  sequence: SequenceConfig,
  signal?: AbortSignal,
  concurrency = 6,
  frameLimit?: number,
): Promise<void> {
  const frameCount = getPreloadFrameCount(sequence, frameLimit)
  const workerCount = Math.min(getWorkerCount(concurrency), frameCount)

  if (frameCount === 0 || workerCount === 0) return

  let nextIndex = sequence.startIndex
  const lastIndex = sequence.startIndex + frameCount - 1

  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex <= lastIndex) {
      if (signal?.aborted) return

      const index = nextIndex
      nextIndex += 1
      await loadFrame(sceneId, sequence, index, signal)
    }
  })

  await Promise.all(workers)
}

function getPreloadFrameCount(sequence: SequenceConfig, frameLimit?: number): number {
  const sequenceFrameCount = Math.max(0, getFrameCount(sequence))
  if (frameLimit === undefined) return sequenceFrameCount
  if (!Number.isFinite(frameLimit)) return sequenceFrameCount

  return Math.min(sequenceFrameCount, Math.max(0, Math.floor(frameLimit)))
}

function getWorkerCount(concurrency: number): number {
  if (!Number.isFinite(concurrency)) return 0

  return Math.max(0, Math.floor(concurrency))
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function getNearbyIndexes(centerIndex: number, startIndex: number, endIndex: number): number[] {
  const indexes: number[] = []

  for (let offset = 1; offset <= endIndex - startIndex; offset += 1) {
    const nextIndex = centerIndex + offset
    const previousIndex = centerIndex - offset

    if (nextIndex <= endIndex) indexes.push(nextIndex)
    if (previousIndex >= startIndex) indexes.push(previousIndex)
  }

  return indexes
}

function createAbortError(): Error | DOMException {
  if (typeof DOMException !== 'undefined') {
    return new DOMException('Frame load aborted', 'AbortError')
  }

  const error = new Error('Frame load aborted')
  error.name = 'AbortError'
  return error
}
