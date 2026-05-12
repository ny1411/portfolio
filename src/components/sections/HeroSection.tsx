import { Suspense, lazy } from 'react'
import { resumeContent } from '../../data/resumeContent'
import { SceneTextReveal } from '../scrolly/SceneTextReveal'

const HeroThreeScene = lazy(() =>
  import('../three/HeroThreeScene').then((module) => ({ default: module.HeroThreeScene })),
)

export function HeroSection() {
  return (
    <div className="scene-layout scene-layout--hero">
      <Suspense fallback={<div className="hero-three-fallback" />}>
        <HeroThreeScene />
      </Suspense>
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
