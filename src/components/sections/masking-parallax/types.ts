export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface ViewportSnapshot {
  width: number
  height: number
  pointerFine: boolean
  mobile: boolean
  tablet: boolean
}

export interface MotionState {
  raw: Point
  smooth: Point
  previousSmooth: Point
  delta: Point
  velocity: Point
  previousVelocity: Point
  acceleration: Point
  direction: Point
  speed: number
  idleMs: number
  lastTime: number
  lastPointerTime: number
}

export interface HeroGeometry {
  frame: Rect
  mask: Rect
  plate: Point
  reveal: Point & { origin: Point; scale: number }
  variables: Record<string, string>
}
