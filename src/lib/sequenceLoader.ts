import { frameCache } from './frameCache'
import { getBundledFrameUrl } from './frameManifest'
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
  const filename = `${sequence.prefix}${String(index).padStart(4, '0')}.${extension}`

  return getBundledFrameUrl(sequence.folder, filename) ?? `/src/assets/frames/${sequence.folder}/${filename}`
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

  const pendingFrame = fetch(src, { signal })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load frame ${src}: ${response.status}`)
      }

      const blob = await response.blob()
      const frame =
        'createImageBitmap' in window
          ? await createImageBitmap(blob)
          : await loadImageElement(URL.createObjectURL(blob))
      const cachedFrame = { key: src, sceneId, frame, priority: 1 }

      frameCache.set(src, cachedFrame)
      return cachedFrame
    })
    .finally(() => pendingFrames.delete(src))

  pendingFrames.set(src, pendingFrame)
  return pendingFrame
}

export function preloadFrameWindow(sceneId: string, sequence: SequenceConfig, centerIndex: number): void {
  const radius = sequence.preloadRadius ?? 12
  const startIndex = Math.max(sequence.startIndex, centerIndex - radius)
  const endIndex = Math.min(sequence.endIndex, centerIndex + radius)

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
    document.head.appendChild(link)
  }
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
