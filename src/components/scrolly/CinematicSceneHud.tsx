import { useEffect, useRef } from 'react'
import { rafScheduler } from '../../lib/rafScheduler'
import { useSceneProgress } from './useSceneProgress'

interface CinematicSceneHudProps {
  sceneId: string
  label: string
  leftLabel?: string
  footerLeft?: string
  footerMiddle?: string
  footerRight?: string
}

export function CinematicSceneHud({
  sceneId,
  label,
  leftLabel,
  footerLeft,
  footerMiddle = 'Progress sync',
  footerRight = 'Scroll',
}: CinematicSceneHudProps) {
  const progressRef = useSceneProgress(sceneId)
  const progressFillRef = useRef<HTMLDivElement | null>(null)
  const seqReadoutRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    return rafScheduler.schedule(() => {
      const progress = progressRef.current
      const progressPercent = Math.round(progress * 100)

      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleX(${progress})`
      }

      if (seqReadoutRef.current) {
        seqReadoutRef.current.textContent = `VIDEO ${String(progressPercent).padStart(3, '0')}%`
      }
    }, 9)
  }, [progressRef])

  return (
    <>
      <div className="cinematic-scene-hud cinematic-scene-hud--top-left">
        <span>{leftLabel ?? `${label} relay`}</span>
      </div>
      <div className="cinematic-scene-hud cinematic-scene-hud--top-right">
        <span className="cinematic-scene-hud__readout" ref={seqReadoutRef}>
          VIDEO 000%
        </span>
      </div>

      <div className="cinematic-footer-loader" aria-hidden="true">
        <div ref={progressFillRef} />
      </div>

      <div className="cinematic-scene-footer" aria-hidden="true">
        <span>{footerLeft ?? `${label} video scrub`}</span>
        <span>{footerMiddle}</span>
        <span>{footerRight}</span>
      </div>
    </>
  )
}
