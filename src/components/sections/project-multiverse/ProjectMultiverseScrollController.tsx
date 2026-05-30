import { useEffect, useRef } from 'react'
import { useScrollStore } from '../../scrolly/scrollStore'
import { useProjectMultiverseStore } from './useProjectMultiverseStore'

const FOCUS_RESET_SCROLL_DISTANCE = 0.008
const TRAVERSAL_SCROLL_THRESHOLD = 0.00004

export function ProjectMultiverseScrollController() {
  const activeSceneId = useScrollStore((state) => state.activeSceneId)
  const sceneProgress = useScrollStore((state) => state.sceneProgress)
  const scrollVelocity = useScrollStore((state) => state.scrollVelocity)
  const focusedPortalId = useProjectMultiverseStore((state) => state.focusedPortalId)
  const hoveredPortalId = useProjectMultiverseStore((state) => state.hoveredPortalId)
  const setScrollState = useProjectMultiverseStore((state) => state.setScrollState)
  const deactivatePortal = useProjectMultiverseStore((state) => state.deactivatePortal)
  const beginPortalTraversal = useProjectMultiverseStore((state) => state.beginPortalTraversal)
  const previousProgressRef = useRef(0)

  useEffect(() => {
    const isActive = activeSceneId === 'project-multiverse'
    const progress = isActive ? clamp01(sceneProgress) : 0
    const movedDuringFocus =
      isActive &&
      focusedPortalId !== null &&
      Math.abs(progress - previousProgressRef.current) > FOCUS_RESET_SCROLL_DISTANCE
    const movedThroughHoveredPortal =
      isActive &&
      hoveredPortalId !== null &&
      focusedPortalId === null &&
      Math.abs(progress - previousProgressRef.current) > TRAVERSAL_SCROLL_THRESHOLD

    if (movedDuringFocus) deactivatePortal()
    if (movedThroughHoveredPortal) beginPortalTraversal()

    setScrollState({
      sceneProgress: progress,
      scrollVelocity: isActive ? scrollVelocity : 0,
      isActive,
    })
    previousProgressRef.current = progress
  }, [
    activeSceneId,
    beginPortalTraversal,
    deactivatePortal,
    focusedPortalId,
    hoveredPortalId,
    sceneProgress,
    scrollVelocity,
    setScrollState,
  ])

  return null
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}
