import { resumeContent } from '../../data/resumeContent'
import { SceneTextReveal } from '../scrolly/SceneTextReveal'

export function HeroSection() {
  return (
    <div className="scene-layout scene-layout--hero">
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
