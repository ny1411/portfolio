import { create } from 'zustand'

interface HoverVector {
  x: number
  y: number
}

interface SuitEvolutionState {
  activeSuitIndex: number
  sectionProgress: number
  transitionProgress: number
  scrollVelocity: number
  hoverVector: HoverVector
  isActive: boolean
  setHoverVector: (hoverVector: HoverVector) => void
  setScrollState: (state: {
    activeSuitIndex: number
    sectionProgress: number
    transitionProgress: number
    scrollVelocity: number
    isActive: boolean
  }) => void
}

export const useSuitEvolutionStore = create<SuitEvolutionState>((set) => ({
  activeSuitIndex: 0,
  sectionProgress: 0,
  transitionProgress: 0,
  scrollVelocity: 0,
  hoverVector: { x: 0, y: 0 },
  isActive: false,
  setHoverVector: (hoverVector) => set({ hoverVector }),
  setScrollState: (state) => set(state),
}))
