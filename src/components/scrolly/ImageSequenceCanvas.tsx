import { useEffect, useRef } from 'react'
import { smoothScrubProgress } from '../../lib/cinematicScrub'
import { rafScheduler } from '../../lib/rafScheduler'
import type { SequenceConfig } from '../../types/sequence'
import { useImageSequence } from './useImageSequence'
import { useReducedMotion } from './useReducedMotion'
import { useSceneProgress } from './useSceneProgress'

interface ImageSequenceCanvasProps {
  sceneId: string
  sequence?: SequenceConfig
}

export function ImageSequenceCanvas({ sceneId, sequence }: ImageSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useSceneProgress(sceneId)
  const reducedMotion = useReducedMotion()
  const { draw } = useImageSequence(sceneId, sequence)
  const smoothedProgressRef = useRef(0)
  const lastTickRef = useRef<number | null>(null)

  useEffect(() => {
    if (!sequence) return

    return rafScheduler.schedule((time) => {
      const canvas = canvasRef.current
      if (!canvas) return

      if (reducedMotion) {
        void draw(canvas, 0.5)
        return
      }

      const lastTick = lastTickRef.current ?? time
      const elapsedMs = Math.max(0, time - lastTick)
      lastTickRef.current = time
      smoothedProgressRef.current = smoothScrubProgress({
        current: smoothedProgressRef.current,
        target: progressRef.current,
        elapsedMs,
        sequence,
      })

      void draw(canvas, smoothedProgressRef.current)
    }, 10)
  }, [draw, progressRef, reducedMotion, sequence])

  return <canvas ref={canvasRef} className="sequence-canvas" aria-hidden="true" />
}
