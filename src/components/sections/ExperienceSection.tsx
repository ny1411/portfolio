import { resumeContent } from '../../data/resumeContent'
import { SceneTextReveal } from '../scrolly/SceneTextReveal'

export function ExperienceSection() {
  return (
    <div className="scene-layout">
      <SceneTextReveal>
        <p className="eyebrow">Experience</p>
        <h2>Selected work history.</h2>
      </SceneTextReveal>
      <div className="timeline-grid">
        {resumeContent.experience.map((item) => (
          <article className="timeline-card" key={`${item.company}-${item.role}`}>
            <span>{item.period}</span>
            <h3>{item.role}</h3>
            <p>{item.company}</p>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
