import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, type Group } from 'three'
import { getDeviceProfile } from '../../../lib/performance'
import type { SkillArtifactPreset, SkillTreeNode } from './types'

interface SkillShowcaseProps {
  skill: SkillTreeNode
}

export function SkillShowcase({ skill }: SkillShowcaseProps) {
  const profile = useMemo(() => getDeviceProfile(), [])

  return (
    <div className="skill-showcase" aria-label={`${skill.name} 3D artifact`}>
      <Canvas
        camera={{ fov: 38, position: [0, 0.15, 5.2] }}
        dpr={[1, profile.maxDPR]}
        frameloop={profile.prefersReducedMotion ? 'demand' : 'always'}
        gl={{
          alpha: true,
          antialias: profile.tier !== 'low',
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
      >
        <ambientLight intensity={0.74} />
        <hemisphereLight color="#e0f2fe" groundColor="#020617" intensity={0.78} />
        <directionalLight color="#ffffff" intensity={1.8} position={[2.8, 3.4, 4.6]} />
        <pointLight color={skill.accent} intensity={2.1} position={[-2.2, 1.6, 2.8]} />
        <SkillShowcaseScene skill={skill} reducedMotion={profile.prefersReducedMotion} />
      </Canvas>
    </div>
  )
}

interface SkillShowcaseSceneProps {
  skill: SkillTreeNode
  reducedMotion: boolean
}

function SkillShowcaseScene({ skill, reducedMotion }: SkillShowcaseSceneProps) {
  const groupRef = useRef<Group>(null)

  useFrame(({ camera, clock, pointer }, delta) => {
    const group = groupRef.current
    const step = Math.min(delta, 0.05)
    const targetX = reducedMotion ? 0 : pointer.y * 0.18
    const targetY = reducedMotion ? 0 : pointer.x * 0.28
    const drift = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.8) * 0.05

    if (group) {
      group.rotation.x = MathUtils.damp(group.rotation.x, targetX + drift, 5.2, step)
      group.rotation.y = MathUtils.damp(group.rotation.y, targetY + clock.elapsedTime * 0.18, 3.6, step)
      group.rotation.z = MathUtils.damp(group.rotation.z, -pointer.x * 0.08, 5.2, step)
      group.position.y = MathUtils.damp(group.position.y, drift * 0.35, 4.8, step)
    }

    camera.position.x = MathUtils.damp(camera.position.x, reducedMotion ? 0 : pointer.x * 0.18, 4.2, step)
    camera.position.y = MathUtils.damp(camera.position.y, 0.15 + (reducedMotion ? 0 : pointer.y * 0.12), 4.2, step)
    camera.lookAt(0, 0, 0)
  })

  return (
    <group key={skill.id} ref={groupRef}>
      <SkillArtifact accent={skill.accent} preset={skill.artifact} />
    </group>
  )
}

interface SkillArtifactProps {
  accent: string
  preset: SkillArtifactPreset
}

function SkillArtifact({ accent, preset }: SkillArtifactProps) {
  switch (preset) {
    case 'cards':
      return <CardsArtifact accent={accent} />
    case 'cloud':
      return <CloudArtifact accent={accent} />
    case 'cube':
      return <CubeArtifact accent={accent} />
    case 'database':
      return <DatabaseArtifact accent={accent} />
    case 'gateway':
      return <GatewayArtifact accent={accent} />
    case 'grid':
      return <GridArtifact accent={accent} />
    case 'map':
      return <MapArtifact accent={accent} />
    case 'neural':
      return <NeuralArtifact accent={accent} />
    case 'pipeline':
      return <PipelineArtifact accent={accent} />
    case 'portal':
      return <PortalArtifact accent={accent} />
    case 'server':
      return <ServerArtifact accent={accent} />
    case 'shield':
      return <ShieldArtifact accent={accent} />
    case 'terminal':
      return <TerminalArtifact accent={accent} />
    case 'web':
      return <WebArtifact accent={accent} />
    case 'orbital':
    default:
      return <OrbitalArtifact accent={accent} />
  }
}

function GlowMaterial({ accent, opacity = 1 }: { accent: string; opacity?: number }) {
  return (
    <meshStandardMaterial
      color={accent}
      emissive={accent}
      emissiveIntensity={0.45}
      metalness={0.28}
      opacity={opacity}
      roughness={0.24}
      transparent={opacity < 1}
    />
  )
}

function OrbitalArtifact({ accent }: { accent: string }) {
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.48, 2]} />
        <GlowMaterial accent={accent} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.94, 0.014, 12, 96]} />
        <GlowMaterial accent="#38bdf8" />
      </mesh>
      <mesh rotation={[0.65, 0.1, Math.PI / 2]}>
        <torusGeometry args={[0.78, 0.012, 12, 96]} />
        <GlowMaterial accent={accent} opacity={0.72} />
      </mesh>
      <mesh rotation={[0.2, 1.1, 0.25]}>
        <torusGeometry args={[1.12, 0.01, 12, 96]} />
        <GlowMaterial accent="#ef4444" opacity={0.64} />
      </mesh>
    </group>
  )
}

