import { create } from 'zustand'

interface ScrollState {
  globalProgress: number
  activeSceneId: string
  activeSceneIndex: number
  sceneProgress: number
  scrollVelocity: number
  isScrolling: boolean
  direction: 'up' | 'down'
  setGlobalProgress: (progress: number) => void
  setActiveScene: (id: string, index: number) => void
  setSceneProgress: (progress: number) => void
  setScrollVelocity: (velocity: number) => void
  setIsScrolling: (isScrolling: boolean) => void
  setDirection: (direction: 'up' | 'down') => void
}

export const useScrollStore = create<ScrollState>((set) => ({
  globalProgress: 0,
  activeSceneId: 'hero',
  activeSceneIndex: 0,
  sceneProgress: 0,
  scrollVelocity: 0,
  isScrolling: false,
  direction: 'down',
  setGlobalProgress: (globalProgress) => set({ globalProgress }),
  setActiveScene: (activeSceneId, activeSceneIndex) =>
    set({ activeSceneId, activeSceneIndex }),
  setSceneProgress: (sceneProgress) => set({ sceneProgress }),
  setScrollVelocity: (scrollVelocity) => set({ scrollVelocity }),
  setIsScrolling: (isScrolling) => set({ isScrolling }),
  setDirection: (direction) => set({ direction }),
}))
