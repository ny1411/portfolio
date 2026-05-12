import { useEffect } from 'react'
import { createLenis, destroyLenis } from '../../lib/lenis'
import { ScrollTrigger } from '../../lib/gsap'
import { useScrollStore } from './scrollStore'

export function useScrollSync(): void {
  useEffect(() => {
    const lenis = createLenis()
    const store = useScrollStore.getState()

    const onScroll = ({ velocity, direction }: { velocity: number; direction: number }) => {
      store.setScrollVelocity(velocity)
      store.setDirection(direction === -1 ? 'up' : 'down')
      store.setIsScrolling(Math.abs(velocity) > 0.01)
    }

    lenis.on('scroll', onScroll)
    ScrollTrigger.refresh()

    return () => {
      lenis.off('scroll', onScroll)
      destroyLenis()
    }
  }, [])
}
