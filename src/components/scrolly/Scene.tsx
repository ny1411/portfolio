import { useMemo, useRef, type ReactNode } from 'react'
import { CINEMATIC_TEXT_SCENES } from '../../data/cinematicSections'
import type { SceneConfig } from '../../types/scene'
import { CinematicSceneOverlay } from './CinematicSceneOverlay'
import { CinematicSceneHud } from './CinematicSceneHud'
import { useScrollStore } from './scrollStore'
import { SceneOverlay } from './SceneOverlay'
import { usePinnedScene } from './usePinnedScene'
import { VideoScrub } from './VideoScrub'

interface SceneProps {
  config: SceneConfig
  children: ReactNode
  index: number
  onVideoReady?: () => void
  videoMountMode?: 'auto' | 'metadata' | 'none'
}

export function Scene({ config, children, index, onVideoReady, videoMountMode = 'none' }: SceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const store = useScrollStore
  const pinDuration = config.pinDuration ?? 900

  const pinnedOptions = useMemo(
    () => ({
      pinDuration,
      scrub: 2.2,
      onEnter: () => {
        store.getState().setActiveScene(config.id, index)
        config.hooks?.onActivate?.()
      },
      onLeave: () => config.hooks?.onDeactivate?.(),
      onProgress: (progress: number) => {
        const state = store.getState()
        state.setActiveScene(config.id, index)
        state.setSceneProgress(progress)
        config.hooks?.onProgress?.(progress)
      },
    }),
    [config, index, pinDuration, store],
  )

  usePinnedScene(sceneRef, pinnedOptions)

  return (
    <section className="scrolly-scene" id={config.id} ref={sceneRef} aria-label={config.label}>
      {config.videoSrc && videoMountMode !== 'none' ? (
        <VideoScrub
          onReady={onVideoReady}
          preload={videoMountMode}
          sceneId={config.id}
          src={config.videoSrc}
        />
      ) : null}
      {children}
      <CinematicSceneOverlay
        config={CINEMATIC_TEXT_SCENES[config.id]}
        sceneId={config.id}
      />
      <CinematicSceneHud
        label={config.label}
        sceneId={config.id}
      />
      <SceneOverlay overlays={config.overlays} />
    </section>
  )
}
