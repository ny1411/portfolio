import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import type { CinematicCardModel } from '../../types/cinematic'

interface CinematicCardProps {
  card: CinematicCardModel
  visible: boolean
  variant?: 'desktop' | 'mobile'
  index?: number
  cardRef?: (node: HTMLElement | null) => void
}

export function CinematicCard({
  card,
  visible,
  variant = 'desktop',
  index = 0,
  cardRef,
}: CinematicCardProps) {
  const animation = card.animation ?? 'fade-slide'
  const tone = card.tone ?? 'neutral'
  const style = { '--card-order': String(index) } as CSSProperties
  const title = card.title ?? card.quote
  const isExpandableCluster = card.animation === 'list' && card.tone === 'tool'
  const [expanded, setExpanded] = useState(false)
  const body = !isExpandableCluster && card.body ? <p>{card.body}</p> : null
  const tagList = card.tags ? (
    <motion.div
      animate={
        isExpandableCluster
          ? {
              maxHeight: expanded ? 180 : 24,
            }
          : undefined
      }
      className="cinematic-card__tags"
      transition={{ duration: 0.2, ease: 'easeOut' }}
      aria-hidden="true"
    >
      {card.tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </motion.div>
  ) : null

  return (
    <div
      className={`cinematic-card-shell cinematic-card-shell--${card.align} cinematic-card-shell--${variant}`}
      style={style}
    >
      <motion.figure
        animate={
          isExpandableCluster
            ? {
                height: expanded ? 'auto' : undefined,
                minHeight: expanded ? 132 : undefined,
                y: expanded ? 'var(--cluster-expand-y)' : 0,
              }
            : undefined
        }
        className={`cinematic-card cinematic-card--${tone} cinematic-card--${animation} ${
          visible ? 'is-visible' : ''
        } ${isExpandableCluster ? 'cinematic-card--expandable' : ''}`}
        layout={isExpandableCluster}
        onBlur={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onHoverEnd={() => setExpanded(false)}
        onHoverStart={() => setExpanded(true)}
        ref={cardRef}
        aria-hidden={!visible}
        tabIndex={isExpandableCluster && visible ? 0 : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <span className="cinematic-card__label">{card.label}</span>
        {title && <blockquote>{title}</blockquote>}
        {body}
        {tagList}
        {(card.speaker || card.meta || card.cta) && (
          <figcaption>
            <span>{card.speaker ?? card.cta}</span>
            <span>{card.meta}</span>
          </figcaption>
        )}
        {card.href && card.cta && (
          <a className="cinematic-card__link" href={card.href}>
            {card.cta}
          </a>
        )}
      </motion.figure>
    </div>
  )
}
