import { useEffect, useMemo, useRef, useState } from 'react'
import { clamp, rangeProgress, visibleInWindow } from '../../lib/cinematicTiming'
import { rafScheduler } from '../../lib/rafScheduler'
import type { CinematicCardModel, CinematicTextScene } from '../../types/cinematic'
import { CinematicCard } from './CinematicCard'
import { useSceneProgress } from './useSceneProgress'

interface CinematicSceneOverlayProps {
  config?: CinematicTextScene
  sceneId: string
}

export function CinematicSceneOverlay({ config, sceneId }: CinematicSceneOverlayProps) {
  const progressRef = useSceneProgress(sceneId)
  const cardRefs = useRef(new Map<string, HTMLElement>())
  const previousVisibleIdsRef = useRef('')
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set())

  const cards = useMemo(() => config?.cards ?? [], [config])

  useEffect(() => {
    if (!config) return

    return rafScheduler.schedule(() => {
      const progress = progressRef.current
      const nextVisibleIds = new Set<string>()

      for (const card of cards) {
        const node = cardRefs.current.get(card.id)
        const opacity = getCardOpacity(card, progress)
        const motion = getCardMotion(card, opacity)

        if (opacity > 0.01 || visibleInWindow(progress, card.show, card.hide)) {
          nextVisibleIds.add(card.id)
        }

        if (!node) continue

        node.style.setProperty('--card-opacity', opacity.toFixed(3))
        node.style.setProperty('--card-y', `${motion.y.toFixed(1)}px`)
        node.style.setProperty('--card-x', `${motion.x.toFixed(1)}px`)
        node.style.setProperty('--card-scale', motion.scale.toFixed(3))
      }

      const nextIds = [...nextVisibleIds].sort().join(',')
      if (nextIds === previousVisibleIdsRef.current) return

      previousVisibleIdsRef.current = nextIds
      setVisibleIds(nextVisibleIds)
    }, 8)
  }, [cards, config, progressRef])

  if (!config) return null

  return (
    <div
      className={`cinematic-section-cards cinematic-section-cards--${config.id}`}
      aria-label={`${config.label} cinematic text`}
    >
      {cards.map((card, index) => (
        <CinematicCard
          card={card}
          cardRef={(node) => {
            if (node) cardRefs.current.set(card.id, node)
            else cardRefs.current.delete(card.id)
          }}
          index={index}
          key={card.id}
          visible={visibleIds.has(card.id)}
        />
      ))}
    </div>
  )
}

function getCardOpacity(card: CinematicCardModel, progress: number): number {
  const duration = Math.max(0.001, card.hide - card.show)
  const fade = Math.min(0.1, Math.max(0.035, duration * 0.25))
  const fadeIn = rangeProgress(progress, card.show, Math.min(card.hide, card.show + fade))
  const fadeOut = card.persist
    ? 1
    : 1 - rangeProgress(progress, Math.max(card.show, card.hide - fade), card.hide)

  return clamp(Math.min(fadeIn, fadeOut))
}

function getCardMotion(card: CinematicCardModel, opacity: number): {
  x: number
  y: number
  scale: number
} {
  const hidden = 1 - opacity

  switch (card.animation) {
    case 'hero':
      return { x: 0, y: hidden * 30, scale: 0.985 + opacity * 0.015 }
    case 'stack':
      return {
        x: card.align === 'stage-left' || card.align === 'left' ? hidden * -18 : hidden * 18,
        y: hidden * 20,
        scale: 0.99 + opacity * 0.01,
      }
    case 'list':
      return { x: hidden * 22, y: hidden * 12, scale: 1 }
    case 'cta':
      return { x: 0, y: hidden * 18, scale: 0.98 + opacity * 0.02 }
    default:
      return { x: 0, y: hidden * 22, scale: 1 }
  }
}
