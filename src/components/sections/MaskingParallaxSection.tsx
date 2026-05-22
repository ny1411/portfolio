import { useEffect, useRef } from 'react'
import basePortraitUrl from '../../assets/images/portfolio portrait.png'
import maskedPortraitUrl from '../../assets/images/spiderman portfolio portrait.png'
import { getDeviceProfile } from '../../lib/performance'
import { rafScheduler } from '../../lib/rafScheduler'
import { useReducedMotion } from '../scrolly/useReducedMotion'
import { useSceneProgress } from '../scrolly/useSceneProgress'
import {
  HOVER_LERP,
  MOBILE_INTERACTION_LERP_OUT,
  MOBILE_REVEAL_LERP_OUT,
  REDUCED_MOTION_PROGRESS,
  REVEAL_LERP_IN,
  REVEAL_LERP_OUT,
  SCENE_ID,
  SCROLL_LERP,
} from './masking-parallax/constants'
import { applyHeroVariables, getHeroGeometry } from './masking-parallax/geometry'
import { clamp, damp, length } from './masking-parallax/math'
import { createMotionState, updateMotionState } from './masking-parallax/motion'
import { createSvgCache, updateSvgReveal, type SvgCache } from './masking-parallax/svgReveal'
import type { MotionState, Point, ViewportSnapshot } from './masking-parallax/types'
import { getCenteredPortraitFrame, getViewportSnapshot } from './masking-parallax/viewport'