function CubeArtifact({ accent }: { accent: string }) {
  return (
    <group>
      <mesh rotation={[0.58, 0.82, 0.16]}>
        <boxGeometry args={[1.24, 1.24, 1.24]} />
        <meshStandardMaterial color="#07111f" emissive={accent} emissiveIntensity={0.16} metalness={0.45} roughness={0.22} />
      </mesh>
      <mesh rotation={[0.58, 0.82, 0.16]} scale={1.018}>
        <boxGeometry args={[1.24, 1.24, 1.24]} />
        <meshBasicMaterial color={accent} wireframe />
      </mesh>
    </group>
  )
}

function PortalArtifact({ accent }: { accent: string }) {
  return (
    <group>
      <mesh>
        <torusGeometry args={[0.88, 0.045, 16, 108]} />
        <GlowMaterial accent={accent} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.58, 0.018, 12, 84]} />
        <GlowMaterial accent="#38bdf8" opacity={0.74} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.36, 48]} />
        <meshStandardMaterial color="#07111f" emissive={accent} emissiveIntensity={0.28} opacity={0.58} transparent />
      </mesh>
    </group>
  )
}

function WebArtifact({ accent }: { accent: string }) {
  return (
    <group>
      {[0.35, 0.64, 0.93].map((radius) => (
        <mesh key={radius}>
          <torusGeometry args={[radius, 0.008, 8, 72]} />
          <GlowMaterial accent={accent} opacity={0.72} />
        </mesh>
      ))}
      {[0, Math.PI / 3, (Math.PI * 2) / 3].map((rotation) => (
        <mesh key={rotation} rotation={[0, 0, rotation]}>
          <boxGeometry args={[1.95, 0.018, 0.018]} />
          <GlowMaterial accent="#38bdf8" opacity={0.7} />
        </mesh>
      ))}
      <mesh>
        <octahedronGeometry args={[0.24, 0]} />
        <GlowMaterial accent="#ef4444" />
      </mesh>
    </group>
  )
}

function TerminalArtifact({ accent }: { accent: string }) {
  return (
    <group rotation={[-0.08, -0.24, 0]}>
      <mesh>
        <boxGeometry args={[1.64, 1.02, 0.12]} />
        <meshStandardMaterial color="#07111f" emissive={accent} emissiveIntensity={0.22} metalness={0.26} roughness={0.28} />
      </mesh>
      {[-0.28, 0, 0.28].map((y, index) => (
        <mesh key={y} position={[-0.24 + index * 0.18, y, 0.08]}>
          <boxGeometry args={[0.72 - index * 0.12, 0.035, 0.035]} />
          <GlowMaterial accent={index === 1 ? '#38bdf8' : accent} />
        </mesh>
      ))}
    </group>
  )
}

function GridArtifact({ accent }: { accent: string }) {
  return (
    <group>
      {[-0.42, 0.42].flatMap((x) =>
        [-0.42, 0.42].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.18]} />
            <GlowMaterial accent={accent} opacity={0.84} />
          </mesh>
        )),
      )}
      <mesh>
        <torusGeometry args={[1.05, 0.012, 8, 84]} />
        <GlowMaterial accent="#38bdf8" opacity={0.66} />
      </mesh>
    </group>
  )
}

function MapArtifact({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 56]} />
        <meshStandardMaterial color="#07111f" emissive={accent} emissiveIntensity={0.16} opacity={0.78} transparent />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.32, 0.82, 36]} />
        <GlowMaterial accent={accent} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.22, 28, 16]} />
        <GlowMaterial accent="#ef4444" />
      </mesh>
    </group>
  )
}

