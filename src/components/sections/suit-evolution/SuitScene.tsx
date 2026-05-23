import { Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import { Vector3, type Mesh } from 'three'
import { getDeviceProfile } from '../../../lib/performance'
import { SuitModel } from './SuitModel'
import { TransitionManager } from './TransitionManager'
import { suitEvolutionExperiences } from './suitEvolutionData'
import { useSuitEvolutionStore } from './useSuitEvolutionStore'

export function SuitScene() {
  const deviceProfile = useMemo(() => getDeviceProfile(), [])

  return (
    <div className="suit-evolution-scene" aria-hidden="true">
      <Canvas
        camera={{ fov: 35, position: [0.18, 0.02, 6.35] }}
        dpr={[1, deviceProfile.maxDPR]}
        gl={{
          alpha: true,
          antialias: deviceProfile.tier !== 'low',
          powerPreference: 'high-performance',
        }}
        shadows={false}
      >
        <CameraRig />
        <hemisphereLight color="#ffffff" groundColor="#ffffff" intensity={1.15} />
        <ambientLight intensity={1.35} />
        <directionalLight
          castShadow={false}
          color="#f8fafc"
          intensity={1.65}
          position={[-2.6, 3.2, 3.8]}
        />
        <pointLight color="#ffffff" intensity={1.1} position={[2.9, 1.6, 2.3]} />
        <Suspense fallback={<SuitSceneFallback />}>
          {suitEvolutionExperiences.map((experience, index) => (
            <SuitModel experience={experience} index={index} key={experience.id} />
          ))}
          <TransitionManager />
        </Suspense>
        <Stars count={deviceProfile.tier === 'low' ? 60 : 140} depth={20} factor={2.4} fade speed={0.22} />
      </Canvas>
    </div>
  )
}

function CameraRig() {
  const { camera, size } = useThree()
  const targetPositionRef = useRef(new Vector3())
  const lookAtRef = useRef(new Vector3(0.62, 0.22, 0))
  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useFrame(({ clock }) => {
    const state = useSuitEvolutionStore.getState()
    const isCompact = size.width <= 900
    const stageSweep = (state.sectionProgress - 0.5) * (isCompact ? 0.12 : 0.26)
    const hoverX = reducedMotion ? 0 : state.hoverVector.x * 0.11
    const hoverY = reducedMotion ? 0 : state.hoverVector.y * 0.08
    const breathing = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.42) * 0.045

    targetPositionRef.current.set(
      (isCompact ? 0 : 0.04) + stageSweep + hoverX,
      (isCompact ? 0.12 : -0.08) - hoverY + breathing,
      isCompact ? 6.6 : 6.35,
    )
    camera.position.lerp(targetPositionRef.current, 0.045)
    lookAtRef.current.set(
      (isCompact ? 0 : 0.54) + hoverX * 0.42,
      (isCompact ? -0.02 : 0.06) - hoverY * 0.34,
      0,
    )
    camera.lookAt(lookAtRef.current)
  })

  return null
}

function SuitSceneFallback() {
  const meshRef = useRef<Mesh>(null)
  const { activeSuitIndex } = useSuitEvolutionStore()
  const accent = suitEvolutionExperiences[activeSuitIndex]?.accent ?? '#38bdf8'

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    meshRef.current.rotation.y = clock.elapsedTime * 0.7
    meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.8) * 0.14
  })

  return (
    <group position={[0, -0.1, 0]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.92, 2]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.42} wireframe />
      </mesh>
    </group>
  )
}
