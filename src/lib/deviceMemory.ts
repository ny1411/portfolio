export type DeviceMemoryTier = 'unknown' | 'very-low' | 'low' | 'mid' | 'high'

interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number
}

export function getDeviceMemoryGb(): number | undefined {
  if (typeof navigator === 'undefined') return undefined

  const memory = (navigator as NavigatorWithDeviceMemory).deviceMemory
  if (typeof memory !== 'number' || !Number.isFinite(memory) || memory <= 0) {
    return undefined
  }

  return memory
}

export function getDeviceMemoryTier(memoryGb = getDeviceMemoryGb()): DeviceMemoryTier {
  if (memoryGb === undefined) return 'unknown'
  if (memoryGb >= 8) return 'high'
  if (memoryGb >= 4) return 'mid'
  if (memoryGb >= 2) return 'low'

  return 'very-low'
}

export function getAdaptiveDecodedFrameCacheSize(memoryGb = getDeviceMemoryGb()): number {
  switch (getDeviceMemoryTier(memoryGb)) {
    case 'high':
      return 300
    case 'mid':
      return 220
    case 'low':
      return 120
    case 'very-low':
      return 80
    case 'unknown':
    default:
      return 160
  }
}
