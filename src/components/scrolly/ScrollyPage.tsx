import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import { ScrollTrigger } from '../../lib/gsap'
import { preloadSequenceFrameRange } from '../../lib/sequenceLoader'
import type { SceneConfig } from '../../types/scene'
import { SpiderLogoLoader } from '../loaders/SpiderLogoLoader'
import { HeroSection } from '../sections/HeroSection'
import { Scene } from './Scene'
import { SceneNav } from './SceneNav'
import { useScrollStore } from './scrollStore'
import { useScrollSync } from './useScrollSync'

const MaskingParallaxSection = lazySection(
  () => import('../sections/MaskingParallaxSection'),
  'MaskingParallaxSection',
)
const SuitEvolutionSection = lazySection(
  () => import('../sections/SuitEvolutionSection'),
  'SuitEvolutionSection',
)
const ProjectMultiverseSection = lazySection(
  () => import('../sections/ProjectMultiverseSection'),
  'ProjectMultiverseSection',
)
const SkillsSection = lazySection(
  () => import('../sections/SkillsSection'),
  'SkillsSection',
)
const ContactSection = lazySection(
  () => import('../sections/ContactSection'),
  'ContactSection',
)

const scenes: SceneConfig[] = [
  {
    id: 'hero',
    label: 'Hero',
    sequence: {
      folder: 'video1',
      prefix: 'video',
      startIndex: 1000,
      endIndex: 1296,
      extension: 'webp',
      preloadStrategy: 'viewport',
      preloadRadius: 18,
    },
  },
  {
    id: 'masking-parallax',
    label: 'Masking',
    pinDuration: 420,
  },
  {
    id: 'suit-evolution',
    label: 'Experience Evolution',
    pinDuration: 4200,
  },
  {
    id: 'project-multiverse',
    label: 'Project Multiverse',
    pinDuration: 2200,
  },
  {
    id: 'skills',
    label: 'Skills',
    pinDuration: 1400,
  },
  {
    id: 'contact',
    label: 'Contact',
    sequence: {
      folder: 'video6',
      prefix: 'video',
      startIndex: 6000,
      endIndex: 6139,
      extension: 'webp',
      preloadStrategy: 'viewport',
      preloadRadius: 18,
    },
  },
]

const sceneContent: ComponentType[] = [
  HeroSection,
  MaskingParallaxSection,
  SuitEvolutionSection,
  ProjectMultiverseSection,
  SkillsSection,
  ContactSection,
]

const MIN_STARTUP_LOADER_MS = 3000
const STARTUP_PRELOAD_FRAME_LIMIT = 50

export function ScrollyPage() {
  const [startupReady, setStartupReady] = useState(false)
  const activeSceneIndex = useScrollStore((state) => state.activeSceneIndex)
  const isScrolling = useScrollStore((state) => state.isScrolling)
  const allowedSceneIndex = startupReady
    ? Math.min(scenes.length - 1, activeSceneIndex + (isScrolling ? 0 : 1))
    : 0

  useScrollSync()

  useEffect(() => {
    const controller = new AbortController()
    const firstSequenceScene = scenes.find((scene) => scene.sequence)
    const minimumDelay = new Promise((resolve) => {
      window.setTimeout(resolve, MIN_STARTUP_LOADER_MS)
    })
    const framePreload = firstSequenceScene?.sequence
      ? preloadSequenceFrameRange(
          firstSequenceScene.id,
          firstSequenceScene.sequence,
          controller.signal,
          6,
          STARTUP_PRELOAD_FRAME_LIMIT,
        )
      : Promise.resolve()

    void Promise.all([minimumDelay, framePreload.catch(() => undefined)]).then(() => {
      if (!controller.signal.aborted) setStartupReady(true)
    })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const updateGlobalProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      useScrollStore.getState().setGlobalProgress(Math.min(1, Math.max(0, progress)))
    }
    const refreshScrollTriggers = () => ScrollTrigger.refresh()

    window.addEventListener('scroll', updateGlobalProgress, { passive: true })
    window.addEventListener('resize', refreshScrollTriggers)
    updateGlobalProgress()

    return () => {
      window.removeEventListener('scroll', updateGlobalProgress)
      window.removeEventListener('resize', refreshScrollTriggers)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <main className={`scrolly-page ${startupReady ? 'is-ready' : 'is-loading'}`}>
      {!startupReady && <SpiderLogoLoader />}
      <SceneNav scenes={scenes} />
      {scenes.map((scene, index) => (
        <Scene
          config={scene}
          index={index}
          key={scene.id}
          sequenceEnabled={index <= allowedSceneIndex}
        >
          <SceneContent index={index} mounted={index <= allowedSceneIndex} />
        </Scene>
      ))}
    </main>
  )
}

function SceneContent({ index, mounted }: { index: number; mounted: boolean }) {
  if (!mounted) return null

  const Content = sceneContent[index]
  if (!Content) return null

  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  )
}

function lazySection<TModule extends Record<TKey, ComponentType>, TKey extends string>(
  loader: () => Promise<TModule>,
  exportName: TKey,
) {
  return lazy(() =>
    loader().then((module) => ({
      default: module[exportName],
    })),
  )
}
