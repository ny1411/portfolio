import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'
import { useScrollStore } from '../scrolly/scrollStore'

export function HeroThreeScene() {
  return (
    <Canvas className="hero-three-canvas" camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.7} />
      <pointLight intensity={2} position={[3, 4, 5]} />
      <HeroMesh />
    </Canvas>
  )
}

function HeroMesh() {
  const meshRef = useRef<Mesh>(null)

  useFrame(({ camera }) => {
    const progress = useScrollStore.getState().sceneProgress
    if (meshRef.current) {
      meshRef.current.rotation.x = progress * Math.PI
      meshRef.current.rotation.y += 0.006
    }

    camera.position.x += (Math.sin(progress * Math.PI * 2) * 1.2 - camera.position.x) * 0.04
    camera.lookAt(0, 0, 0)
  })

  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.65, 5]} />
        <MeshDistortMaterial
          color="#22c55e"
          distort={0.24}
          emissive="#0f766e"
          emissiveIntensity={0.35}
          metalness={0.18}
          roughness={0.22}
          wireframe
        />
      </mesh>
    </Float>
  )
}
