import type { SequenceConfig } from './sequence'

export type CinematicBeatAlign =
  | 'left'
  | 'right'
  | 'center'
  | 'bottom'
  | 'hero-left'
  | 'hero-right'
  | 'hero-bottom'
  | 'stage-left'
  | 'stage-right'
  | 'list'

export type CinematicCardAnimation =
  | 'fade-slide'
  | 'hero'
  | 'stack'
  | 'list'
  | 'cta'

export type CinematicCardTone =
  | 'spider'
  | 'hero'
  | 'experience'
  | 'project'
  | 'tool'
  | 'contact'
  | 'neutral'

export interface CinematicCardModel {
  id: string
  show: number
  hide: number
  label: string
  quote?: string
  title?: string
  body?: string
  speaker?: string
  meta?: string
  tags?: string[]
  href?: string
  cta?: string
  align: CinematicBeatAlign
  animation?: CinematicCardAnimation
  tone?: CinematicCardTone
  persist?: boolean
}

export type CinematicBeat = CinematicCardModel

export interface CinematicTextScene {
  id: string
  label: string
  cards: CinematicCardModel[]
}

export interface CinematicTheme {
  id: 'spiderman' | 'ironman' | 'batman' | string
  label: string
  frameCount: number
  framePath: (n: number) => string
  sequence: SequenceConfig
  beats: CinematicBeat[]
  headings: {
    primary: string
    secondary: string
    primaryFade: [number, number]
    secondaryFade: [number, number]
  }
  outro: {
    show: number
    full: number
    label: string
    cta: string
    href: string
  }
}
