import { lazy, Suspense } from 'react'
import { useScrollStore } from '../scrolly/scrollStore'
import { ProjectMultiverseOverlay } from './project-multiverse/ProjectMultiverseOverlay'
import { ProjectMultiverseScrollController } from './project-multiverse/ProjectMultiverseScrollController'

const ProjectMultiverseScene = lazy(() =>
  import('./project-multiverse/ProjectMultiverseScene').then((module) => ({
    default: module.ProjectMultiverseScene,
  })),
)

export function ProjectMultiverseSection() {
  const activeSceneId = useScrollStore((state) => state.activeSceneId)
  const isActive = activeSceneId === 'project-multiverse'

  return (
    <div className="project-multiverse" role="region" aria-label="Project Multiverse">
      <ProjectMultiverseScrollController />
      <div className="project-multiverse__nebula" aria-hidden="true" />
      <div className="project-multiverse__halftone" aria-hidden="true" />
      <Suspense fallback={null}>
        <ProjectMultiverseScene isActive={isActive} />
      </Suspense>
      <ProjectMultiverseOverlay />
    </div>
  )
}
