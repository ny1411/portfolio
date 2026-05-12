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

    return rafScheduler.schedule(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      void draw(canvas, reducedMotion ? 0.5 : progressRef.current)
    }, 10)
  }, [draw, progressRef, reducedMotion, sequence])

  return <canvas ref={canvasRef} className="sequence-canvas" aria-hidden="true" />
}
