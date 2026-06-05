import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Orbit, X } from 'lucide-react'
import { useEffect, type CSSProperties } from 'react'
import {
  getProjectPortal,
  openPortalDestination,
  projectPortals,
  type ProjectPortal,
} from './projectPortalData'
import { useProjectMultiverseStore } from './useProjectMultiverseStore'

export function ProjectMultiverseOverlay() {
  const focusedPortalId = useProjectMultiverseStore((state) => state.focusedPortalId)
  const focusPortal = useProjectMultiverseStore((state) => state.focusPortal)
  const deactivatePortal = useProjectMultiverseStore((state) => state.deactivatePortal)
  const focusedPortal = getProjectPortal(focusedPortalId)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && focusedPortalId) deactivatePortal()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deactivatePortal, focusedPortalId])

  const activatePortal = (portal: ProjectPortal) => {
    if (focusedPortalId === portal.id) {
      openPortalDestination(portal)
      return
    }

    focusPortal(portal.id)
  }

  return (
    <div className="project-multiverse-ui">
      <header className="project-multiverse-ui__heading">
        <span className="project-multiverse-ui__signal">
          <Orbit aria-hidden="true" size={15} />
          Project Multiverse
        </span>
        <h2>Discover Projects Through Portals.</h2>
        <p>Drag to inspect. Click to enter.</p>
      </header>

      <nav className="project-multiverse-ui__rail" aria-label="Project portals">
        {projectPortals.map((portal, index) => (
          <button
            aria-pressed={portal.id === focusedPortalId}
            className={portal.id === focusedPortalId ? 'is-active' : undefined}
            key={portal.id}
            onClick={() => activatePortal(portal)}
            style={{ '--portal-color': portal.primaryColor } as CSSProperties}
            type="button"
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{portal.title}</strong>
            <small>{portal.id === focusedPortalId ? 'Enter universe' : portal.label}</small>
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {focusedPortal && (
          <motion.article
            animate={{ opacity: 1, x: 0, y: 0 }}
            className="project-portal-card"
            exit={{ opacity: 0, x: 20, y: 12 }}
            initial={{ opacity: 0, x: 24, y: 16 }}
            key={focusedPortal.id}
            style={{ '--portal-color': focusedPortal.primaryColor } as CSSProperties}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              aria-label="Close project portal"
              className="project-portal-card__close"
              onClick={deactivatePortal}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
            <div className="project-portal-card__code">{focusedPortal.universeCode}</div>
            <h3>{focusedPortal.title}</h3>
            <span className="project-portal-card__signature">{focusedPortal.signature}</span>
            <p>{focusedPortal.summary}</p>
            <div className="project-portal-card__tags" aria-label="Technology stack">
              {focusedPortal.stack.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="project-portal-card__actions">
              <button onClick={() => openPortalDestination(focusedPortal)} type="button">
                <ExternalLink aria-hidden="true" size={14} />
                Enter universe
              </button>
              {focusedPortal.links.map((link) => (
                <a href={link.href} key={link.href} rel="noreferrer" target="_blank">
                  {link.label}
                </a>
              ))}
            </div>
            <small className="project-portal-card__instruction">
              Click the activated portal again to travel.
            </small>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  )
}
