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

  motion.raw = target
  motion.previousSmooth = { ...motion.smooth }
  motion.smooth = reducedMotion
    ? { x: 0, y: 0 }
    : {
        x: damp(motion.smooth.x, motion.raw.x, POINTER_LERP),
        y: damp(motion.smooth.y, motion.raw.y, POINTER_LERP),
      }
  motion.delta = {
    x: motion.smooth.x - motion.previousSmooth.x,
    y: motion.smooth.y - motion.previousSmooth.y,
  }

  const targetVelocity = reducedMotion
    ? { x: 0, y: 0 }
    : {
        x: motion.delta.x / deltaTime,
        y: motion.delta.y / deltaTime,
      }
  motion.previousVelocity = { ...motion.velocity }
  motion.velocity = {
    x: damp(motion.velocity.x, targetVelocity.x, 0.16),
    y: damp(motion.velocity.y, targetVelocity.y, 0.16),
  }
  motion.acceleration = {
    x: damp(motion.acceleration.x, (motion.velocity.x - motion.previousVelocity.x) / deltaTime, 0.08),
    y: damp(motion.acceleration.y, (motion.velocity.y - motion.previousVelocity.y) / deltaTime, 0.08),
  }

  const velocityLength = length(motion.velocity)
  motion.speed = damp(motion.speed, clamp(velocityLength / 3.2, 0, 1), 0.12)
  motion.direction =
    velocityLength > 0.025
      ? {
          x: motion.velocity.x / velocityLength,
          y: motion.velocity.y / velocityLength,
        }
      : {
          x: damp(motion.direction.x, 0, 0.08),
          y: damp(motion.direction.y, 0, 0.08),
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
