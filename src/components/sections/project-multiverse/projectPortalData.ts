import { resumeContent } from '../../../data/resumeContent'

export interface ProjectPortal {
  id: string
  title: string
  label: string
  summary: string
  stack: readonly string[]
  links: readonly { label: string; href: string }[]
  primaryHref: string
  position: readonly [number, number, number]
  focusPosition: readonly [number, number, number]
  tunnelBend: readonly [number, number]
  revealAt: number
  primaryColor: string
  secondaryColor: string
  universeCode: string
  signature: string
  audioCueUrl?: string
}

const portalTreatments = [
  {
    label: 'Artificial Intelligence',
    position: [0.4, 0.82, -2.85] as const,
    focusPosition: [0.4, 0.8, 0.48] as const,
    tunnelBend: [1.72, 1.28] as const,
    revealAt: 0.012,
    primaryColor: '#28e7ff',
    secondaryColor: '#a855f7',
    universeCode: 'EARTH-AI-01',
    signature: 'Repository intelligence / security scan',
  },
  {
    label: 'Realtime Connection',
    position: [3.32, -0.68, -3.15] as const,
    focusPosition: [3.32, -0.66, 0.18] as const,
    tunnelBend: [1.86, -1.34] as const,
    revealAt: 0.022,
    primaryColor: '#ff3864',
    secondaryColor: '#22d3ee',
    universeCode: 'EARTH-MATCH-02',
    signature: 'Compatibility engine / motion UI',
  },
] as const

export const projectPortals: readonly ProjectPortal[] = resumeContent.projectItems.map(
  (project, index) => {
    const treatment = portalTreatments[index] ?? portalTreatments[portalTreatments.length - 1]
    const liveDemo = project.links.find((link) => link.label === 'Live demo')
    const primaryLink = project.title === 'Repolyse' && liveDemo ? liveDemo : project.links[0]

    return {
      id: project.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
      title: project.title,
      label: treatment.label,
      summary: project.body.join(' '),
      stack: project.stack,
      links: project.links,
      primaryHref: primaryLink.href,
      position: treatment.position,
      focusPosition: treatment.focusPosition,
      tunnelBend: treatment.tunnelBend,
      revealAt: treatment.revealAt,
      primaryColor: treatment.primaryColor,
      secondaryColor: treatment.secondaryColor,
      universeCode: treatment.universeCode,
      signature: treatment.signature,
    }
  },
)

export function getProjectPortal(id: string | null): ProjectPortal | undefined {
  return projectPortals.find((portal) => portal.id === id)
}

export function openPortalDestination(portal: ProjectPortal): void {
  window.open(portal.primaryHref, '_blank', 'noopener,noreferrer')
}
