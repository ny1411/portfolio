import { useGLTF } from '@react-three/drei'
import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from 'react'
import { ScrollTrigger } from '../../lib/gsap'
import {
  sceneAssetManifest,
  sceneAssetManifestById,
  scrollyScenes,
  sectionModuleLoaders,
} from '../../lib/sceneAssetManifest'
import { framePreloadScheduler } from '../../lib/framePreloadScheduler'
import { getDeviceProfile } from '../../lib/performance'
import { deleteOldFrameCaches } from '../../lib/persistentFrameCache'
import { getFrameIndex, preloadSequenceFrames } from '../../lib/sequenceLoader'
import { SpiderLogoLoader } from '../loaders/SpiderLogoLoader'
import { HeroSection } from '../sections/HeroSection'
import { Scene } from './Scene'
import { SceneNav } from './SceneNav'
import { useScrollStore } from './scrollStore'
import { useScrollSync } from './useScrollSync'

const MaskingParallaxSection = lazySection(
  sectionModuleLoaders.maskingParallax,
  'MaskingParallaxSection',
)
const SuitEvolutionSection = lazySection(
  sectionModuleLoaders.suitEvolution,
  'SuitEvolutionSection',
)
const ProjectMultiverseSection = lazySection(
  sectionModuleLoaders.projectMultiverse,
  'ProjectMultiverseSection',
)
const SkillsSection = lazySection(
  sectionModuleLoaders.skills,
  'SkillsSection',
)
const ContactSection = lazySection(
  sectionModuleLoaders.contact,
  'ContactSection',
)

const scenes = scrollyScenes

const sceneContent: ComponentType[] = [
  HeroSection,
  MaskingParallaxSection,
  SuitEvolutionSection,
  ProjectMultiverseSection,
  SkillsSection,
  ContactSection,
]

const MIN_STARTUP_LOADER_MS = 3000
const CRITICAL_HERO_PRELOAD_FRAME_COUNT = 12
const STARTUP_PRELOAD_FRAME_LIMIT = 50
const STARTUP_FRAME_PRELOAD_CONCURRENCY = 6

