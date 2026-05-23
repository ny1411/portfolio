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
  | 'hero'
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

export interface CinematicTextScene {
  id: string
  label: string
  cards: CinematicCardModel[]
}
