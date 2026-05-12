import type { SceneConfig } from '../../types/scene'
import { useScrollStore } from './scrollStore'

interface SceneNavProps {
  scenes: SceneConfig[]
}

export function SceneNav({ scenes }: SceneNavProps) {
  const activeSceneId = useScrollStore((state) => state.activeSceneId)

  return (
    <nav className="scene-nav" aria-label="Portfolio sections">
      {scenes.map((scene) => (
        <a
          aria-current={activeSceneId === scene.id ? 'true' : undefined}
          aria-label={scene.label}
          href={`#${scene.id}`}
          key={scene.id}
        />
      ))}
    </nav>
  )
}
