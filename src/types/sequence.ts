export interface SequenceConfig {
  folder: string
  prefix: string
  startIndex: number
  endIndex: number
  extension?: 'jpg' | 'webp' | 'avif'
  preloadStrategy?: 'eager' | 'lazy' | 'viewport'
  preloadRadius?: number
  interpolation?: 'nearest' | 'linear'
  scrollVhPerFrame?: number
  smoothing?: number
  maxFrameStep?: number
}

export interface ScrollRange {
  start: string
  end: string
  scrub: number | boolean
}

export interface CachedFrame {
  key: string
  sceneId: string
  frame: ImageBitmap | HTMLImageElement
  priority: number
}
