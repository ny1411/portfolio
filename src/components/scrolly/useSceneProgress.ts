import { useEffect, useRef } from 'react'
import { useScrollStore } from './scrollStore'

export function useSceneProgress(sceneId: string) {
  const progressRef = useRef(0)

  useEffect(() => {
    return useScrollStore.subscribe((state) => {
      if (state.activeSceneId === sceneId) {
        progressRef.current = state.sceneProgress
      }
    })
  }, [sceneId])

  return progressRef
}
