import { useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'

interface PinnedSceneOptions {
  pinDuration: number
  scrub: number | boolean
  onProgress: (progress: number) => void
  onEnter?: () => void
  onLeave?: () => void
}

export function usePinnedScene(
  triggerRef: RefObject<HTMLElement | null>,
  options: PinnedSceneOptions,
): void {
  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger,
        start: 'top top',
        end: `+=${options.pinDuration}vh`,
        pin: true,
        scrub: options.scrub,
        onEnter: options.onEnter,
        onEnterBack: options.onEnter,
        onLeave: options.onLeave,
        onLeaveBack: options.onLeave,
        onUpdate: (self) => options.onProgress(self.progress),
      })
    }, trigger)

    return () => context.revert()
  }, [options, triggerRef])
}
