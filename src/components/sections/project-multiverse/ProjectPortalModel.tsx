import { Sparkles, useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  Box3,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  type Material,
  LineBasicMaterial,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three'
import { threeElementAssets } from '../../../lib/threeElementAssets'
import { openPortalDestination, type ProjectPortal } from './projectPortalData'
import { portalFrameMotion, useProjectMultiverseStore } from './useProjectMultiverseStore'

interface ProjectPortalModelProps {
  lowDetail: boolean
  portal: ProjectPortal
  reducedMotion: boolean
}

interface TunnelRing {
  model: Group
  offset: readonly [number, number, number]
  orientation: Quaternion
  rotation: number
  rotationSpeed: number
  scale: number
}

export function ProjectPortalModel({
  lowDetail,
  portal,
  reducedMotion,
}: ProjectPortalModelProps) {
  const groupRef = useRef<Group>(null)
  const tunnelRef = useRef<Group>(null)
  const ringRefs = useRef<Array<Group | null>>([])
  const entranceMaterialRef = useRef<ShaderMaterial>(null)
  const interiorMaterialRef = useRef<ShaderMaterial>(null)
  const auraMaterialRef = useRef<MeshBasicMaterial>(null)
  const outerAuraMaterialRef = useRef<MeshBasicMaterial>(null)
  const tunnelShellMaterialRef = useRef<MeshBasicMaterial>(null)
  const tunnelGlowMaterialRef = useRef<MeshBasicMaterial>(null)
  const pullGlareGeometryRef = useRef<BufferGeometry>(null)
  const pullGlareMaterialRef = useRef<LineBasicMaterial>(null)
  const pullGlareHeadRef = useRef(new Vector3())
  const pullGlareTailRef = useRef(new Vector3())
  const activationRef = useRef(0)
  const revealRef = useRef(0)
  const pointerDownRef = useRef(false)
  const pointerStartRef = useRef({ x: 0, y: 0 })
  const suppressClickRef = useRef(false)
  const { scene } = useGLTF(threeElementAssets.portalSingleRing)
  const ringCount = lowDetail ? 5 : portal.id === 'repolyse' ? 10 : 7
  const preparedPortal = useMemo(
    () => preparePortalTunnel(scene, portal.id, portal.tunnelBend, ringCount),
    [portal.id, portal.tunnelBend, ringCount, scene],
  )
  const tunnelShellGeometry = useMemo(
    () => createPortalTunnelShell(preparedPortal.rings),
    [preparedPortal.rings],
  )
  const pullTrails = useMemo(
    () => createPortalPullTrails(preparedPortal.rings, lowDetail),
    [lowDetail, preparedPortal.rings],
  )
  const initialPullGlarePositions = useMemo(
    () =>
      writePortalPullGlarePositions(
        pullTrails,
        new Float32Array(pullTrails.length * 6),
        0,
        0,
        new Vector3(),
        new Vector3(),
      ),
    [pullTrails],
  )
  const basePosition = useMemo(() => new Vector3(...portal.position), [portal.position])
  const focusedPortalId = useProjectMultiverseStore((state) => state.focusedPortalId)
  const hoveredPortalId = useProjectMultiverseStore((state) => state.hoveredPortalId)
  const mode = useProjectMultiverseStore((state) => state.mode)
  const focusPortal = useProjectMultiverseStore((state) => state.focusPortal)
  const hoverPortal = useProjectMultiverseStore((state) => state.hoverPortal)
  const isFocused = focusedPortalId === portal.id
  const isHovered = hoveredPortalId === portal.id
  const isTraversing = isHovered && mode === 'traversing'
  const farthestRing = preparedPortal.rings[preparedPortal.rings.length - 1]
  const gatewayRing = preparedPortal.rings[Math.min(2, preparedPortal.rings.length - 1)]
  const uniforms = useMemo(
    () => ({
      uActivation: { value: 0 },
      uColor: { value: new Color(portal.primaryColor) },
      uMembrane: { value: 0 },
      uReveal: { value: 0 },
      uSecondary: { value: new Color(portal.secondaryColor) },
      uTime: { value: 0 },
      uTraversal: { value: 0 },
      uVelocity: { value: 0 },
    }),
    [portal.primaryColor, portal.secondaryColor],
  )
  const gatewayUniforms = useMemo(
    () => ({
      uActivation: { value: 0 },
      uColor: { value: new Color(portal.primaryColor) },
      uMembrane: { value: 1 },
      uReveal: { value: 0 },
      uSecondary: { value: new Color(portal.secondaryColor) },
      uTime: { value: 0 },
      uTraversal: { value: 0 },
      uVelocity: { value: 0 },
    }),
    [portal.primaryColor, portal.secondaryColor],
  )

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    const tunnel = tunnelRef.current
    const state = useProjectMultiverseStore.getState()
    if (!group || !tunnel) return

    const revealTarget =
      state.focusedPortalId === portal.id
        ? 1
        : smoothWindow(state.sceneProgress, portal.revealAt - 0.008, portal.revealAt + 0.038)
    const isMotionPortal = portalFrameMotion.portalId === portal.id
    const traversal = isMotionPortal ? portalFrameMotion.traversalBlend : 0
    const immersion = isMotionPortal ? portalFrameMotion.immersion : 0
    const velocityEnergy = isMotionPortal ? portalFrameMotion.scrollEnergy : 0
    const activationTarget =
      state.focusedPortalId === portal.id
        ? 1
        : Math.min(
            0.88,
            (state.hoveredPortalId === portal.id ? 0.32 : 0) +
              traversal * 0.46 +
              velocityEnergy * traversal * 0.14,
          )
    revealRef.current = MathUtils.damp(revealRef.current, revealTarget, 6, delta)
    activationRef.current = MathUtils.damp(activationRef.current, activationTarget, 6, delta)

    const reveal = revealRef.current
    const activation = activationRef.current
    const isFocusedPortal = state.focusedPortalId === portal.id
    const spinResponse = isFocusedPortal
      ? 0.42
      : 1 + traversal * (0.16 + velocityEnergy * 0.09)
    const floatOffset = reducedMotion
      ? 0
      : Math.sin(clock.elapsedTime * 0.66 + portal.revealAt * 20) * 0.035

    group.visible = reveal > 0.008
    group.position.copy(basePosition)
    group.position.y += floatOffset
    group.scale.setScalar(0.12 + reveal * 0.88 + activation * 0.065)
    tunnel.rotation.y = reducedMotion
      ? 0
      : Math.sin(clock.elapsedTime * (0.22 + traversal * 0.34)) * (0.01 + traversal * 0.018)
    tunnel.rotation.x = reducedMotion
      ? 0
      : Math.cos(clock.elapsedTime * 0.17) * (0.008 + traversal * 0.014)
    tunnel.position.x = reducedMotion
      ? 0
      : Math.sin(clock.elapsedTime * 0.9) * traversal * (0.025 + velocityEnergy * 0.024)
    tunnel.position.y = reducedMotion
      ? 0
      : Math.cos(clock.elapsedTime * 0.72) * traversal * (0.018 + velocityEnergy * 0.02)
    tunnel.position.z = reducedMotion ? 0 : -traversal * velocityEnergy * 0.11

    for (const [index, ring] of ringRefs.current.entries()) {
      const ringDefinition = preparedPortal.rings[index]
      if (!ring || !ringDefinition) continue

      ring.rotation.z =
        ringDefinition.rotation +
        (reducedMotion
          ? 0
          : clock.elapsedTime *
            ringDefinition.rotationSpeed *
            spinResponse)
    }

    if (entranceMaterialRef.current) {
      entranceMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
      entranceMaterialRef.current.uniforms.uReveal.value = reveal
      entranceMaterialRef.current.uniforms.uActivation.value = activation
      entranceMaterialRef.current.uniforms.uTraversal.value = traversal
      entranceMaterialRef.current.uniforms.uVelocity.value = velocityEnergy
    }
    if (interiorMaterialRef.current) {
      interiorMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
      interiorMaterialRef.current.uniforms.uReveal.value = reveal
      interiorMaterialRef.current.uniforms.uActivation.value = activation
      interiorMaterialRef.current.uniforms.uTraversal.value = traversal
      interiorMaterialRef.current.uniforms.uVelocity.value = velocityEnergy
    }
    if (auraMaterialRef.current) {
      auraMaterialRef.current.opacity = reveal * (0.08 + activation * 0.16 + immersion * 0.1)
    }
    if (outerAuraMaterialRef.current) {
      outerAuraMaterialRef.current.opacity = reveal * (0.06 + activation * 0.18 + immersion * 0.12)
    }
    if (tunnelShellMaterialRef.current) {
      tunnelShellMaterialRef.current.opacity = reveal * (0.036 + activation * 0.05 + immersion * 0.04)
    }
    if (tunnelGlowMaterialRef.current) {
      tunnelGlowMaterialRef.current.opacity = reveal * (0.012 + activation * 0.018 + immersion * 0.014)
    }
    const pullForce = activation * 0.65 + immersion * 0.55 + velocityEnergy * traversal * 0.42
    const glarePositions = pullGlareGeometryRef.current?.attributes.position
    if (glarePositions && !reducedMotion) {
      writePortalPullGlarePositions(
        pullTrails,
        glarePositions.array as Float32Array,
        clock.elapsedTime,
        pullForce,
        pullGlareHeadRef.current,
        pullGlareTailRef.current,
      )
      glarePositions.needsUpdate = true
    }
    if (pullGlareMaterialRef.current) {
      pullGlareMaterialRef.current.opacity = reveal * (0.38 + activation * 0.34 + immersion * 0.24)
    }
  })

  const handlePortalClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (suppressClickRef.current || event.delta > 4) {
      suppressClickRef.current = false
      return
    }

    if (focusedPortalId === portal.id) {
      openPortalDestination(portal)
      return
    }

    focusPortal(portal.id)
  }

  const trackPortalDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!pointerDownRef.current || suppressClickRef.current) return
    const deltaX = event.nativeEvent.clientX - pointerStartRef.current.x
    const deltaY = event.nativeEvent.clientY - pointerStartRef.current.y
    suppressClickRef.current = deltaX * deltaX + deltaY * deltaY > 25
  }

  return (
    <group
      onClick={handlePortalClick}
      onPointerDown={(event) => {
        pointerDownRef.current = true
        pointerStartRef.current.x = event.nativeEvent.clientX
        pointerStartRef.current.y = event.nativeEvent.clientY
        suppressClickRef.current = false
      }}
      onPointerMove={trackPortalDrag}
      onPointerOut={(event) => {
        trackPortalDrag(event)
        hoverPortal(null)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        hoverPortal(portal.id)
      }}
      onPointerUp={() => {
        pointerDownRef.current = false
      }}
      ref={groupRef}
    >
      <group ref={tunnelRef}>
        <mesh geometry={tunnelShellGeometry} renderOrder={-2}>
          <meshBasicMaterial
            blending={AdditiveBlending}
            color="#ff4826"
            depthWrite={false}
            opacity={0}
            ref={tunnelShellMaterialRef}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
        {!lowDetail && (
          <mesh geometry={tunnelShellGeometry} renderOrder={-3} scale={1.045}>
            <meshBasicMaterial
              blending={AdditiveBlending}
              color="#ff8d38"
              depthWrite={false}
              opacity={0}
              ref={tunnelGlowMaterialRef}
              side={DoubleSide}
              toneMapped={false}
              transparent
            />
          </mesh>
        )}
        <lineSegments renderOrder={3}>
          <bufferGeometry ref={pullGlareGeometryRef}>
            <bufferAttribute args={[initialPullGlarePositions, 3]} attach="attributes-position" />
          </bufferGeometry>
          <lineBasicMaterial
            blending={AdditiveBlending}
            color="#ffd154"
            depthWrite={false}
            opacity={0}
            ref={pullGlareMaterialRef}
            toneMapped={false}
            transparent
          />
        </lineSegments>
        <mesh
          position={[gatewayRing.offset[0], gatewayRing.offset[1], gatewayRing.offset[2] + 0.02]}
          quaternion={gatewayRing.orientation}
          renderOrder={-1}
          scale={gatewayRing.scale * 0.94}
        >
          <circleGeometry args={[1.3, lowDetail ? 24 : 48]} />
          <shaderMaterial
            blending={AdditiveBlending}
            depthWrite={false}
            fragmentShader={portalFragmentShader}
            ref={entranceMaterialRef}
            side={DoubleSide}
            toneMapped={false}
            transparent
            uniforms={gatewayUniforms}
            vertexShader={portalVertexShader}
          />
        </mesh>
        {preparedPortal.rings.map((ring, index) => (
          <group
            key={`${portal.id}-ring-${index}`}
            position={ring.offset}
            quaternion={ring.orientation}
          >
            <group
              ref={(node) => {
                ringRefs.current[index] = node
              }}
              scale={ring.scale}
            >
              <primitive
                object={ring.model}
                rotation={[0, Math.PI / 2, 0]}
                scale={preparedPortal.modelScale}
              />
              <mesh position={[0, 0, 0.024]}>
                <ringGeometry args={[1.38, 1.415, 6]} />
                <meshBasicMaterial
                  blending={AdditiveBlending}
                  color={index === 0 ? '#ffb12e' : index % 3 === 0 ? '#ff5637' : portal.secondaryColor}
                  depthWrite={false}
                  opacity={index === 0 ? 0.3 : 0.075}
                  toneMapped={false}
                  transparent
                />
              </mesh>
            </group>
          </group>
        ))}

        <mesh
          position={[
            farthestRing.offset[0],
            farthestRing.offset[1],
            farthestRing.offset[2] - 0.04,
          ]}
          quaternion={farthestRing.orientation}
          scale={farthestRing.scale * 0.94}
        >
          <circleGeometry args={[1.3, lowDetail ? 24 : 48]} />
          <shaderMaterial
            blending={AdditiveBlending}
            depthWrite={false}
            fragmentShader={portalFragmentShader}
            ref={interiorMaterialRef}
            side={DoubleSide}
            toneMapped={false}
            transparent
            uniforms={uniforms}
            vertexShader={portalVertexShader}
          />
        </mesh>

        <mesh rotation={[0, 0, 0.19]}>
          <ringGeometry args={[1.54, 1.57, 6]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color="#ff6638"
            depthWrite={false}
            opacity={0.24}
            ref={auraMaterialRef}
            toneMapped={false}
            transparent
          />
        </mesh>
        <mesh rotation={[0, 0, -0.24]}>
          <ringGeometry args={[1.7, 1.718, 6]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={isFocused ? portal.primaryColor : '#ffbb37'}
            depthWrite={false}
            opacity={isFocused ? 0.65 : 0.31}
            ref={outerAuraMaterialRef}
            toneMapped={false}
            transparent
          />
        </mesh>
        <Sparkles
          color={portal.primaryColor}
          count={lowDetail ? 5 : isFocused ? 20 : isTraversing ? 16 : isHovered ? 12 : 8}
          noise={[0.85, 0.85, 3.8]}
          opacity={isFocused ? 0.62 : isTraversing ? 0.5 : 0.3}
          scale={[2.4, 2.4, 7.2]}
          size={isFocused ? 2.3 : isTraversing ? 1.9 : 1.45}
          speed={reducedMotion ? 0 : isFocused ? 0.58 : isTraversing ? 0.48 : 0.22}
        />
      </group>
    </group>
  )
}

interface PreparedPortal {
  modelScale: number
  rings: TunnelRing[]
}

interface PortalPullTrail {
  curve: CatmullRomCurve3
  length: number
  phase: number
  speed: number
}

function preparePortalTunnel(
  scene: Group,
  portalId: string,
  tunnelBend: readonly [number, number],
  count: number,
): PreparedPortal {
  const bounds = new Box3().setFromObject(scene)
  const center = bounds.getCenter(new Vector3())
  const size = bounds.getSize(new Vector3())
  const largestAxis = Math.max(size.x, size.y, size.z, 1)
  const isSecondaryRoute = portalId === 'gitmatch'
  const direction = isSecondaryRoute ? -1 : 1
  const depthSpacing = isSecondaryRoute ? 1.38 : 1.46
  const lastIndex = count - 1
  const tunnelDepth = -(lastIndex * depthSpacing - lastIndex * lastIndex * 0.042)
  const route = createPortalCenterline(tunnelBend, tunnelDepth)
  const forward = new Vector3(0, 0, -1)

  const rings = Array.from({ length: count }, (_, index) => {
    const progress = lastIndex === 0 ? 0 : index / lastIndex
    const compressedProgress = 1 - Math.pow(1 - progress, 1.18)
    const offset = route.getPointAt(compressedProgress)
    const orientation = new Quaternion().setFromUnitVectors(
      forward,
      route.getTangentAt(compressedProgress).normalize(),
    )
    const model = scene.clone(true)
    model.position.set(-center.x, -center.y, -center.z)
    model.traverse((child) => {
      if (!(child instanceof Mesh)) return
      if (index > 0) {
        const opacity = Math.max(0.16, 0.68 - index * 0.07)
        const fadeMaterial = (material: Material) => {
          const fadedMaterial = material.clone()
          fadedMaterial.opacity *= opacity
          fadedMaterial.transparent = true
          fadedMaterial.depthWrite = index < 4
          return fadedMaterial
        }
        child.material = Array.isArray(child.material)
          ? child.material.map(fadeMaterial)
          : fadeMaterial(child.material)
      }
      child.castShadow = false
      child.receiveShadow = false
    })

    return {
      model,
      offset: [offset.x, offset.y, offset.z] as const,
      orientation,
      rotation: index * direction * 0.22,
      rotationSpeed: direction * Math.max(0.012, 0.112 - index * 0.011),
      scale: Math.max(0.3, 1 - index * 0.07),
    }
  })

  return { modelScale: 2.78 / largestAxis, rings }
}

function createPortalCenterline(
  [bendX, bendY]: readonly [number, number],
  depth: number,
): CatmullRomCurve3 {
  return new CatmullRomCurve3(
    [
      new Vector3(0, 0, 0),
      new Vector3(bendX * 0.04, bendY * 0.04, depth * 0.2),
      new Vector3(bendX * 0.24, bendY * 0.29, depth * 0.46),
      new Vector3(bendX * 0.65, bendY * 0.73, depth * 0.77),
      new Vector3(bendX, bendY, depth),
    ],
    false,
    'catmullrom',
    0.42,
  )
}

function createPortalTunnelShell(rings: TunnelRing[]): BufferGeometry {
  const vertices: number[] = []
  const radius = 1.38

  for (let section = 0; section < rings.length - 1; section += 1) {
    const front = rings[section]
    const rear = rings[section + 1]

    for (let side = 0; side < 6; side += 1) {
      const frontA = portalTubeVertex(front, radius, side)
      const frontB = portalTubeVertex(front, radius, side + 1)
      const rearA = portalTubeVertex(rear, radius, side)
      const rearB = portalTubeVertex(rear, radius, side + 1)

      vertices.push(
        ...frontA,
        ...rearA,
        ...rearB,
        ...frontA,
        ...rearB,
        ...frontB,
      )
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  return geometry
}

function createPortalPullTrails(rings: TunnelRing[], lowDetail: boolean): PortalPullTrail[] {
  const rails = Array.from({ length: 6 }, (_, side) => {
    const points = rings.map((ring) => new Vector3(...portalTubeVertex(ring, 1.392, side)))
    return new CatmullRomCurve3(points, false, 'catmullrom', 0.42)
  })
  const count = lowDetail ? 6 : 14

  return Array.from({ length: count }, (_, index) => ({
    curve: rails[index % rails.length],
    length: 0.055 + (index % 4) * 0.014,
    phase: (index * 0.61803398875) % 1,
    speed: 0.76 + (index % 5) * 0.09,
  }))
}

function writePortalPullGlarePositions(
  trails: PortalPullTrail[],
  positions: Float32Array,
  time: number,
  pullForce: number,
  head: Vector3,
  tail: Vector3,
): Float32Array {
  const flowSpeed = 0.42 + pullForce * 0.48
  const acceleration = 1.35 + pullForce * 0.24

  for (const [index, trail] of trails.entries()) {
    const travel = (trail.phase + time * flowSpeed * trail.speed) % 1
    const headProgress = Math.pow(travel, acceleration)
    const trailLength = trail.length * (0.82 + headProgress * 1.1 + pullForce * 0.24)
    const tailProgress = Math.max(0, headProgress - trailLength)
    trail.curve.getPointAt(tailProgress, tail)
    trail.curve.getPointAt(headProgress, head)

    positions[index * 6] = tail.x
    positions[index * 6 + 1] = tail.y
    positions[index * 6 + 2] = tail.z
    positions[index * 6 + 3] = head.x
    positions[index * 6 + 4] = head.y
    positions[index * 6 + 5] = head.z
  }

  return positions
}

function portalTubeVertex(ring: TunnelRing, radius: number, side: number): [number, number, number] {
  const angle = Math.PI / 6 + side * (Math.PI / 3)
  const radial = new Vector3(
    Math.cos(angle) * radius * ring.scale,
    Math.sin(angle) * radius * ring.scale,
    0,
  ).applyQuaternion(ring.orientation)
  return [
    ring.offset[0] + radial.x,
    ring.offset[1] + radial.y,
    ring.offset[2] + radial.z,
  ]
}

function smoothWindow(value: number, start: number, end: number): number {
  const progress = Math.min(1, Math.max(0, (value - start) / (end - start)))
  return progress * progress * (3 - 2 * progress)
}

const portalVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const portalFragmentShader = `
  uniform float uActivation;
  uniform vec3 uColor;
  uniform float uMembrane;
  uniform float uReveal;
  uniform vec3 uSecondary;
  uniform float uTime;
  uniform float uTraversal;
  uniform float uVelocity;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - 0.5;
    float radius = length(centered) * 2.0;
    radius += sin(atan(centered.y, centered.x) * 3.0 + uTime * 1.35) * uTraversal * 0.055;
    float mask = smoothstep(1.0, 0.86, radius);
    float angle = atan(centered.y, centered.x);
    float spiral = sin(angle * 6.0 - uTime * (0.65 + uActivation + uTraversal * 1.2) + radius * 23.0);
    float scan = sin(radius * 38.0 - uTime * (1.8 + uVelocity * 1.3)) * 0.5 + 0.5;
    float signal = smoothstep(0.24, 0.88, spiral * 0.5 + scan * 0.5);
    float core = pow(max(0.0, 1.0 - radius), 2.35);
    float vortex = smoothstep(0.18, 0.96, sin(angle * 8.0 - uTime * (1.15 + uTraversal) + radius * 34.0) * 0.5 + 0.5);
    float singularity = 1.0 - smoothstep(0.035, 0.2, radius);
    float eventHorizon = exp(-pow((radius - 0.235) * 13.0, 2.0));
    vec3 energy = mix(uColor, uSecondary, signal * 0.82 + uActivation * 0.14);
    energy += mix(vec3(1.0, 0.34, 0.13), vec3(0.38, 0.91, 1.0), vortex) * core * (1.05 + uTraversal * 0.85);
    energy += mix(uSecondary, vec3(1.0, 0.68, 0.3), vortex) * eventHorizon * (1.25 + uActivation * 0.85);
    energy = mix(energy, vec3(0.002, 0.001, 0.009), singularity * (0.84 + uActivation * 0.08));
    float membrane = mix(1.0, 0.34, uMembrane);
    float alpha = mask * uReveal * (0.1 + signal * 0.17 + eventHorizon * 0.28 + core * 0.16 + uActivation * 0.16 + uTraversal * 0.1) * membrane;

    gl_FragColor = vec4(
      energy * (0.9 + signal * 1.15 + core * 0.72 + uActivation * 1.1 + uTraversal * 0.72) * mix(1.0, 0.62, uMembrane),
      alpha
    );
  }
`

useGLTF.preload(threeElementAssets.portalSingleRing)
