import { getDeviceProfile } from '../../../lib/performance'

const profile = getDeviceProfile()

export const SCENE_ID = 'masking-parallax'
export const POINTER_LERP = 0.075
export const SCROLL_LERP = 0.08
export const REDUCED_MOTION_PROGRESS = 0.58
export const BLOB_POINT_COUNT = profile.tier === 'low' ? 12 : profile.tier === 'mid' ? 14 : 18
export const HOVER_LERP = 0.28
export const MOBILE_INTERACTION_LERP_OUT = 0.018
export const REVEAL_LERP_IN = 0.34
export const REVEAL_LERP_OUT = 0.16
export const MOBILE_REVEAL_LERP_OUT = 0.018
