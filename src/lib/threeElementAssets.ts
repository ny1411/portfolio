import hybridSuitUrl from '../assets/3d-elements/spider-man - hybrid suit.glb?url'
import peterParkerPhotographerSuitUrl from '../assets/3d-elements/spider-man - peter_parker_the_photographer suit.glb?url'
import ultimateSuitUrl from '../assets/3d-elements/spider-man - ultimate suit.glb?url'
import spiderLogoUrl from '../assets/3d-elements/spider_logo3d.glb?url'

export const threeElementAssets = {
  suits: {
    peterParkerPhotographer: peterParkerPhotographerSuitUrl,
    ultimate: ultimateSuitUrl,
    hybrid: hybridSuitUrl,
  },
  logo: spiderLogoUrl,
} as const

export const allThreeElementAssetUrls = [
  threeElementAssets.suits.peterParkerPhotographer,
  threeElementAssets.suits.ultimate,
  threeElementAssets.suits.hybrid,
  threeElementAssets.logo,
] as const
