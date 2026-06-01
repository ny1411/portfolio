import type { CinematicCardModel, CinematicTextScene } from '../types/cinematic'

const heroCards: CinematicCardModel[] = [
  {
    id: 'hero-signal',
    show: -0.12,
    hide: 0.16,
    label: 'Scene index',
    title: 'Scroll to swing',
    align: 'hero-bottom',
    animation: 'cta',
    tone: 'hero',
  },
  {
    id: 'hero-name',
    show: 0.12,
    hide: 0.4,
    label: 'Web-slinger protocol',
    title: 'Friendly\nneighborhood developer.',
    align: 'hero-left',
    animation: 'hero',
    tone: 'hero',
  },
  // {
  //   id: 'hero-build',
  //   show: 0.34,
  //   hide: 0.66,
  //   label: 'Creative signal',
  //   title: 'With great creativity\ncomes great interfaces.',
  //   align: 'hero-left',
  //   animation: 'hero',
  //   tone: 'hero',
  // },
  {
    id: 'hero-focus',
    show: 0.6,
    hide: 0.88,
    label: 'Creative Signal',
    title: 'With great creativity\ncomes great interfaces.',
    align: 'hero-right',
    animation: 'hero',
    tone: 'hero',
  },
]

const maskingCards: CinematicCardModel[] = [
  {
    id: 'masking-signal',
    show: -0.12,
    hide: 0.24,
    label: 'Scene index',
    title: 'Activate your Spidey Sense',
    align: 'hero-bottom',
    animation: 'cta',
    tone: 'hero',
  },
  {
    id: 'masking-name',
    show: 0.1,
    hide: 0.48,
    label: 'About',
    title: 'I am\nNeeraj Yamaji.',
    align: 'hero-left',
    animation: 'hero',
    tone: 'hero',
  },
  {
    id: 'masking-build',
    show: 0.39,
    hide: 0.8,
    label: 'Reality check',
    title: 'and, I am\nSpiderman',
    align: 'hero-left',
    animation: 'hero',
    tone: 'hero',
  },
  {
    id: 'masking-focus',
    show: 0.58,
    hide: 1.0,
    label: 'Protocol',
    title: 'I build\ncool designs.',
    align: 'hero-right',
    animation: 'hero',
    tone: 'hero',
  },
]

const contactCards: CinematicCardModel[] = []

export const CINEMATIC_TEXT_SCENES: Record<string, CinematicTextScene> = {
  hero: {
    id: 'hero',
    label: 'Hero',
    cards: heroCards,
  },
  'masking-parallax': {
    id: 'masking-parallax',
    label: 'Masking',
    cards: maskingCards,
  },
  contact: {
    id: 'contact',
    label: 'Contact',
    cards: contactCards,
  },
}
