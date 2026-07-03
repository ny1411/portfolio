import type { PointerEvent } from 'react'
import { HUDOverlay } from './suit-evolution/HUDOverlay'
import { ParticleBackground } from './suit-evolution/ParticleBackground'
import { ScrollController } from './suit-evolution/ScrollController'
import { SuitScene } from './suit-evolution/SuitScene'
import { useScrollStore } from '../scrolly/scrollStore'
import { useSuitEvolutionStore } from './suit-evolution/useSuitEvolutionStore'

export function SuitEvolutionSection() {
  const isActive = useScrollStore((state) => state.activeSceneId === 'suit-evolution')
  const setHoverVector = useSuitEvolutionStore((state) => state.setHoverVector)

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2

    setHoverVector({
      x: Math.min(1, Math.max(-1, x)),
      y: Math.min(1, Math.max(-1, y)),
    })
  }

  return (
    <div
      className="suit-evolution"
      onPointerLeave={() => setHoverVector({ x: 0, y: 0 })}
      onPointerMove={handlePointerMove}
      role="region"
      aria-label="Suit Evolution"
    >
      <ScrollController />
      <ParticleBackground />
      <div className="suit-evolution__atmosphere" aria-hidden="true" />
      <div className="suit-evolution__grid" aria-hidden="true" />
      <div className="suit-evolution__streak suit-evolution__streak--one" aria-hidden="true" />
      <div className="suit-evolution__streak suit-evolution__streak--two" aria-hidden="true" />
      <HUDOverlay />
      <SuitScene isActive={isActive} />
    </div>
  )
}
