import { useEffect, useRef, useState, type RefObject } from 'react'
import { rafScheduler } from '../../lib/rafScheduler'
import { useSceneProgress } from './useSceneProgress'
import { useReducedMotion } from './useReducedMotion'

interface VideoScrubProps {
  onReady?: () => void
  preload?: 'auto' | 'metadata'
  sceneId: string
  src: string
}

export function VideoScrub({
  onReady,
  preload = 'metadata',
  sceneId,
  src,
}: VideoScrubProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const didNotifyReadyRef = useRef(false)
  const lastSeekAtRef = useRef(0)
  const progressRef = useSceneProgress(sceneId)
  const reducedMotion = useReducedMotion()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    return rafScheduler.schedule(() => {
      const video = videoRef.current
      if (!video || !Number.isFinite(video.duration)) return
      seekVideoToProgress(video, reducedMotion ? 0.5 : progressRef.current, {
        canInterruptSeek: false,
        lastSeekAtRef,
        minSeekIntervalMs: 120,
      })
    }, 5)
  }, [progressRef, reducedMotion])

  const handleVideoReady = () => {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return

    seekVideoToProgress(video, reducedMotion ? 0.5 : progressRef.current, {
      canInterruptSeek: false,
      lastSeekAtRef,
      minSeekIntervalMs: 120,
    })
    setIsReady(true)

    if (!didNotifyReadyRef.current) {
      didNotifyReadyRef.current = true
      onReady?.()
    }
  }

  const handleMetadataReady = () => {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return

    seekVideoToProgress(video, reducedMotion ? 0.5 : progressRef.current, {
      canInterruptSeek: false,
      lastSeekAtRef,
      minSeekIntervalMs: 120,
    })
  }

  return (
    <video
      ref={videoRef}
      className={`scrub-media scrub-video ${isReady ? 'is-ready' : 'is-loading'}`}
      muted
      playsInline
      preload={preload}
      src={src}
      aria-hidden="true"
      onLoadStart={() => setIsReady(false)}
      onCanPlay={handleVideoReady}
      onLoadedData={handleVideoReady}
      onLoadedMetadata={handleMetadataReady}
      onSeeked={handleVideoReady}
    />
  )
}

interface SeekOptions {
  canInterruptSeek: boolean
  lastSeekAtRef: RefObject<number>
  minSeekIntervalMs: number
}

function seekVideoToProgress(
  video: HTMLVideoElement,
  progress: number,
  options: SeekOptions,
): void {
  const duration = video.duration
  if (!Number.isFinite(duration) || duration <= 0) return

  const targetTime = Math.min(
    Math.max(0, duration * Math.min(1, Math.max(0, progress))),
    Math.max(0, duration - 0.05),
  )

  if (Math.abs(video.currentTime - targetTime) <= 0.025) return
  if (!options.canInterruptSeek && video.seeking) return

  const now = performance.now()
  if (now - options.lastSeekAtRef.current < options.minSeekIntervalMs) return

  options.lastSeekAtRef.current = now
  video.currentTime = targetTime
}
