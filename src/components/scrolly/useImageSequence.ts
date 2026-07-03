import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { smoothScrubProgress } from '../../lib/cinematicScrub'
import { framePreloadScheduler } from '../../lib/framePreloadScheduler'
import { getDeviceProfile } from '../../lib/performance'
import { getFrameIndex, loadFrame } from '../../lib/sequenceLoader'
import type { SequenceConfig } from '../../types/sequence'
import { useScrollStore } from './scrollStore'

export function useImageSequence(sceneId: string, sequence?: SequenceConfig) {
  const scrollDirection = useScrollStore((state) => state.direction)
  const lastDrawKeyRef = useRef<string>('')
  const latestRequestRef = useRef(0)
  const lastPreloadIndexRef = useRef<number | null>(null)
  const smoothedProgressRef = useRef(0)
  const lastTickRef = useRef<number | null>(null)

  const draw = useCallback(
    async (
      canvas: HTMLCanvasElement,
      targetProgress: number,
      time = performance.now(),
      immediate = false,
    ) => {
      if (!sequence) return false

      const context = canvas.getContext('2d')
      if (!context) return false

      const profile = getDeviceProfile()
      const dpr = Math.min(window.devicePixelRatio || 1, profile.maxDPR)
      const width = window.innerWidth
      const height = window.innerHeight
      const progress = getRenderedProgress({
        target: targetProgress,
        time,
        sequence,
        smoothedProgressRef,
        lastTickRef,
        immediate,
      })
      const frameIndex = getFrameIndex(sequence, progress)
      const drawKey = `${frameIndex}:${width}:${height}:${dpr}`

      if (lastDrawKeyRef.current === drawKey) return false

      const requestId = latestRequestRef.current + 1
      latestRequestRef.current = requestId

      const cached = await loadFrame(sceneId, sequence, frameIndex)
      if (requestId !== latestRequestRef.current) return false

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      drawCover(context, cached.frame, width, height)
      lastDrawKeyRef.current = drawKey

      if (lastPreloadIndexRef.current !== frameIndex) {
        lastPreloadIndexRef.current = frameIndex
        framePreloadScheduler.preloadFrameWindow({
          centerIndex: frameIndex,
          direction: scrollDirection,
          priority: 'hot',
          sceneId,
          sequence,
        })
      }

      return true
    },
    [sceneId, scrollDirection, sequence],
  )

  useEffect(() => {
    latestRequestRef.current += 1
    smoothedProgressRef.current = 0
    lastTickRef.current = null
    lastDrawKeyRef.current = ''
    lastPreloadIndexRef.current = null
  }, [sequence])

  return { draw }
}

function getRenderedProgress({
  target,
  time,
  sequence,
  smoothedProgressRef,
  lastTickRef,
  immediate,
}: {
  target: number
  time: number
  sequence: SequenceConfig
  smoothedProgressRef: RefObject<number>
  lastTickRef: RefObject<number | null>
  immediate: boolean
}): number {
  const clampedTarget = clamp(target, 0, 1)
  const lastTick = lastTickRef.current

  if (immediate || lastTick === null) {
    lastTickRef.current = time
    smoothedProgressRef.current = clampedTarget
    return clampedTarget
  }

  const elapsedMs = Math.max(0, time - lastTick)
  lastTickRef.current = time
  smoothedProgressRef.current = smoothScrubProgress({
    current: smoothedProgressRef.current,
    target: clampedTarget,
    elapsedMs,
    sequence,
  })

  return smoothedProgressRef.current
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: ImageBitmap | HTMLImageElement,
  width: number,
  height: number,
): void {
  const imageWidth = image.width
  const imageHeight = image.height
  const scale = Math.max(width / imageWidth, height / imageHeight)
  const scaledWidth = imageWidth * scale
  const scaledHeight = imageHeight * scale
  const x = (width - scaledWidth) / 2
  const y = (height - scaledHeight) / 2

  context.drawImage(image, x, y, scaledWidth, scaledHeight)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
