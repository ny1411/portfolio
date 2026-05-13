import { useCallback, useEffect, useRef } from 'react'
import { getDeviceProfile } from '../../lib/performance'
import { getFrameIndex, loadFrame, preloadFrameWindow } from '../../lib/sequenceLoader'
import type { SequenceConfig } from '../../types/sequence'

export function useImageSequence(sceneId: string, sequence?: SequenceConfig) {
  const lastDrawKeyRef = useRef<string>('')
  const latestRequestRef = useRef(0)
  const lastPreloadIndexRef = useRef<number | null>(null)

  const draw = useCallback(
    async (canvas: HTMLCanvasElement, progress: number) => {
      if (!sequence) return false

      const context = canvas.getContext('2d')
      if (!context) return false

      const profile = getDeviceProfile()
      const dpr = Math.min(window.devicePixelRatio || 1, profile.maxDPR)
      const width = window.innerWidth
      const height = window.innerHeight
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
        preloadFrameWindow(sceneId, sequence, frameIndex)
      }

      return true
    },
    [sceneId, sequence],
  )

  useEffect(() => {
    latestRequestRef.current += 1
  }, [sequence])

  return { draw }
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
