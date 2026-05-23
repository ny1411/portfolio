import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Cpu, Hexagon, Radio, type LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { ExperienceCard } from './ExperienceCard'
import { suitEvolutionExperiences } from './suitEvolutionData'
import { useSuitEvolutionStore } from './useSuitEvolutionStore'

export function HUDOverlay() {
  const activeSuitIndex = useSuitEvolutionStore((state) => state.activeSuitIndex)
  const sectionProgress = useSuitEvolutionStore((state) => state.sectionProgress)
  const transitionProgress = useSuitEvolutionStore((state) => state.transitionProgress)
  const scrollVelocity = useSuitEvolutionStore((state) => state.scrollVelocity)
  const activeExperience = suitEvolutionExperiences[activeSuitIndex] ?? suitEvolutionExperiences[0]
  const progressPercent = Math.round(sectionProgress * 100)
  const velocitySignal = Math.min(100, Math.round(Math.abs(scrollVelocity) * 28))
  const reconstructionSignal = Math.round(transitionProgress * 100)

  return (
    <div className="suit-hud" style={{ '--suit-accent': activeExperience.accent } as CSSProperties}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="suit-hud__kicker"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Hexagon aria-hidden="true" size={15} />
        <span>Suit Evolution</span>
      </motion.div>

      <AnimatePresence mode="wait">
        <ExperienceCard experience={activeExperience} key={activeExperience.id} />
      </AnimatePresence>

      <div className="suit-hud__systems" aria-hidden="true">
        <SystemMeter Icon={Activity} label="Progress" value={progressPercent} />
        <SystemMeter Icon={Radio} label="Velocity" value={velocitySignal} />
        <SystemMeter Icon={Cpu} label="Rebuild" value={reconstructionSignal} />
      </div>

      <div className="suit-hud__rail" aria-label="Suit progression">
        {suitEvolutionExperiences.map((experience, index) => (
          <div
            className={`suit-hud__rail-item ${index === activeSuitIndex ? 'is-active' : ''}`}
            key={experience.id}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{experience.company}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SystemMeterProps {
  Icon: LucideIcon
  label: string
  value: number
}

function SystemMeter({ Icon, label, value }: SystemMeterProps) {
  return (
    <div className="suit-hud__meter">
      <Icon aria-hidden="true" size={14} />
      <span>{label}</span>
      <strong>{value}%</strong>
      <i style={{ transform: `scaleX(${value / 100})` }} />
    </div>
  )
}
