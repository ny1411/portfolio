import { OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react'
import {
  AdditiveBlending,
  CatmullRomCurve3,
  MathUtils,
  Matrix4,
  MeshBasicMaterial,
  PerspectiveCamera,
  Quaternion,
  Vector2,
  Vector3,
} from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { getDeviceProfile, type DeviceProfile } from '../../../lib/performance'
import { getProjectPortal, projectPortals, type ProjectPortal } from './projectPortalData'
import { ProjectPortalModel } from './ProjectPortalModel'
import {
  portalFrameMotion,
  resetPortalFrameMotion,
  useProjectMultiverseStore,
} from './useProjectMultiverseStore'

interface ProjectMultiverseSceneProps {
  isActive: boolean
}

export function ProjectMultiverseScene({ isActive }: ProjectMultiverseSceneProps) {
  const profile = useMemo(() => getDeviceProfile(), [])
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const deactivatePortal = useProjectMultiverseStore((state) => state.deactivatePortal)

  return (
    <div className="project-multiverse-scene" aria-hidden="true">
      <Canvas
        camera={{ fov: 43, position: [0, 0.24, 6.8] }}
        dpr={[1, profile.maxDPR]}
        frameloop={isActive ? 'always' : 'demand'}
        gl={{
          alpha: true,
          antialias: profile.tier !== 'low',
          powerPreference: 'high-performance',
        }}
        onPointerMissed={() => {
          if (useProjectMultiverseStore.getState().focusedPortalId) deactivatePortal()
        }}
      >
        <color args={['#03010d']} attach="background" />
        <fog args={['#070419', 9, 42]} attach="fog" />
        <PortalCameraRig
          controlsRef={controlsRef}
          isActive={isActive}
          reducedMotion={profile.prefersReducedMotion}
        />
        <PortalExplorationControls
          controlsRef={controlsRef}
          isActive={isActive}
          reducedMotion={profile.prefersReducedMotion}
        />
        <ambientLight intensity={0.72} />
        <hemisphereLight color="#fde8d4" groundColor="#070b2d" intensity={0.62} />
        <directionalLight color="#fff0da" intensity={1.42} position={[2.8, 3.4, 5.5]} />
        <Suspense fallback={<PortalLoadingSignal />}>
          <MultiverseAtmosphere profile={profile} />
          {projectPortals.map((portal) => (
            <ProjectPortalModel
              key={portal.id}
              lowDetail={profile.tier === 'low'}
              portal={portal}
              reducedMotion={profile.prefersReducedMotion}
            />
          ))}
        </Suspense>
        <PortalPostEffects isActive={isActive} profile={profile} />
      </Canvas>
    </div>
  )
}

interface PortalCameraRigProps {
  controlsRef: RefObject<OrbitControlsImpl | null>
  isActive: boolean
  reducedMotion: boolean
}

function PortalCameraRig({ controlsRef, isActive, reducedMotion }: PortalCameraRigProps) {
  const cameraPath = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          new Vector3(0, 0.24, 6.8),
          new Vector3(0.18, 0.28, 6),
          new Vector3(0.34, 0.2, 4.9),
          new Vector3(0.66, 0.22, 3.65),
          new Vector3(0.86, 0.12, 2),
          new Vector3(1.22, 0.08, -0.55),
        ],
        false,
        'catmullrom',
        0.42,
      ),
    [],
  )
  const lookPath = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          new Vector3(1.78, 0.05, -3),
          new Vector3(1.78, 0.05, -3),
          new Vector3(1.82, 0.05, -3),
          new Vector3(1.85, 0.04, -3.05),
          new Vector3(1.82, 0.02, -3.2),
          new Vector3(1.7, 0, -8.8),
        ],
        false,
        'catmullrom',
        0.4,
      ),
    [],
  )
  const traversalRoutes = useMemo(
    () => new Map(projectPortals.map((portal) => [portal.id, createTraversalRoute(portal)])),
    [],
  )
  const guidedPosition = useRef(new Vector3())
  const guidedLookAt = useRef(new Vector3(1.78, 0.05, -3))
  const desiredPosition = useRef(new Vector3())
  const desiredLookAt = useRef(new Vector3())
  const smoothedPosition = useRef(new Vector3())
  const smoothedLookAt = useRef(new Vector3(1.78, 0.05, -3))
  const positionVelocity = useRef(new Vector3())
  const lookVelocity = useRef(new Vector3())
  const springForce = useRef(new Vector3())
  const lookSpringForce = useRef(new Vector3())
  const routePosition = useRef(new Vector3())
  const routeLookAt = useRef(new Vector3())
  const scratchVector = useRef(new Vector3())
  const orientationMatrix = useRef(new Matrix4())
  const orientationTarget = useRef(new Quaternion())
  const focusStart = useRef(new Vector3())
  const focusControlA = useRef(new Vector3())
  const focusControlB = useRef(new Vector3())
  const focusOvershoot = useRef(new Vector3())
  const focusSettle = useRef(new Vector3())
  const focusLookStart = useRef(new Vector3())
  const previousProgress = useRef(0)
  const routePortalId = useRef<string | null>(null)
  const focusedPortalId = useRef<string | null>(null)
  const traversalDepthTarget = useRef(0)
  const traversalDepth = useRef(0)
  const traversalBlend = useRef(0)
  const scrollEnergy = useRef(0)
  const focusElapsed = useRef(0)
  const initialized = useRef(false)
  const resumingFromControls = useRef(false)
  const completeGuidedReturn = useProjectMultiverseStore((state) => state.completeGuidedReturn)

  useEffect(() => () => resetPortalFrameMotion(), [])

  useFrame(({ camera }, delta) => {
    if (!isActive) {
      initialized.current = false
      resetPortalFrameMotion()
      return
    }

    const state = useProjectMultiverseStore.getState()
    const step = Math.min(delta, 0.05)
    const focusedPortal = getProjectPortal(state.focusedPortalId)
    const hoveredPortal = getProjectPortal(state.hoveredPortalId)

    if (!initialized.current) {
      smoothedPosition.current.copy(camera.position)
      smoothedLookAt.current.copy(controlsRef.current?.target ?? guidedLookAt.current)
      previousProgress.current = state.sceneProgress
      initialized.current = true
    }

    const progressDelta = state.sceneProgress - previousProgress.current
    previousProgress.current = state.sceneProgress
    const isTraversing =
      hoveredPortal !== undefined &&
      !focusedPortal &&
      state.mode === 'traversing' &&
      !reducedMotion

    if (isTraversing) {
      routePortalId.current = hoveredPortal.id
      traversalDepthTarget.current = MathUtils.clamp(
        traversalDepthTarget.current + progressDelta * 8.4,
        0,
        0.98,
      )
    } else if (!focusedPortal) {
      traversalDepthTarget.current = 0
    }

    const energyTarget = isTraversing
      ? Math.min(1, Math.abs(state.scrollVelocity) / 16 + Math.abs(progressDelta) * 180)
      : 0
    scrollEnergy.current = MathUtils.damp(scrollEnergy.current, energyTarget, 6.5, step)
    traversalDepth.current = MathUtils.damp(
      traversalDepth.current,
      traversalDepthTarget.current,
      isTraversing ? 5.2 : 3.3,
      step,
    )

    if (state.mode === 'exploring') {
      traversalBlend.current = MathUtils.damp(traversalBlend.current, 0, 4, step)
      portalFrameMotion.portalId = routePortalId.current
      portalFrameMotion.traversalDepth = traversalDepth.current
      portalFrameMotion.traversalBlend = traversalBlend.current
      portalFrameMotion.scrollEnergy = scrollEnergy.current
      portalFrameMotion.immersion = MathUtils.damp(portalFrameMotion.immersion, 0, 4, step)
      portalFrameMotion.focusProgress = 0
      resumingFromControls.current = true
      return
    }

    if (resumingFromControls.current) {
      smoothedPosition.current.copy(camera.position)
      smoothedLookAt.current.copy(controlsRef.current?.target ?? guidedLookAt.current)
      positionVelocity.current.set(0, 0, 0)
      lookVelocity.current.set(0, 0, 0)
      resumingFromControls.current = false
    }

    if (reducedMotion) {
      guidedPosition.current.set(0, 0.24, 6.8)
      guidedLookAt.current.set(1.78, 0.05, -3)
    } else {
      cameraPath.getPointAt(state.sceneProgress, guidedPosition.current)
      lookPath.getPointAt(state.sceneProgress, guidedLookAt.current)
    }

    desiredPosition.current.copy(guidedPosition.current)
    desiredLookAt.current.copy(guidedLookAt.current)

    const route = routePortalId.current ? traversalRoutes.get(routePortalId.current) : undefined
    const routeBlendTarget =
      route && !focusedPortal && !reducedMotion && isTraversing
        ? MathUtils.smootherstep(traversalDepth.current, 0, 0.72) * 0.96
        : 0
    traversalBlend.current = MathUtils.damp(
      traversalBlend.current,
      routeBlendTarget,
      isTraversing ? 5 : 3.1,
      step,
    )

    if (route && traversalBlend.current > 0.0001 && !focusedPortal && !reducedMotion) {
      const routeProgress = MathUtils.smootherstep(traversalDepth.current, 0, 1)
      route.position.getPointAt(routeProgress, routePosition.current)
      route.lookAt.getPointAt(routeProgress, routeLookAt.current)
      desiredPosition.current.lerp(routePosition.current, traversalBlend.current)
      desiredLookAt.current.lerp(routeLookAt.current, traversalBlend.current)
    }

    if (focusedPortal && !reducedMotion) {
      if (focusedPortalId.current !== focusedPortal.id) {
        focusedPortalId.current = focusedPortal.id
        focusElapsed.current = 0
        focusStart.current.copy(smoothedPosition.current)
        focusLookStart.current.copy(smoothedLookAt.current)
        focusSettle.current.set(...focusedPortal.focusPosition)
        focusOvershoot.current
          .copy(focusSettle.current)
          .lerp(scratchVector.current.set(...focusedPortal.position), 0.095)
        const arcDirection = focusedPortal.position[0] > smoothedPosition.current.x ? -1 : 1
        focusControlA.current
          .copy(focusStart.current)
          .add(scratchVector.current.set(arcDirection * 0.28, 0.18, -0.32))
        focusControlB.current
          .copy(focusOvershoot.current)
          .add(scratchVector.current.set(-arcDirection * 0.38, 0.2, 0.86))
      }

      focusElapsed.current += step
      const focusProgress = MathUtils.clamp(focusElapsed.current / 2.25, 0, 1)
      const travel = MathUtils.smootherstep(focusProgress, 0, 0.82)
      cubicBezier(
        focusStart.current,
        focusControlA.current,
        focusControlB.current,
        focusOvershoot.current,
        travel,
        desiredPosition.current,
      )

      if (focusProgress > 0.8) {
        desiredPosition.current.lerp(
          focusSettle.current,
          MathUtils.smootherstep(focusProgress, 0.8, 1),
        )
      }

      const alignment = MathUtils.smootherstep(focusProgress, 0.08, 0.7)
      desiredLookAt.current
        .copy(focusLookStart.current)
        .lerp(scratchVector.current.set(...focusedPortal.position), alignment)
      const forwardAttention = Math.sin(MathUtils.clamp((focusProgress - 0.32) / 0.58, 0, 1) * Math.PI)
      desiredLookAt.current.z -= forwardAttention * 0.32
      portalFrameMotion.focusProgress = focusProgress
    } else {
      focusedPortalId.current = null
      portalFrameMotion.focusProgress = 0
    }

    const immersionTarget = focusedPortal && !reducedMotion
      ? 0.7 + portalFrameMotion.focusProgress * 0.3
      : traversalBlend.current * (0.72 + scrollEnergy.current * 0.28)
    portalFrameMotion.portalId = focusedPortal?.id ?? routePortalId.current
    portalFrameMotion.traversalDepth = traversalDepth.current
    portalFrameMotion.traversalBlend = traversalBlend.current
    portalFrameMotion.scrollEnergy = scrollEnergy.current
    portalFrameMotion.immersion = MathUtils.damp(
      portalFrameMotion.immersion,
      immersionTarget,
      focusedPortal ? 5.4 : 4.2,
      step,
    )

    const isSettling = focusedPortal && portalFrameMotion.focusProgress > 0.8
    const springFrequency = focusedPortal ? (isSettling ? 8.4 : 6.1) : state.mode === 'returning' ? 6.6 : 7.4
    const dampingRatio = focusedPortal ? (isSettling ? 1.08 : 0.76) : 0.98
    stepSpringVector(
      smoothedPosition.current,
      positionVelocity.current,
      desiredPosition.current,
      springFrequency,
      dampingRatio,
      step,
      springForce.current,
    )
    stepSpringVector(
      smoothedLookAt.current,
      lookVelocity.current,
      desiredLookAt.current,
      focusedPortal ? 6 : 7.2,
      focusedPortal ? 0.92 : 1,
      step,
      lookSpringForce.current,
    )

    camera.position.copy(smoothedPosition.current)
    const perspectiveCamera = camera as PerspectiveCamera
    if (perspectiveCamera.isPerspectiveCamera) {
      const targetFov = reducedMotion
        ? 43
        : 43 - portalFrameMotion.traversalBlend * 0.72 - portalFrameMotion.focusProgress * 0.42
      perspectiveCamera.fov = MathUtils.damp(perspectiveCamera.fov, targetFov, 3.8, step)
      perspectiveCamera.updateProjectionMatrix()
    }

    orientationMatrix.current.lookAt(camera.position, smoothedLookAt.current, camera.up)
    orientationTarget.current.setFromRotationMatrix(orientationMatrix.current)
    camera.quaternion.slerp(
      orientationTarget.current,
      1 - Math.exp(-(focusedPortal ? 5 : 6.8) * step),
    )
    controlsRef.current?.target.copy(smoothedLookAt.current)

    if (
      state.mode === 'returning' &&
      traversalBlend.current < 0.008 &&
      camera.position.distanceTo(desiredPosition.current) < 0.045
    ) {
      completeGuidedReturn()
    }

    if (!hoveredPortal && !focusedPortal && traversalBlend.current < 0.002) {
      routePortalId.current = null
      portalFrameMotion.portalId = null
    }
  })

  return null
}

