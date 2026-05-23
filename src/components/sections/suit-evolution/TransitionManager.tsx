import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  PointsMaterial,
  type Group,
} from 'three'
import { useSuitEvolutionStore } from './useSuitEvolutionStore'

export function TransitionManager() {
  const groupRef = useRef<Group>(null)
  const materialRef = useRef<PointsMaterial | null>(null)
  const { geometry, material } = useMemo(() => createTransitionParticles(), [])
  const isCompact = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches,
    [],
  )

  useEffect(() => {
    materialRef.current = material

    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame(({ clock }) => {
    const group = groupRef.current
    const pointsMaterial = materialRef.current
    if (!group || !pointsMaterial) return

    const state = useSuitEvolutionStore.getState()
    const velocityGlow = Math.min(1, Math.abs(state.scrollVelocity) / 4)
    const pulse = state.transitionProgress
    const opacity = state.isActive ? pulse * 0.32 + velocityGlow * 0.6 : 0
    const placement = getTransitionPlacement(isCompact)

    group.visible = opacity > 0.01
    group.position.x = placement.x-0.6
    group.position.y = placement.y
    group.rotation.y = clock.elapsedTime * 0.12 + state.sectionProgress * Math.PI * 0.7
    group.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.04
    group.scale.setScalar(0.82 + pulse * 0.46 + velocityGlow * 0.08)
    pointsMaterial.opacity = opacity
    pointsMaterial.size = 0.008 + pulse * 0.026
  })

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} />
    </group>
  )
}

function getTransitionPlacement(
  isCompact: boolean,
): { x: number; y: number } {
  if (isCompact) return { x: 0.18, y: 0.38 }

  return { x: 2.45, y: 0.05 }
}

function createTransitionParticles(): {
  geometry: BufferGeometry
  material: PointsMaterial
} {
  const geometry = new BufferGeometry()
  const positions = new Float32Array(420 * 3)
  const colors = new Float32Array(420 * 3)
  const palette = [new Color('#38bdf8'), new Color('#fbbf24'), new Color('#ef233c')]

  for (let index = 0; index < positions.length; index += 3) {
    const y = Math.random() * 3.4 - 1.7
    const radius = 1 + Math.random() * 1
    const angle = Math.random() * Math.PI * 2
    const color = palette[(index / 3) % palette.length]

    positions[index] = Math.cos(angle) * radius
    positions[index + 1] = y
    positions[index + 2] = Math.sin(angle) * radius * 0.55
    colors[index] = color.r
    colors[index + 1] = color.g
    colors[index + 2] = color.b
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))

  return {
    geometry,
    material: new PointsMaterial({
      blending: AdditiveBlending,
      depthWrite: false,
      opacity: 0,
      size: 0.022,
      transparent: true,
      vertexColors: true,
    }),
  }
}
