import { create } from 'zustand'

export type ProjectMultiverseMode =
  | 'guided'
  | 'exploring'
  | 'traversing'
  | 'focused'
  | 'returning'

export interface PortalFrameMotion {
  portalId: string | null
  traversalDepth: number
  traversalBlend: number
  immersion: number
  scrollEnergy: number
  focusProgress: number
}

// Frame-driven values stay outside React state so animation does not schedule renders.
export const portalFrameMotion: PortalFrameMotion = {
  portalId: null,
  traversalDepth: 0,
  traversalBlend: 0,
  immersion: 0,
  scrollEnergy: 0,
  focusProgress: 0,
}

export function resetPortalFrameMotion(): void {
  portalFrameMotion.portalId = null
  portalFrameMotion.traversalDepth = 0
  portalFrameMotion.traversalBlend = 0
  portalFrameMotion.immersion = 0
  portalFrameMotion.scrollEnergy = 0
  portalFrameMotion.focusProgress = 0
}

interface ProjectMultiverseState {
  mode: ProjectMultiverseMode
  focusedPortalId: string | null
  hoveredPortalId: string | null
  sceneProgress: number
  scrollVelocity: number
  isActive: boolean
  setScrollState: (state: {
    sceneProgress: number
    scrollVelocity: number
    isActive: boolean
  }) => void
  focusPortal: (id: string) => void
  hoverPortal: (id: string | null) => void
  beginPortalTraversal: () => void
  deactivatePortal: () => void
  beginExploration: () => void
  requestGuidedReturn: () => void
  completeGuidedReturn: () => void
}

export const useProjectMultiverseStore = create<ProjectMultiverseState>((set) => ({
  mode: 'guided',
  focusedPortalId: null,
  hoveredPortalId: null,
  sceneProgress: 0,
  scrollVelocity: 0,
  isActive: false,
  setScrollState: ({ sceneProgress, scrollVelocity, isActive }) =>
    set((state) => {
      if (!isActive) {
        return {
          sceneProgress: 0,
          scrollVelocity: 0,
          isActive: false,
          focusedPortalId: null,
          hoveredPortalId: null,
          mode: 'guided',
        }
      }

      return {
        sceneProgress,
        scrollVelocity,
        isActive,
        mode: state.mode,
      }
    }),
  focusPortal: (focusedPortalId) => set({ focusedPortalId, mode: 'focused' }),
  hoverPortal: (hoveredPortalId) =>
    set((state) => ({
      hoveredPortalId,
      mode:
        hoveredPortalId === null && state.mode === 'traversing'
          ? 'returning'
          : state.mode,
    })),
  beginPortalTraversal: () =>
    set((state) =>
      state.focusedPortalId || !state.hoveredPortalId
        ? state
        : { mode: 'traversing' },
    ),
  deactivatePortal: () =>
    set((state) => ({
      focusedPortalId: null,
      hoveredPortalId: null,
      mode: state.isActive ? 'returning' : 'guided',
    })),
  beginExploration: () =>
    set((state) =>
      state.focusedPortalId ? state : { mode: 'exploring' },
    ),
  requestGuidedReturn: () =>
    set((state) =>
      state.mode === 'exploring' || state.mode === 'traversing'
        ? { mode: 'returning' }
        : state,
    ),
  completeGuidedReturn: () =>
    set((state) =>
      state.mode === 'returning' ? { mode: 'guided' } : state,
    ),
}))