interface PortalTraversalRoute {
  position: CatmullRomCurve3
  lookAt: CatmullRomCurve3
}

function createTraversalRoute(portal: ProjectPortal): PortalTraversalRoute {
  const origin = new Vector3(...portal.position)
  const entrance = new Vector3(...portal.focusPosition)
  const [bendX, bendY] = portal.tunnelBend

  return {
    position: new CatmullRomCurve3(
      [
        entrance,
        new Vector3(origin.x + bendX * 0.04, origin.y + bendY * 0.03, origin.z + 1.32),
        new Vector3(origin.x + bendX * 0.2, origin.y + bendY * 0.24, origin.z - 1.45),
        new Vector3(origin.x + bendX * 0.54, origin.y + bendY * 0.58, origin.z - 4.8),
        new Vector3(origin.x + bendX * 0.92, origin.y + bendY * 0.9, origin.z - 8.4),
        new Vector3(origin.x + bendX * 1.24, origin.y + bendY, origin.z - 12.4),
      ],
      false,
      'catmullrom',
      0.45,
    ),
    lookAt: new CatmullRomCurve3(
      [
        origin.clone(),
        new Vector3(origin.x + bendX * 0.2, origin.y + bendY * 0.24, origin.z - 2.2),
        new Vector3(origin.x + bendX * 0.55, origin.y + bendY * 0.6, origin.z - 5.4),
        new Vector3(origin.x + bendX * 0.96, origin.y + bendY * 0.92, origin.z - 8.9),
        new Vector3(origin.x + bendX * 1.32, origin.y + bendY, origin.z - 13.2),
      ],
      false,
      'catmullrom',
      0.45,
    ),
  }
}