export function ScrollyPage() {
  const [startupReady, setStartupReady] = useState(false)
  const [heroSequenceReady, setHeroSequenceReady] = useState(false)
  const contactWarmupStartedRef = useRef(false)
  const preloadedGlbUrlsRef = useRef<Set<string>>(new Set())
  const preloadedSectionIdsRef = useRef<Set<string>>(new Set())
  const activeSceneIndex = useScrollStore((state) => state.activeSceneIndex)
  const sceneProgress = useScrollStore((state) => state.sceneProgress)
  const isScrolling = useScrollStore((state) => state.isScrolling)
  const scrollDirection = useScrollStore((state) => state.direction)

  useScrollSync()

  useEffect(() => {
    void deleteOldFrameCaches()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const heroScene = sceneAssetManifestById.hero
    if (heroScene.sequence) {
      preloadSequenceFrames(heroScene.sequence, CRITICAL_HERO_PRELOAD_FRAME_COUNT)
    }

    const minimumDelay = new Promise((resolve) => {
      window.setTimeout(resolve, MIN_STARTUP_LOADER_MS)
    })
    const framePreload = heroScene.sequence
      ? framePreloadScheduler.preloadStartupHeroFrames({
          concurrency: STARTUP_FRAME_PRELOAD_CONCURRENCY,
          frameLimit: STARTUP_PRELOAD_FRAME_LIMIT,
          sceneId: heroScene.id,
          sequence: heroScene.sequence,
          signal: controller.signal,
        })
      : Promise.resolve()

    void Promise.all([minimumDelay, framePreload.catch(() => undefined)]).then(() => {
      if (!controller.signal.aborted) setStartupReady(true)
    })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!startupReady) return

    const controller = new AbortController()
    const heroScene = sceneAssetManifestById.hero

    if (!heroScene.sequence) {
      window.setTimeout(() => {
        if (!controller.signal.aborted) setHeroSequenceReady(true)
      }, 0)

      return () => controller.abort()
    }

    void framePreloadScheduler
      .preloadHeroRemainder({
        concurrency: getHeroRemainderConcurrency(),
        sceneId: heroScene.id,
        sequence: heroScene.sequence,
        skippedFrameCount: STARTUP_PRELOAD_FRAME_LIMIT,
        signal: controller.signal,
      })
      .then(() => {
        if (!controller.signal.aborted) setHeroSequenceReady(true)
      })
      .catch(() => undefined)

    return () => controller.abort()
  }, [startupReady])

  useEffect(() => {
    framePreloadScheduler.setScrolling(isScrolling)
  }, [isScrolling])

  useEffect(() => {
    return () => framePreloadScheduler.abortAll()
  }, [])

  useEffect(() => {
    if (!startupReady || contactWarmupStartedRef.current) return
    if (!heroSequenceReady && activeSceneIndex < 1) return

    const contactScene = sceneAssetManifestById.contact
    if (!contactScene.sequence) return

    contactWarmupStartedRef.current = true
    void framePreloadScheduler
      .preloadContactBackground({
        concurrency: getContactBackgroundConcurrency(),
        sceneId: contactScene.id,
        sequence: contactScene.sequence,
      })
      .catch(() => undefined)
  }, [activeSceneIndex, heroSequenceReady, startupReady])

  useEffect(() => {
    if (!startupReady) return

    getWarmScenes(activeSceneIndex).forEach((scene) => {
      if (!scene.sequence) return

      const progress = getWarmSceneProgress(scene.index, activeSceneIndex, sceneProgress, scrollDirection)
      const centerIndex = getFrameIndex(scene.sequence, progress)
      const isActive = scene.index === activeSceneIndex

      framePreloadScheduler.preloadFrameWindow({
        centerIndex,
        direction: scrollDirection,
        priority: isActive ? 'hot' : 'warm',
        sceneId: scene.id,
        sequence: scene.sequence,
      })
    })
  }, [activeSceneIndex, sceneProgress, scrollDirection, startupReady])

  useEffect(() => {
    if (!startupReady) return

    getWarmScenes(activeSceneIndex).forEach((scene) => {
      if (scene.preloadModules?.length && !preloadedSectionIdsRef.current.has(scene.id)) {
        preloadedSectionIdsRef.current.add(scene.id)

        void Promise.all(scene.preloadModules.map((preloadModule) => preloadModule())).catch(() => {
          preloadedSectionIdsRef.current.delete(scene.id)
        })
      }

      scene.glbAssetUrls.forEach((assetUrl) => {
        if (preloadedGlbUrlsRef.current.has(assetUrl)) return

        preloadedGlbUrlsRef.current.add(assetUrl)
        useGLTF.preload(assetUrl)
      })
    })
  }, [activeSceneIndex, startupReady])

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
          sequenceEnabled={isSceneInWarmWindow(index, activeSceneIndex, startupReady)}
        >
          <SceneContent index={index} mounted={isSceneInWarmWindow(index, activeSceneIndex, startupReady)} />
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

function getWarmSceneProgress(
  sceneIndex: number,
  activeSceneIndex: number,
  activeSceneProgress: number,
  direction: 'up' | 'down',
): number {
  if (sceneIndex === activeSceneIndex) return activeSceneProgress
  if (sceneIndex < activeSceneIndex) return direction === 'up' ? 1 : 0.8

  return direction === 'down' ? 0 : 0.2
}

function getWarmScenes(activeSceneIndex: number) {
  return sceneAssetManifest.filter((scene) => isSceneInWarmWindow(scene.index, activeSceneIndex, true))
}

function isSceneInWarmWindow(index: number, activeSceneIndex: number, startupReady: boolean): boolean {
  if (!startupReady) return index === 0

  return Math.abs(index - activeSceneIndex) <= 1
}

function getHeroRemainderConcurrency(): number {
  const profile = getDeviceProfile()

  if (profile.tier === 'high') return 5
  if (profile.tier === 'mid') return 4

  return 3
}

function getContactBackgroundConcurrency(): number {
  const profile = getDeviceProfile()

  if (profile.tier === 'high') return 3
  if (profile.tier === 'mid') return 2

  return 1
}
