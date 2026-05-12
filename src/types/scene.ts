import type { ReactNode } from 'react'
import type { SequenceConfig } from './sequence'

export interface SceneConfig {
  id: string
  label: string
  pinDuration?: number
  scrollRange?: [number, number]
  sequence?: SequenceConfig
  timeline?: Record<string, unknown>
  overlays?: OverlayConfig[]
  parallaxLayers?: ParallaxLayer[]
  transitions?: TransitionConfig
  threeScene?: boolean
  lottie?: LottieConfig
  hooks?: SceneHooks
}

export interface SceneHooks {
  onEnter?: (progress: number) => void
  onLeave?: (progress: number) => void
  onProgress?: (progress: number) => void
  onActivate?: () => void
  onDeactivate?: () => void
}

export interface OverlayConfig {
  content: ReactNode
  enterAt: number
  exitAt: number
  position?: 'center' | 'left' | 'right' | 'bottom'
  animation?: 'fade-up' | 'slide-left' | 'typewriter' | 'split-text'
}

export interface ParallaxLayer {
  content: ReactNode
  speed: number
  zIndex: number
  opacity?: [number, number]
}

export interface TransitionConfig {
  enter: 'fade' | 'wipe' | 'zoom' | 'none'
  exit: 'fade' | 'wipe' | 'zoom' | 'none'
  duration?: number
}

export interface LottieConfig {
  src: string
  loop?: boolean
  autoplay?: boolean
}