function cubicBezier(
  start: Vector3,
  controlA: Vector3,
  controlB: Vector3,
  end: Vector3,
  progress: number,
  target: Vector3,
): void {
  const inverse = 1 - progress
  target
    .set(0, 0, 0)
    .addScaledVector(start, inverse * inverse * inverse)
    .addScaledVector(controlA, 3 * inverse * inverse * progress)
    .addScaledVector(controlB, 3 * inverse * progress * progress)
    .addScaledVector(end, progress * progress * progress)
}

function stepSpringVector(
  value: Vector3,
  velocity: Vector3,
  target: Vector3,
  frequency: number,
  dampingRatio: number,
  delta: number,
  force: Vector3,
): void {
  force.copy(target).sub(value).multiplyScalar(frequency * frequency)
  velocity.addScaledVector(force, delta)
  velocity.multiplyScalar(Math.exp(-2 * dampingRatio * frequency * delta))
  value.addScaledVector(velocity, delta)
}

interface PortalExplorationControlsProps {
  controlsRef: RefObject<OrbitControlsImpl | null>
  isActive: boolean
  reducedMotion: boolean
}

function PortalExplorationControls({
  controlsRef,
  isActive,
  reducedMotion,
}: PortalExplorationControlsProps) {
  const mode = useProjectMultiverseStore((state) => state.mode)
  const beginExploration = useProjectMultiverseStore((state) => state.beginExploration)
  const requestGuidedReturn = useProjectMultiverseStore((state) => state.requestGuidedReturn)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current)
  }, [])

  return (
    <OrbitControls
      dampingFactor={0.07}
      enableDamping
      enablePan={false}
      enableZoom={false}
      enabled={isActive && !reducedMotion && mode !== 'focused'}
      maxAzimuthAngle={Math.PI / 5}
      maxPolarAngle={Math.PI * 0.61}
      minAzimuthAngle={-Math.PI / 5}
      minPolarAngle={Math.PI * 0.39}
      onEnd={() => {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = window.setTimeout(requestGuidedReturn, 1500)
      }}
      onStart={() => {
        window.clearTimeout(timeoutRef.current)
        beginExploration()
      }}
      ref={controlsRef}
      rotateSpeed={0.38}
    />
  )
}

