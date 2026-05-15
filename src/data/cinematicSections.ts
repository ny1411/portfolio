import { resumeContent } from './resumeContent'
import type { CinematicCardModel, CinematicTextScene } from '../types/cinematic'

const overviewPage = resumeContent.resumePages.find((page) => page.id === 'overview')
const profilePage = resumeContent.resumePages.find((page) => page.id === 'profile-focus')
const technicalPage = resumeContent.resumePages.find((page) => page.id === 'technical-range')
const contactPage = resumeContent.resumePages.find((page) => page.id === 'contact')

const contactLines = contactPage?.body ?? []
const emailLine = contactLines.find((line) => line.startsWith('Email:'))
const contactEmail = emailLine?.replace('Email:', '').trim() ?? 'neerajyamaji@gmail.com'

const skillGroupLabels: Record<keyof typeof resumeContent.skillsAndStack, string> = {
  languages: 'Languages',
  frontend: 'Frontend UI',
  backendApis: 'Backend + APIs',
  cloudDatabases: 'Cloud + Data',
  developerTools: 'Developer Tools',
}

const skillGroups = Object.entries(resumeContent.skillsAndStack).map(([key, skills]) => ({
  id: key,
  title: skillGroupLabels[key as keyof typeof resumeContent.skillsAndStack],
  skills: [...skills],
}))
const skillStep = skillGroups.length > 1 ? 0.64 / (skillGroups.length - 1) : 0

const heroCards: CinematicCardModel[] = [
  {
    id: 'hero-signal',
    show: -0.12,
    hide: 0.16,
    label: 'Scene index',
    title: 'Scroll to explore',
    align: 'hero-bottom',
    animation: 'cta',
    tone: 'hero',
  },
  {
    id: 'hero-name',
    show: 0.12,
    hide: 0.4,
    label: 'Portfolio systems online',
    title: `I am\n${overviewPage?.title ?? 'Neeraj Yamaji'}.`,
    align: 'hero-left',
    animation: 'hero',
    tone: 'hero',
  },
  {
    id: 'hero-build',
    show: 0.34,
    hide: 0.66,
    label: 'Protocol',
    title: 'Build\nwith Neeraj',
    align: 'hero-left',
    animation: 'hero',
    tone: 'hero',
  },
  {
    id: 'hero-focus',
    show: 0.6,
    hide: 0.88,
    label: 'Final frame',
    title: 'I build\nclean interfaces.',
    align: 'hero-right',
    animation: 'hero',
    tone: 'hero',
  },
]

const aboutCards: CinematicCardModel[] = [
  {
    id: 'about-craft',
    show: 0.08,
    hide: 0.42,
    label: 'About',
    title: 'Built for motion, clarity, and craft.',
    body: profilePage?.summary ?? profilePage?.subtitle,
    speaker: 'Design system',
    meta: 'Signal',
    align: 'stage-right',
    animation: 'stack',
    tone: 'neutral',
  },
  {
    id: 'about-method',
    show: 0.46,
    hide: 0.82,
    label: 'Method',
    title: 'Interfaces that stay readable while the scene moves.',
    body: 'Dense information gets anchored in cards while the camera and frame sequence carry the atmosphere.',
    speaker: 'Layout weight',
    meta: 'Balanced',
    align: 'stage-left',
    animation: 'stack',
    tone: 'neutral',
  },
]

const experienceCards: CinematicCardModel[] = resumeContent.workExperiences.map((item, index) => ({
  id: `experience-${index}`,
  show: index === 0 ? 0.12 : 0.52,
  hide: index === 0 ? 0.46 : 0.86,
  label: item.subtitle,
  title: item.title,
  body: item.body.join(' '),
  speaker: 'Experience',
  meta: 'Experience',
  tags: [...item.tags],
  href: item.link,
  cta: 'View certificate',
  align: index % 2 === 0 ? 'stage-right' : 'stage-left',
  animation: 'stack',
  tone: 'experience',
}))

const projectCards: CinematicCardModel[] = resumeContent.projectItems.map((project, index) => ({
  id: `project-${index}`,
  show: index === 0 ? 0.1 : 0.5,
  hide: index === 0 ? 0.44 : 0.84,
  label: `Project 0${index + 1}`,
  title: project.title,
  body: project.body.join(' '),
  speaker: 'Portfolio case',
  meta: project.stack.slice(0, 3).join(' / '),
  tags: [...project.stack],
  href: project.links[0]?.href,
  cta: project.links[0]?.label,
  align: index % 2 === 0 ? 'stage-left' : 'stage-right',
  animation: 'stack',
  tone: 'project',
}))

const skillCards: CinematicCardModel[] = [
  {
    id: 'tools-heading',
    show: 0.04,
    hide: 0.92,
    label: 'Tools',
    title: 'A practical stack for polished web products.',
    body: 'Frontend craft leads the system, backed by API, data, cloud, and AI tooling for complete product workflows.',
    speaker: `${skillGroups.length} grouped capabilities`,
    meta: 'Stack',
    align: 'stage-left',
    animation: 'stack',
    tone: 'tool',
  },
  ...skillGroups.map((group, index) => ({
    id: `skill-${group.id}`,
    show: 0.14 + index * skillStep,
    hide: 0.98,
    label: `Cluster ${String(index + 1).padStart(2, '0')}`,
    title: group.title,
    tags: group.skills,
    speaker: 'Stack',
    meta: 'Ready',
    align: 'list' as const,
    animation: 'list' as const,
    tone: 'tool' as const,
    persist: true,
  })),
]

const contactCards: CinematicCardModel[] = [
  {
    id: 'contact-pulse',
    show: 0.08,
    hide: 0.48,
    label: 'Contact',
    title: "Let's build something with a pulse.",
    body: 'The final scene keeps the call to action readable while the sequence resolves.',
    speaker: 'Open channel',
    meta: 'Final',
    align: 'center',
    animation: 'cta',
    tone: 'contact',
  },
  {
    id: 'contact-email',
    show: 0.52,
    hide: 0.94,
    label: 'Direct signal',
    title: contactEmail,
    body: technicalPage?.subtitle ?? 'Available for polished interfaces, cinematic product surfaces, and production-grade React work.',
    speaker: 'Email',
    meta: 'Ready',
    href: `mailto:${contactEmail}`,
    cta: 'Start a conversation',
    align: 'bottom',
    animation: 'cta',
    tone: 'contact',
  },
]

export const CINEMATIC_TEXT_SCENES: Record<string, CinematicTextScene> = {
  hero: {
    id: 'hero',
    label: 'Hero',
    cards: heroCards,
  },
  about: {
    id: 'about',
    label: 'About',
    cards: aboutCards,
  },
  experience: {
    id: 'experience',
    label: 'Experience',
    cards: experienceCards,
  },
  projects: {
    id: 'projects',
    label: 'Projects',
    cards: projectCards,
  },
  skills: {
    id: 'tools',
    label: 'Tools',
    cards: skillCards,
  },
  contact: {
    id: 'contact',
    label: 'Contact',
    cards: contactCards,
  },
}
