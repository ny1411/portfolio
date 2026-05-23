import { useEffect } from 'react'
import { useScrollStore } from '../../scrolly/scrollStore'
import { suitEvolutionExperiences } from './suitEvolutionData'
import { useSuitEvolutionStore } from './useSuitEvolutionStore'

const stageCount = suitEvolutionExperiences.length

export function ScrollController() {
  const activeSceneId = useScrollStore((state) => state.activeSceneId)
  const sceneProgress = useScrollStore((state) => state.sceneProgress)
  const scrollVelocity = useScrollStore((state) => state.scrollVelocity)
  const setScrollState = useSuitEvolutionStore((state) => state.setScrollState)

  useEffect(() => {
    const isActive = activeSceneId === 'suit-evolution'
    const progress = isActive ? clamp01(sceneProgress) : 0
    const activeSuitIndex = getActiveSuitIndex(progress)
    const transitionProgress = getTransitionProgress(progress)

    setScrollState({
      activeSuitIndex,
      sectionProgress: progress,
      transitionProgress,
      scrollVelocity,
      isActive,
    })
  }, [activeSceneId, sceneProgress, scrollVelocity, setScrollState])

  return null
}

function getActiveSuitIndex(progress: number): number {
  const index = Math.floor(progress * stageCount)

  return Math.min(stageCount - 1, Math.max(0, index))
}

function getTransitionProgress(progress: number): number {
  if (stageCount <= 1) return 0

  let closestBoundaryDistance = 1
  for (let index = 1; index < stageCount; index++) {
    closestBoundaryDistance = Math.min(closestBoundaryDistance, Math.abs(progress - index / stageCount))
  }

  return 1 - clamp01(closestBoundaryDistance / 0.09)
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}
