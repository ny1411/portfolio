import { useEffect, useRef } from 'react'
import { rafScheduler } from '../../lib/rafScheduler'
import type { SequenceConfig } from '../../types/sequence'
import { useImageSequence } from './useImageSequence'
import { useSceneProgress } from './useSceneProgress'

interface ImageSequenceCanvasProps {
  sceneId: string
  sequence?: SequenceConfig
}

export function ImageSequenceCanvas({ sceneId, sequence }: ImageSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useSceneProgress(sceneId)
  const { draw } = useImageSequence(sceneId, sequence)

  useEffect(() => {
    if (!sequence) return

    return rafScheduler.schedule(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      void draw(canvas, progressRef.current)
    }, 10)
  }, [draw, progressRef, sequence])

  return <canvas ref={canvasRef} className="sequence-canvas" aria-hidden="true" />
}