function MultiverseAtmosphere({ profile }: { profile: DeviceProfile }) {
  const reducedMotion = profile.prefersReducedMotion
  const lowDetail = profile.tier === 'low'

  return (
    <Stars
      count={lowDetail ? 60 : 130}
      depth={45}
      factor={1.8}
      fade
      radius={28}
      speed={reducedMotion ? 0 : 0.08}
    />
  )
}

function PortalPostEffects({ isActive, profile }: { isActive: boolean; profile: DeviceProfile }) {
  const focusedPortalId = useProjectMultiverseStore((state) => state.focusedPortalId)
  const isFocused = focusedPortalId !== null
  const highQuality = profile.tier === 'high' && !profile.prefersReducedMotion
  const bloomRef = useRef<any>(null)
  const chromaticOffset = useMemo(
    () => new Vector2(0.00032, 0.00018),
    [],
  )
  const chromaticOffsetRef = useRef(chromaticOffset)

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05)
    const immersion = Math.max(portalFrameMotion.immersion, isFocused ? 1 : 0)
    const activeBloom = bloomRef.current
    if (activeBloom) {
      activeBloom.intensity = MathUtils.damp(activeBloom.intensity, 1.28 + immersion * 0.8, 5, step)
    }

    if (!profile.prefersReducedMotion) {
      chromaticOffsetRef.current.x = MathUtils.damp(
        chromaticOffsetRef.current.x,
        0.00032 + immersion * 0.00188,
        5.4,
        step,
      )
      chromaticOffsetRef.current.y = MathUtils.damp(
        chromaticOffsetRef.current.y,
        0.00018 + immersion * 0.00102,
        5.4,
        step,
      )
    }
  })

  return (
    <EffectComposer
      enabled={isActive}
      multisampling={profile.tier === 'high' ? 4 : 0}
    >
      <Bloom
        ref={bloomRef}
        intensity={1.28}
        luminanceThreshold={0.32}
        mipmapBlur={true}
        radius={profile.tier === 'low' ? 0.38 : 0.68}
      />
      {profile.tier !== 'low' && !profile.prefersReducedMotion ? (
        <ChromaticAberration offset={chromaticOffset} radialModulation />
      ) : null}
      {highQuality && isFocused ? (
        <DepthOfField bokehScale={1.3} focusDistance={0.014} focalLength={0.03} />
      ) : null}
      {profile.tier !== 'low' ? (
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.04} premultiply />
      ) : null}
      <Vignette darkness={0.72} eskil={false} offset={0.22} />
    </EffectComposer>
  )
}

function PortalLoadingSignal() {
  const materialRef = useRef<MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    materialRef.current.opacity = 0.18 + Math.sin(clock.elapsedTime * 2) * 0.08
  })

  return (
    <mesh>
      <torusGeometry args={[1.1, 0.025, 8, 48]} />
      <meshBasicMaterial
        blending={AdditiveBlending}
        color="#22d3ee"
        opacity={0.22}
        ref={materialRef}
        toneMapped={false}
        transparent
      />
    </mesh>
  )
}
