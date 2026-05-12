import { resumeContent } from '../../data/resumeContent'
import { SceneTextReveal } from '../scrolly/SceneTextReveal'

export function ContactSection() {
  return (
    <div className="scene-layout scene-layout--contact">
      <SceneTextReveal>
        <p className="eyebrow">Contact</p>
        <h2>Let&apos;s build something with a pulse.</h2>
        <a href={`mailto:${resumeContent.contact.email}`}>{resumeContent.contact.email}</a>
      </SceneTextReveal>
    </div>
  )
}
