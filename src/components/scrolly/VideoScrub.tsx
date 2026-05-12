import { useEffect, useRef } from 'react'
import { rafScheduler } from '../../lib/rafScheduler'
import { useSceneProgress } from './useSceneProgress'

interface VideoScrubProps {
  sceneId: string
  src: string
}

export function VideoScrub({ sceneId, src }: VideoScrubProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useSceneProgress(sceneId)

  useEffect(() => {
    return rafScheduler.schedule(() => {
      const video = videoRef.current
      if (!video || !Number.isFinite(video.duration)) return
      video.currentTime = video.duration * progressRef.current
    }, 5)
  }, [progressRef])

  return <video ref={videoRef} className="sequence-canvas" muted playsInline preload="metadata" src={src} />
}
