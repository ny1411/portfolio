import { useMemo, useRef, type ReactNode } from 'react'
import type { SceneConfig } from '../../types/scene'
import { useScrollStore } from './scrollStore'
import { SceneOverlay } from './SceneOverlay'
import { usePinnedScene } from './usePinnedScene'

interface SceneProps {
  config: SceneConfig
  children: ReactNode
  index: number
}

export function Scene({ config, children, index }: SceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const store = useScrollStore
  const pinDuration = config.pinDuration ?? 300

  const pinnedOptions = useMemo(
    () => ({
      pinDuration,
      scrub: 1,
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
      {children}
      <SceneOverlay overlays={config.overlays} />
    </section>
  )
}
