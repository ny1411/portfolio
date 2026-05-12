import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SceneTextRevealProps {
  children: ReactNode
  delay?: number
}

export function SceneTextReveal({ children, delay = 0 }: SceneTextRevealProps) {
  return (
    <motion.div
      className="scene-text-reveal"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.35 }}
      transition={{ duration: 0.65, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
