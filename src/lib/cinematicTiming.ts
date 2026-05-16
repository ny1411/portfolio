export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

export function rangeProgress(progress: number, start: number, end: number): number {
  if (end <= start) return progress >= end ? 1 : 0
  return clamp((progress - start) / (end - start))
}

export function opacityIn(progress: number, start: number, end: number): number {
  return rangeProgress(progress, start, end)
}

export function opacityOut(progress: number, start: number, end: number): number {
  return 1 - rangeProgress(progress, start, end)
}

export function visibleInWindow(progress: number, show: number, hide: number): boolean {
  return progress >= show && progress <= hide
}
