import { useEffect, useRef } from 'react'
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

  useEffect(() => {
    if (!sequence) return

    return rafScheduler.schedule((time) => {
      const canvas = canvasRef.current
      if (!canvas) return

      if (reducedMotion) {
        void draw(canvas, 0.5, time, true)
        return
      }

      void draw(canvas, progressRef.current, time)
    }, 10)
  }, [draw, progressRef, reducedMotion, sequence])

  if (!sequence) return null

  return <canvas ref={canvasRef} className="sequence-canvas" aria-hidden="true" />
}
