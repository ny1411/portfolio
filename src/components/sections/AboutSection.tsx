import { resumeContent } from '../../data/resumeContent'
import { SceneTextReveal } from '../scrolly/SceneTextReveal'

export function AboutSection() {
  return (
    <div className="scene-layout scene-layout--split">
      <div className="scene-visual scene-visual--about" />
      <SceneTextReveal>
        <p className="eyebrow">About</p>
        <h2>Built for motion, clarity, and craft.</h2>
        <p>{resumeContent.summary}</p>
      </SceneTextReveal>
    </div>
  )
}
