import { resumeContent } from '../../data/resumeContent'
import { SceneTextReveal } from '../scrolly/SceneTextReveal'

export function SkillsSection() {
  return (
    <div className="scene-layout">
      <SceneTextReveal>
        <p className="eyebrow">Skills</p>
        <h2>Tools for expressive, production-grade interfaces.</h2>
      </SceneTextReveal>
      <div className="skill-grid">
        {resumeContent.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </div>
  )
}
