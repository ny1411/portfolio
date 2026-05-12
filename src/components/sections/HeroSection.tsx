import { Suspense, lazy, useMemo } from 'react'
import { resumeContent } from '../../data/resumeContent'
import { SceneTextReveal } from '../scrolly/SceneTextReveal'
import { useReducedMotion } from '../scrolly/useReducedMotion'

const HeroThreeScene = lazy(() =>
  import('../three/HeroThreeScene').then((module) => ({ default: module.HeroThreeScene })),
)

export function HeroSection() {
  const reducedMotion = useReducedMotion()
  const supportsWebGL = useMemo(() => {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  }, [])

  return (
    <div className="scene-layout scene-layout--hero">
      {supportsWebGL && !reducedMotion ? (
        <Suspense fallback={<div className="hero-three-fallback" />}>
          <HeroThreeScene />
        </Suspense>
      ) : null}
      <div className="hero-copy">
        <SceneTextReveal>
          <p className="eyebrow">Cinematic Portfolio</p>
          <h1>{resumeContent.name}</h1>
          <p>{resumeContent.title}</p>
        </SceneTextReveal>
      </div>
    </div>
  )
}