export function MaskingParallaxSection() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const revealSvgRef = useRef<SVGSVGElement>(null)
  const revealLayerRef = useRef<SVGGElement>(null)
  const revealImageRef = useRef<SVGImageElement>(null)
  const blobCorePathRef = useRef<SVGPathElement>(null)
  const blobFeatherPathRef = useRef<SVGPathElement>(null)
  const svgCacheRef = useRef<SvgCache>(createSvgCache())
  const viewportRef = useRef<ViewportSnapshot>(getViewportSnapshot())
  const pointerTargetRef = useRef<Point>({ x: 0, y: 0 })
  const pointerHoverTargetRef = useRef(false)
  const touchActiveTargetRef = useRef(false)
  const activePointerIdRef = useRef<number | null>(null)
  const motionRef = useRef<MotionState>(createMotionState())
  const hoverMotionRef = useRef(0)
  const revealMotionRef = useRef(0)
  const progressMotionRef = useRef(0)
  const progressRef = useSceneProgress(SCENE_ID)
  const reducedMotion = useReducedMotion()
  const isVisibleRef = useRef(true)

  const profile = getDeviceProfile()
  const featherStdDev = profile.tier === 'low' ? '1.5' : profile.isLowPower ? '2.5' : '4.5'

  useEffect(() => {
    const updateViewport = () => {
      viewportRef.current = getViewportSnapshot()
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting },
      { threshold: 0 }
    )
    observer.observe(scene)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updatePointerTarget = (event: PointerEvent, viewport: ViewportSnapshot) => {
      const frame = getCenteredPortraitFrame(viewport)
      const x = clamp(event.clientX, frame.x, frame.x + frame.width)
      const y = clamp(event.clientY, frame.y, frame.y + frame.height)

      pointerTargetRef.current = {
        x: clamp((x - (frame.x + frame.width * 0.5)) / (frame.width * 0.5), -1, 1),
        y: clamp((y - (frame.y + frame.height * 0.5)) / (frame.height * 0.5), -1, 1),
      }
      motionRef.current.lastPointerTime = performance.now()

      return (
        event.clientX >= frame.x &&
        event.clientX <= frame.x + frame.width &&
        event.clientY >= frame.y &&
        event.clientY <= frame.y + frame.height
      )
    }

    const handlePointerDown = (event: PointerEvent) => {
      const viewport = viewportRef.current
      if (viewport.pointerFine && !viewport.mobile) return

      const startedInsidePortrait = updatePointerTarget(event, viewport)
      touchActiveTargetRef.current = startedInsidePortrait
      activePointerIdRef.current = startedInsidePortrait ? event.pointerId : null
    }

    const handlePointerMove = (event: PointerEvent) => {
      const viewport = viewportRef.current
      if (!viewport.pointerFine || viewport.mobile) {
        if (activePointerIdRef.current !== event.pointerId) return

        updatePointerTarget(event, viewport)
        return
      }

      const hoveringPortrait = updatePointerTarget(event, viewport)
      pointerHoverTargetRef.current = hoveringPortrait
      if (!hoveringPortrait) pointerTargetRef.current = { x: 0, y: 0 }
    }

    const resetPointer = () => {
      pointerTargetRef.current = { x: 0, y: 0 }
      pointerHoverTargetRef.current = false
      touchActiveTargetRef.current = false
      activePointerIdRef.current = null
      motionRef.current.lastPointerTime = performance.now()
    }

    const releaseTouchPointer = (event: PointerEvent) => {
      const viewport = viewportRef.current
      if (viewport.pointerFine && !viewport.mobile) {
        resetPointer()
        return
      }

      if (activePointerIdRef.current !== null && activePointerIdRef.current !== event.pointerId) return

      touchActiveTargetRef.current = false
      activePointerIdRef.current = null
      motionRef.current.lastPointerTime = performance.now()
    }

    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', releaseTouchPointer)
    window.addEventListener('pointercancel', releaseTouchPointer)
    window.addEventListener('pointerleave', resetPointer)
    window.addEventListener('blur', resetPointer)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', releaseTouchPointer)
      window.removeEventListener('pointercancel', releaseTouchPointer)
      window.removeEventListener('pointerleave', resetPointer)
      window.removeEventListener('blur', resetPointer)
    }
  }, [])

  useEffect(() => {
    const scene = sceneRef.current
    const revealSvg = revealSvgRef.current
    const revealLayer = revealLayerRef.current
    const revealImage = revealImageRef.current
    const blobCorePath = blobCorePathRef.current
    const blobFeatherPath = blobFeatherPathRef.current
    if (!scene || !revealSvg || !revealLayer || !revealImage || !blobCorePath || !blobFeatherPath) return

    return rafScheduler.schedule((time) => {
      const isActiveScene = progressRef.current > 0 && progressRef.current < 1
      if (!isVisibleRef.current && !isActiveScene) return

      const viewport = viewportRef.current
      const interactionTarget =
        viewport.pointerFine && !viewport.mobile
          ? pointerHoverTargetRef.current
          : touchActiveTargetRef.current

      hoverMotionRef.current = damp(
        hoverMotionRef.current,
        interactionTarget ? 1 : 0,
        interactionTarget || !viewport.mobile ? HOVER_LERP : MOBILE_INTERACTION_LERP_OUT,
      )

      const pointerTarget =
        reducedMotion || hoverMotionRef.current < 0.02
          ? { x: 0, y: 0 }
          : pointerTargetRef.current

      const motion = updateMotionState(motionRef.current, pointerTarget, time, reducedMotion)
      const touchRevealBase = touchActiveTargetRef.current ? 0.58 : 0
      const dynamicReveal =
        viewport.mobile && !touchActiveTargetRef.current
          ? 0
          : motion.speed * 1.9 + length(motion.delta) * 9
      const revealTarget =
        reducedMotion
          ? 0
          : hoverMotionRef.current *
            clamp((viewport.mobile ? touchRevealBase : 0) + dynamicReveal, 0, 1)
      revealMotionRef.current = damp(
        revealMotionRef.current,
        revealTarget,
        revealTarget > revealMotionRef.current
          ? REVEAL_LERP_IN
          : viewport.mobile
            ? MOBILE_REVEAL_LERP_OUT
            : REVEAL_LERP_OUT,
      )

      progressMotionRef.current = reducedMotion
        ? REDUCED_MOTION_PROGRESS
        : damp(progressMotionRef.current, progressRef.current, SCROLL_LERP)

      const geometry = getHeroGeometry({
        pointer: motion.smooth,
        progress: progressMotionRef.current,
        revealAmount: revealMotionRef.current,
        reducedMotion,
        viewport,
      })

      applyHeroVariables(scene, geometry.variables)
      
      const revealSettled = revealMotionRef.current < 0.005
      const motionSettled = hoverMotionRef.current < 0.01

      if (!revealSettled || !motionSettled) {
        updateSvgReveal({
          blobCorePath,
          blobFeatherPath,
          svgCacheRef,
          geometry,
          motion,
          revealAmount: revealMotionRef.current,
          revealLayer,
          reducedMotion,
          revealImage,
          revealSvg,
          time,
          viewport,
        })
      }
    }, 12)
  }, [progressRef, reducedMotion])

  return (
    <div
      className={`masking-parallax-scene${reducedMotion ? ' is-reduced-motion' : ''}`}
      ref={sceneRef}
      aria-label="Cinematic masked portrait reveal"
    >
      <div className="masking-parallax-stage">
        <div className="masking-parallax-depth masking-parallax-depth--backdrop" aria-hidden="true" />
        <div className="masking-parallax-depth--atmosphere-wrap" aria-hidden="true">
          <div className="masking-parallax-depth masking-parallax-depth--atmosphere" />
        </div>

        <div className="masking-parallax-plate-mask" aria-hidden="true">
          <div className="masking-parallax-plate masking-parallax-plate--base">
            <img src={basePortraitUrl} alt="" decoding="async" draggable={false} />
          </div>
        </div>

        <svg
          className="masking-parallax-reveal-svg"
          ref={revealSvgRef}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id="masking-blob-feather" x="-28%" y="-28%" width="156%" height="156%">
              <feGaussianBlur stdDeviation={featherStdDev} />
            </filter>
            <mask id="masking-blob-alpha" maskUnits="userSpaceOnUse">
              <path ref={blobFeatherPathRef} fill="#fff" opacity="0.38" filter="url(#masking-blob-feather)" />
              <path ref={blobCorePathRef} fill="#fff" opacity="0.96" />
            </mask>
          </defs>
          <g className="masking-parallax-reveal-layer" ref={revealLayerRef} mask="url(#masking-blob-alpha)">
            <image
              className="masking-parallax-reveal-image"
              ref={revealImageRef}
              href={maskedPortraitUrl}
              preserveAspectRatio="xMidYMid slice"
            />
            <rect className="masking-parallax-reveal-grade" x="0" y="0" width="100%" height="100%" />
          </g>
        </svg>

        <div className="masking-parallax-shared-grade" aria-hidden="true" />
        <div className="masking-parallax-vignette" aria-hidden="true" />
      </div>
    </div>
  )
}
