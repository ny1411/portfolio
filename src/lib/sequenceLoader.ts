import { frameCache } from './frameCache'
import type { CachedFrame, SequenceConfig } from '../types/sequence'

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
  return `${sequence.folder}/${sequence.prefix}${String(index).padStart(4, '0')}.${extension}`
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

  const response = await fetch(src, { signal })
  const blob = await response.blob()
  const frame =
    'createImageBitmap' in window
      ? await createImageBitmap(blob)
      : await loadImageElement(URL.createObjectURL(blob))

  const cachedFrame = { key: src, sceneId, frame, priority: 1 }
  frameCache.set(src, cachedFrame)
  return cachedFrame
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
