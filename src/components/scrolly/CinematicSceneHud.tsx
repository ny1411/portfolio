import { useEffect, useMemo, useRef } from 'react'
import { getFrameCount, getFrameIndex } from '../../lib/sequenceLoader'
import { rafScheduler } from '../../lib/rafScheduler'
import type { SequenceConfig } from '../../types/sequence'
import { useSceneProgress } from './useSceneProgress'

interface CinematicSceneHudProps {
  sceneId: string
  label: string
  sequence?: SequenceConfig
  leftLabel?: string
  footerLeft?: string
  footerMiddle?: string
  footerRight?: string
}

export function CinematicSceneHud({
  sceneId,
  label,
  sequence,
  leftLabel,
  footerLeft,
  footerMiddle = 'Progress sync',
  footerRight = 'Scroll',
}: CinematicSceneHudProps) {
  const progressRef = useSceneProgress(sceneId)
  const progressFillRef = useRef<HTMLDivElement | null>(null)
  const seqReadoutRef = useRef<HTMLSpanElement | null>(null)

  const totalFrames = useMemo(() => (sequence ? getFrameCount(sequence) : 100), [sequence])

  useEffect(() => {
    return rafScheduler.schedule(() => {
      const progress = progressRef.current
      const sequenceNumber = sequence
        ? getFrameIndex(sequence, progress) - sequence.startIndex + 1
        : Math.round(progress * (totalFrames - 1)) + 1

      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleX(${progress})`
      }

      if (seqReadoutRef.current) {
        seqReadoutRef.current.textContent = `SEQ ${String(sequenceNumber).padStart(
          3,
          '0',
        )} / ${totalFrames}`
      }
    }, 9)
  }, [progressRef, sequence, totalFrames])

  return (
    <>
      <div className="cinematic-scene-hud cinematic-scene-hud--top-left">
        <span>{leftLabel ?? `${label} relay`}</span>
      </div>
      <div className="cinematic-scene-hud cinematic-scene-hud--top-right">
        <span className="cinematic-scene-hud__readout" ref={seqReadoutRef}>
          SEQ 001 / {totalFrames}
        </span>
      </div>

      <div className="cinematic-footer-loader" aria-hidden="true">
        <div ref={progressFillRef} />
      </div>

      <div className="cinematic-scene-footer" aria-hidden="true">
        <span>{footerLeft ?? `${label} frames nominal`}</span>
        <span>{footerMiddle}</span>
        <span>{footerRight}</span>
      </div>
    </>
  )
}
