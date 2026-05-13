import { forwardRef, type ReactNode } from 'react'

interface CinematicRevealSceneProps {
  id: string
  label: string
  children: ReactNode
  className?: string
}

export const CinematicRevealScene = forwardRef<HTMLElement, CinematicRevealSceneProps>(
  function CinematicRevealScene({ id, label, children, className = '' }, ref) {
    return (
      <section
        aria-label={label}
        className={`cinematic-scroll ${className}`.trim()}
        id={id}
        ref={ref}
      >
        <div className="cinematic-sticky">{children}</div>
      </section>
    )
  },
)
