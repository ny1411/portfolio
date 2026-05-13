import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clamp,
  opacityIn,
  opacityOut,
  visibleInWindow,
} from '../../lib/cinematicTiming'
import { preloadCinematicFrames, getFrameIndex } from '../../lib/sequenceLoader'
import {
  SPIDER_SCENE_ID,
  SPIDER_THEME,
} from '../../data/spiderman'
import { useScrollStore } from '../scrolly/scrollStore'
import { CinematicCard } from '../scrolly/CinematicCard'
import { CinematicRevealScene } from '../scrolly/CinematicRevealScene'
import { CinematicSceneHud } from '../scrolly/CinematicSceneHud'
import { useImageSequence } from '../scrolly/useImageSequence'
import { useReducedMotion } from '../scrolly/useReducedMotion'
import {
  useScrollProgress,
  type ScrollProgressMeta,
} from '../scrolly/useScrollProgress'

interface SpiderVerseRevealProps {
  sceneIndex?: number
}

export function SpiderVerseReveal({ sceneIndex = 1 }: SpiderVerseRevealProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const headingPrimaryRef = useRef<HTMLHeadingElement | null>(null)
  const headingSecondaryRef = useRef<HTMLHeadingElement | null>(null)
  const outroRef = useRef<HTMLDivElement | null>(null)
  const lastFrameRef = useRef(-1)
  const pendingFrameRef = useRef<number | null>(null)
  const previousVisibleIdsRef = useRef('')

  const [loaded, setLoaded] = useState(false)
  const [visibleBeatIds, setVisibleBeatIds] = useState<Set<string>>(new Set())
  const reducedMotion = useReducedMotion()
  const { draw } = useImageSequence(SPIDER_SCENE_ID, SPIDER_THEME.sequence)

  useEffect(() => {
    let cancelled = false
    preloadCinematicFrames(SPIDER_SCENE_ID, SPIDER_THEME.sequence)
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const updateHeadings = useCallback((progress: number) => {
    const [primaryStart, primaryEnd] = SPIDER_THEME.headings.primaryFade
    const [secondaryStart, secondaryEnd] = SPIDER_THEME.headings.secondaryFade
    const primaryOpacity = opacityOut(progress, primaryStart, primaryEnd)
    const secondaryOpacity = opacityIn(progress, secondaryStart, secondaryEnd)

    if (headingPrimaryRef.current) {
      headingPrimaryRef.current.style.opacity = String(primaryOpacity)
      headingPrimaryRef.current.style.transform = `translateY(${(1 - primaryOpacity) * -10}px)`
    }

    if (headingSecondaryRef.current) {
      headingSecondaryRef.current.style.opacity = String(secondaryOpacity)
      headingSecondaryRef.current.style.transform = `translateY(${(1 - secondaryOpacity) * 12}px)`
    }
  }, [])

  const updateOutro = useCallback((progress: number) => {
    const outroOpacity = clamp(
      (progress - SPIDER_THEME.outro.show) /
        (SPIDER_THEME.outro.full - SPIDER_THEME.outro.show),
    )

    if (outroRef.current) {
      outroRef.current.style.opacity = String(outroOpacity)
      outroRef.current.style.transform = `translateY(${(1 - outroOpacity) * 14}px)`
    }
  }, [])

  const updateVisibleBeats = useCallback((progress: number) => {
    const nextVisible = new Set<string>()
    for (const beat of SPIDER_THEME.beats) {
      if (visibleInWindow(progress, beat.show, beat.hide)) nextVisible.add(beat.id)
    }

    const nextIds = [...nextVisible].sort().join(',')
    if (nextIds === previousVisibleIdsRef.current) return

    previousVisibleIdsRef.current = nextIds
    setVisibleBeatIds(nextVisible)
  }, [])

  const handleProgress = useCallback(
    (progress: number, meta: ScrollProgressMeta) => {
      const visualProgress = reducedMotion ? 0.6 : progress
      const frameIndex = getFrameIndex(SPIDER_THEME.sequence, visualProgress)

      if (meta.isActive) {
        const store = useScrollStore.getState()
        store.setActiveScene(SPIDER_SCENE_ID, sceneIndex)
        store.setSceneProgress(progress)
      }

      if (
        loaded &&
        frameIndex !== lastFrameRef.current &&
        frameIndex !== pendingFrameRef.current &&
        canvasRef.current
      ) {
        pendingFrameRef.current = frameIndex
        void draw(canvasRef.current, visualProgress)
          .then((didDraw) => {
            if (didDraw) lastFrameRef.current = frameIndex
          })
          .finally(() => {
            if (pendingFrameRef.current === frameIndex) pendingFrameRef.current = null
          })
      }

      updateHeadings(visualProgress)
      updateOutro(progress)
      updateVisibleBeats(progress)
    },
    [
      draw,
      loaded,
      reducedMotion,
      sceneIndex,
      updateHeadings,
      updateOutro,
      updateVisibleBeats,
    ],
  )

  useScrollProgress(sectionRef, handleProgress)

  useEffect(() => {
    if (!loaded || !canvasRef.current) return
    void draw(canvasRef.current, 0)
  }, [draw, loaded])

  return (
    <CinematicRevealScene
      className="spider-cinematic"
      id={SPIDER_SCENE_ID}
      label="Spider-Man cinematic reveal"
      ref={sectionRef}
    >
      <canvas className="spider-cinematic__canvas" ref={canvasRef} aria-hidden="true" />

      <div className="spider-cinematic__wash" aria-hidden="true" />
      <div className="spider-cinematic__web" aria-hidden="true" />

      <CinematicSceneHud
        footerLeft="Web fluid nominal"
        footerMiddle="Responsibility sync"
        label="Spider-Verse"
        leftLabel="Queens relay"
        sceneId={SPIDER_SCENE_ID}
        sequence={SPIDER_THEME.sequence}
      />

      <div className="spider-cinematic__heading">
        <p className="spider-cinematic__eyebrow">Spider-Verse // Responsibility Protocol</p>
        <div className="spider-cinematic__heading-stack">
          <h2 className="spider-cinematic__heading-primary" ref={headingPrimaryRef}>
            {SPIDER_THEME.headings.primary}
          </h2>
          <h2 className="spider-cinematic__heading-secondary" ref={headingSecondaryRef}>
            {SPIDER_THEME.headings.secondary}
          </h2>
        </div>
        <p>
          Queens goes quiet. A single mask rises between skyline glass and
          siren light.
        </p>
      </div>

      <div className="cinematic-beat-layer cinematic-beat-layer--desktop">
        {SPIDER_THEME.beats.map((beat) => (
          <CinematicCard
            card={beat}
            key={beat.id}
            visible={visibleBeatIds.has(beat.id)}
          />
        ))}
      </div>

      <div className="cinematic-beat-rail">
        {SPIDER_THEME.beats.map((beat) => (
          <CinematicCard
            card={beat}
            key={beat.id}
            variant="mobile"
            visible={visibleBeatIds.has(beat.id)}
          />
        ))}
      </div>

      <div className="spider-cinematic__outro" ref={outroRef}>
        <span>{SPIDER_THEME.outro.label}</span>
        <a href={SPIDER_THEME.outro.href}>{SPIDER_THEME.outro.cta}</a>
      </div>

      {!loaded && (
        <div className="spider-cinematic__loader">
          <span>Loading Spider-Verse frames</span>
        </div>
      )}
    </CinematicRevealScene>
  )
}
