import type { Point } from './types'

export function damp(current: number, target: number, amount: number): number {
  return current + (target - current) * amount
}

export function easeOutCubic(value: number): number {
  const clamped = clamp(value, 0, 1)
  return 1 - Math.pow(1 - clamped, 3)
}

export function easeInOutCubic(value: number): number {
  const clamped = clamp(value, 0, 1)

  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2
}

export function length(point: Point): number {
  return Math.hypot(point.x, point.y)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function px(value: number): string {
  return `${value.toFixed(2)}px`
}

export function pxNumber(value: number): string {
  return value.toFixed(2)
}

export function fmt(value: number): string {
  return value.toFixed(2)
}