function DatabaseArtifact({ accent }: { accent: string }) {
  return (
    <group>
      {[-0.36, 0, 0.36].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.18, 56]} />
          <GlowMaterial accent={accent} opacity={0.82} />
        </mesh>
      ))}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.72, 0.012, 8, 72]} />
        <GlowMaterial accent="#38bdf8" />
      </mesh>
    </group>
  )
}

function CloudArtifact({ accent }: { accent: string }) {
  return (
    <group>
      {[
        [-0.42, 0, 0],
        [0, 0.2, 0.05],
        [0.44, -0.02, 0],
        [0.08, -0.18, 0.16],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]}>
          <sphereGeometry args={[0.36, 28, 16]} />
          <GlowMaterial accent={accent} opacity={0.78} />
        </mesh>
      ))}
      <mesh position={[0, -0.32, 0]} scale={[1.4, 0.18, 0.2]}>
        <boxGeometry args={[1, 1, 1]} />
        <GlowMaterial accent="#38bdf8" opacity={0.68} />
      </mesh>
    </group>
  )
}

function NeuralArtifact({ accent }: { accent: string }) {
  return (
    <group>
      {[
        [-0.56, -0.28, 0],
        [-0.2, 0.38, 0.1],
        [0.34, 0.1, -0.08],
        [0.58, -0.42, 0.06],
        [0, -0.05, 0.2],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]}>
          <sphereGeometry args={[0.13, 20, 12]} />
          <GlowMaterial accent={accent} />
        </mesh>
      ))}
      {[0, 0.48, -0.48, 1.02].map((rotation) => (
        <mesh key={rotation} rotation={[0.1, 0.4, rotation]}>
          <boxGeometry args={[1.42, 0.018, 0.018]} />
          <GlowMaterial accent="#38bdf8" opacity={0.55} />
        </mesh>
      ))}
    </group>
  )
}

function ServerArtifact({ accent }: { accent: string }) {
  return (
    <group>
      {[-0.34, 0.02, 0.38].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[1.3, 0.25, 0.72]} />
          <GlowMaterial accent={accent} opacity={0.8} />
        </mesh>
      ))}
      <mesh position={[0.48, 0.42, 0.38]}>
        <sphereGeometry args={[0.06, 16, 8]} />
        <GlowMaterial accent="#38bdf8" />
      </mesh>
    </group>
  )
}

function GatewayArtifact({ accent }: { accent: string }) {
  return (
    <group>
      <mesh>
        <octahedronGeometry args={[0.72, 0]} />
        <GlowMaterial accent={accent} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.02, 0.014, 8, 96]} />
        <GlowMaterial accent="#38bdf8" opacity={0.7} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.02, 0.014, 8, 96]} />
        <GlowMaterial accent="#ef4444" opacity={0.62} />
      </mesh>
    </group>
  )
}

function ShieldArtifact({ accent }: { accent: string }) {
  return (
    <group>
      <mesh scale={[0.9, 1.12, 0.18]}>
        <octahedronGeometry args={[0.8, 1]} />
        <GlowMaterial accent={accent} />
      </mesh>
      <mesh scale={[0.58, 0.72, 0.2]}>
        <octahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#07111f" emissive="#38bdf8" emissiveIntensity={0.26} metalness={0.22} roughness={0.28} />
      </mesh>
    </group>
  )
}

function PipelineArtifact({ accent }: { accent: string }) {
  return (
    <group>
      {[-0.64, 0, 0.64].map((x, index) => (
        <mesh key={x} position={[x, 0, 0]}>
          <sphereGeometry args={[0.2 + index * 0.035, 24, 14]} />
          <GlowMaterial accent={index === 1 ? accent : '#38bdf8'} />
        </mesh>
      ))}
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.64, 16]} />
          <GlowMaterial accent={accent} opacity={0.74} />
        </mesh>
      ))}
    </group>
  )
}

function CardsArtifact({ accent }: { accent: string }) {
  return (
    <group>
      {[-0.32, 0, 0.32].map((x, index) => (
        <mesh key={x} position={[x, 0, -index * 0.05]} rotation={[0, 0, (index - 1) * 0.16]}>
          <boxGeometry args={[0.66, 0.92, 0.055]} />
          <GlowMaterial accent={index === 1 ? accent : '#38bdf8'} opacity={0.86} />
        </mesh>
      ))}
    </group>
  )
}
