import type { OverlayConfig } from '../../types/scene'

interface SceneOverlayProps {
  overlays?: OverlayConfig[]
}

export function SceneOverlay({ overlays = [] }: SceneOverlayProps) {
  if (overlays.length === 0) return null

  return (
    <div className="scene-overlays">
      {overlays.map((overlay, index) => (
        <div
          className={`scene-overlay scene-overlay--${overlay.position ?? 'center'}`}
          data-animation={overlay.animation ?? 'fade-up'}
          key={index}
        >
          {overlay.content}
        </div>
      ))}
    </div>
  )
}
