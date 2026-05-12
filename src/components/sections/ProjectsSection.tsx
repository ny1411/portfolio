import { resumeContent } from '../../data/resumeContent'
import { SceneTextReveal } from '../scrolly/SceneTextReveal'

export function ProjectsSection() {
  return (
    <div className="scene-layout">
      <SceneTextReveal>
        <p className="eyebrow">Projects</p>
        <h2>Interactive systems and product surfaces.</h2>
      </SceneTextReveal>
      <div className="project-grid">
        {resumeContent.projects.map((project) => (
          <article className="project-card" key={project.name}>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
