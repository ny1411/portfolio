import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenisInstance: Lenis | null = null
let tickerCallback: ((time: number) => void) | null = null

export function createLenis(): Lenis {
  if (lenisInstance) return lenisInstance

  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: 1.5,
  })

  lenis.on('scroll', ScrollTrigger.update)
  tickerCallback = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(tickerCallback)
  gsap.ticker.lagSmoothing(0)

  lenisInstance = lenis
  return lenis
}

export function getLenis(): Lenis | null {
  return lenisInstance
}

export function destroyLenis(): void {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback)
    tickerCallback = null
  }

  lenisInstance?.destroy()
  lenisInstance = null
}
