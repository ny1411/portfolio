import type { SceneConfig } from '../types/scene'
import type { SequenceConfig } from '../types/sequence'
import {
  projectPortalAssetUrls,
  skillModelAssetUrls,
  suitModelAssetUrls,
} from './threeElementAssets'

export type SceneId =
  | 'hero'
  | 'masking-parallax'
  | 'suit-evolution'
  | 'project-multiverse'
  | 'skills'
  | 'contact'

export type SceneAssetPriorityRole =
  | 'startup-sequence'
  | 'warm-section'
  | 'warm-three-section'
  | 'background-sequence'

export type SectionModulePreloader = () => Promise<unknown>

export interface SceneAssetManifestEntry {
  glbAssetUrls: readonly string[]
  id: SceneId
  index: number
  preloadModules?: readonly SectionModulePreloader[]
  priorityRole: SceneAssetPriorityRole
  scene: SceneConfig & { id: SceneId }
  sequence?: SequenceConfig
}

const heroSequence = {
  folder: 'video1',
  prefix: 'video',
  startIndex: 1000,
  endIndex: 1296,
  extension: 'webp',
  preloadStrategy: 'viewport',
  preloadRadius: 18,
} as const satisfies SequenceConfig

const contactSequence = {
  folder: 'video6',
  prefix: 'video',
  startIndex: 6000,
  endIndex: 6139,
  extension: 'webp',
  preloadStrategy: 'viewport',
  preloadRadius: 18,
} as const satisfies SequenceConfig

export const preloadContactSection = () => import('../components/sections/ContactSection')
export const preloadMaskingParallaxSection = () => import('../components/sections/MaskingParallaxSection')
export const preloadProjectMultiverseSection = () => import('../components/sections/ProjectMultiverseSection')
export const preloadProjectMultiverseScene = () =>
  import('../components/sections/project-multiverse/ProjectMultiverseScene')
export const preloadSkillsSection = () => import('../components/sections/SkillsSection')
export const preloadSuitEvolutionSection = () => import('../components/sections/SuitEvolutionSection')

export const sectionModuleLoaders = {
  contact: preloadContactSection,
  maskingParallax: preloadMaskingParallaxSection,
  projectMultiverse: preloadProjectMultiverseSection,
  skills: preloadSkillsSection,
  suitEvolution: preloadSuitEvolutionSection,
} as const satisfies Record<string, SectionModulePreloader>

export const sceneAssetManifest: readonly SceneAssetManifestEntry[] = [
  {
    id: 'hero',
    index: 0,
    scene: {
      id: 'hero',
      label: 'Hero',
      sequence: heroSequence,
    },
    sequence: heroSequence,
    glbAssetUrls: [],
    priorityRole: 'startup-sequence',
  },
  {
    id: 'masking-parallax',
    index: 1,
    scene: {
      id: 'masking-parallax',
      label: 'Masking',
      pinDuration: 420,
    },
    preloadModules: [preloadMaskingParallaxSection],
    glbAssetUrls: [],
    priorityRole: 'warm-section',
  },
  {
    id: 'suit-evolution',
    index: 2,
    scene: {
      id: 'suit-evolution',
      label: 'Experience Evolution',
      pinDuration: 4200,
    },
    preloadModules: [preloadSuitEvolutionSection],
    glbAssetUrls: suitModelAssetUrls,
    priorityRole: 'warm-three-section',
  },
  {
    id: 'project-multiverse',
    index: 3,
    scene: {
      id: 'project-multiverse',
      label: 'Project Multiverse',
      pinDuration: 2200,
    },
    preloadModules: [preloadProjectMultiverseSection, preloadProjectMultiverseScene],
    glbAssetUrls: projectPortalAssetUrls,
    priorityRole: 'warm-three-section',
  },
  {
    id: 'skills',
    index: 4,
    scene: {
      id: 'skills',
      label: 'Skills',
      pinDuration: 1400,
    },
    preloadModules: [preloadSkillsSection],
    glbAssetUrls: skillModelAssetUrls,
    priorityRole: 'warm-three-section',
  },
  {
    id: 'contact',
    index: 5,
    scene: {
      id: 'contact',
      label: 'Contact',
      sequence: contactSequence,
    },
    sequence: contactSequence,
    preloadModules: [preloadContactSection],
    glbAssetUrls: [],
    priorityRole: 'background-sequence',
  },
] as const

export const scrollyScenes: SceneConfig[] = sceneAssetManifest.map((entry) => entry.scene)

export const sceneAssetManifestById = sceneAssetManifest.reduce(
  (entries, entry) => {
    entries[entry.id] = entry
    return entries
  },
  {} as Record<SceneId, (typeof sceneAssetManifest)[number]>,
)
