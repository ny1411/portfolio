import { motion } from 'framer-motion'
import { Building2, ExternalLink, ShieldCheck, Timer } from 'lucide-react'
import type { SuitEvolutionExperience } from './suitEvolutionData'

interface ExperienceCardProps {
  experience: SuitEvolutionExperience
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <motion.article
      animate={{ opacity: 1, x: 0, y: 0 }}
      className="suit-hud-card"
      exit={{ opacity: 0, x: -16, y: 10 }}
      initial={{ opacity: 0, x: -22, y: 16 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="suit-hud-card__corner suit-hud-card__corner--tl" />
      <span className="suit-hud-card__corner suit-hud-card__corner--tr" />
      <span className="suit-hud-card__corner suit-hud-card__corner--bl" />
      <span className="suit-hud-card__corner suit-hud-card__corner--br" />
      <div className="suit-hud-card__scan" aria-hidden="true" />

      <div className="suit-hud-card__header">
        <span>{experience.stage}</span>
        <span>{experience.suitClass}</span>
      </div>

      <h2>{experience.experienceHeadline}</h2>

      <dl className="suit-hud-card__meta">
        <div>
          <Building2 aria-hidden="true" size={16} />
          <dt>Company</dt>
          <dd>{experience.company}</dd>
        </div>
        <div>
          <ShieldCheck aria-hidden="true" size={16} />
          <dt>Role</dt>
          <dd>{experience.role}</dd>
        </div>
        <div>
          <Timer aria-hidden="true" size={16} />
          <dt>Duration</dt>
          <dd>{experience.duration}</dd>
        </div>
      </dl>

      <p>{experience.summary}</p>

      <div className="suit-hud-card__tags" aria-label="Tech stack">
        {experience.tags.map((tag) => (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            key={tag}
            transition={{ duration: 0.24 }}
          >
            {tag}
          </motion.span>
        ))}
      </div>

      {experience.href && (
        <a className="suit-hud-card__link" href={experience.href} rel="noreferrer" target="_blank">
          <ExternalLink aria-hidden="true" size={15} />
          Certificate
        </a>
      )}
    </motion.article>
  )
}
