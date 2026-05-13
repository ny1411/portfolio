import type { CSSProperties } from 'react'
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

  return (
    <div
      className={`cinematic-card-shell cinematic-card-shell--${card.align} cinematic-card-shell--${variant}`}
      style={style}
    >
      <figure
        className={`cinematic-card cinematic-card--${tone} cinematic-card--${animation} ${
          visible ? 'is-visible' : ''
        }`}
        ref={cardRef}
        aria-hidden={!visible}
      >
        <span className="cinematic-card__label">{card.label}</span>
        {title && <blockquote>{title}</blockquote>}
        {card.body && <p>{card.body}</p>}
        {card.tags && (
          <div className="cinematic-card__tags" aria-hidden="true">
            {card.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
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
      </figure>
    </div>
  )
}
