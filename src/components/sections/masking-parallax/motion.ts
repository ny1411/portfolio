import { POINTER_LERP } from './constants'
import { clamp, damp, length } from './math'
import type { MotionState, Point } from './types'

export function updateMotionState(
  motion: MotionState,
  target: Point,
  time: number,
  reducedMotion: boolean,
): MotionState {
  const lastTime = motion.lastTime || time
  const deltaTime = clamp((time - lastTime) / 1000, 0.001, 0.05)

  motion.raw.x = target.x
  motion.raw.y = target.y

  motion.previousSmooth.x = motion.smooth.x
  motion.previousSmooth.y = motion.smooth.y

  if (reducedMotion) {
    motion.smooth.x = 0
    motion.smooth.y = 0
  } else {
    motion.smooth.x = damp(motion.smooth.x, motion.raw.x, POINTER_LERP)
    motion.smooth.y = damp(motion.smooth.y, motion.raw.y, POINTER_LERP)
  }

  motion.delta.x = motion.smooth.x - motion.previousSmooth.x
  motion.delta.y = motion.smooth.y - motion.previousSmooth.y

  const targetVelocityX = reducedMotion ? 0 : motion.delta.x / deltaTime
  const targetVelocityY = reducedMotion ? 0 : motion.delta.y / deltaTime

  motion.previousVelocity.x = motion.velocity.x
  motion.previousVelocity.y = motion.velocity.y

  motion.velocity.x = damp(motion.velocity.x, targetVelocityX, 0.16)
  motion.velocity.y = damp(motion.velocity.y, targetVelocityY, 0.16)

  motion.acceleration.x = damp(motion.acceleration.x, (motion.velocity.x - motion.previousVelocity.x) / deltaTime, 0.08)
  motion.acceleration.y = damp(motion.acceleration.y, (motion.velocity.y - motion.previousVelocity.y) / deltaTime, 0.08)

  const velocityLength = length(motion.velocity)
  motion.speed = damp(motion.speed, clamp(velocityLength / 3.2, 0, 1), 0.12)

  if (velocityLength > 0.025) {
    motion.direction.x = motion.velocity.x / velocityLength
    motion.direction.y = motion.velocity.y / velocityLength
  } else {
    motion.direction.x = damp(motion.direction.x, 0, 0.08)
    motion.direction.y = damp(motion.direction.y, 0, 0.08)
  }
  motion.idleMs = Math.max(0, time - motion.lastPointerTime)
  motion.lastTime = time

  return motion
}

export function createMotionState(): MotionState {
  return {
    acceleration: { x: 0, y: 0 },
    delta: { x: 0, y: 0 },
    direction: { x: 0, y: 0 },
    idleMs: 1000,
    lastPointerTime: 0,
    lastTime: 0,
    previousSmooth: { x: 0, y: 0 },
    previousVelocity: { x: 0, y: 0 },
    raw: { x: 0, y: 0 },
    smooth: { x: 0, y: 0 },
    speed: 0,
    velocity: { x: 0, y: 0 },
  }
}
