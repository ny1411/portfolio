export interface DeviceProfile {
  tier: 'low' | 'mid' | 'high'
  maxDPR: number
  maxFrames: number
  prefersReducedMotion: boolean
  isLowPower: boolean
}

export function getDeviceProfile(): DeviceProfile {
  if (typeof window === 'undefined') {
    return {
      tier: 'mid',
      maxDPR: 1,
      maxFrames: 120,
      prefersReducedMotion: false,
      isLowPower: false,
    }
  }

  const cores = navigator.hardwareConcurrency ?? 4
  const memory = 'deviceMemory' in navigator ? Number(navigator.deviceMemory) : 4
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isTouch = window.matchMedia('(pointer: coarse)').matches
  const isLowPower = cores <= 4 || memory <= 4 || isTouch
  const tier = cores >= 8 && memory >= 8 ? 'high' : isLowPower ? 'low' : 'mid'

  return {
    tier,
    maxDPR: tier === 'high' ? 2 : tier === 'mid' ? 1.5 : 1,
    maxFrames: tier === 'high' ? 180 : tier === 'mid' ? 120 : 72,
    prefersReducedMotion,
    isLowPower,
  }
}
