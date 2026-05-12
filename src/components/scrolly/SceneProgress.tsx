import { useScrollStore } from './scrollStore'

export function SceneProgress() {
  const progress = useScrollStore((state) => state.sceneProgress)

  return (
    <div className="scene-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
