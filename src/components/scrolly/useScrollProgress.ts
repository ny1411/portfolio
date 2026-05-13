import { useEffect, useRef, type RefObject } from 'react'
import { clamp } from '../../lib/cinematicTiming'

export interface ScrollProgressMeta {
  rect: DOMRect
  scrollable: number
  isActive: boolean
}

export type ScrollProgressHandler = (
  progress: number,
  meta: ScrollProgressMeta,
) => void

export function getNormalizedSectionProgress(section: HTMLElement): {
  progress: number
  meta: ScrollProgressMeta
} {
  const rect = section.getBoundingClientRect()
  const scrollable = section.offsetHeight - window.innerHeight
  const progress = scrollable <= 0 ? 0 : clamp(-rect.top / scrollable)
  const isActive = rect.top <= 0 && rect.bottom >= window.innerHeight

  return {
    progress,
    meta: {
      rect,
      scrollable,
      isActive,
    },
  }
}

export function useScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
  onProgress?: ScrollProgressHandler,
) {
  const progressRef = useRef(0)
  const tickingRef = useRef(false)
  const onProgressRef = useRef(onProgress)

  useEffect(() => {
    onProgressRef.current = onProgress
  }, [onProgress])

  useEffect(() => {
    const update = () => {
      if (tickingRef.current) return
      tickingRef.current = true

      requestAnimationFrame(() => {
        tickingRef.current = false
        const section = sectionRef.current
        if (!section) return

        const { progress, meta } = getNormalizedSectionProgress(section)
        progressRef.current = progress
        onProgressRef.current?.(progress, meta)
      })
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [sectionRef])

  return progressRef
}
