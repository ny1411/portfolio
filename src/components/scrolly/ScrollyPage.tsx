import { useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from '../../lib/gsap'
import { preloadSpiderLogoModel } from '../../lib/spiderLogoModel'
import type { SceneConfig } from '../../types/scene'
import { SpiderLogoLoader } from '../loaders/SpiderLogoLoader'
import { AboutSection } from '../sections/AboutSection'
import { ContactSection } from '../sections/ContactSection'
import { ExperienceSection } from '../sections/ExperienceSection'
import { HeroSection } from '../sections/HeroSection'
import { ProjectsSection } from '../sections/ProjectsSection'
import { SkillsSection } from '../sections/SkillsSection'
import { Scene } from './Scene'
import { SceneNav } from './SceneNav'
import { useScrollStore } from './scrollStore'
import { useScrollSync } from './useScrollSync'

const scenes: SceneConfig[] = [
  {
    id: 'hero',
    label: 'Hero',
    videoSrc: '/videos/video1.mp4',
  },
  {
    id: 'about',
    label: 'About',
    videoSrc: '/videos/video2.mp4',
  },
  {
    id: 'experience',
    label: 'Experience',
    videoSrc: '/videos/video3.mp4',
  },
  {
    id: 'projects',
    label: 'Projects',
    videoSrc: '/videos/video4.mp4',
  },
  {
    id: 'skills',
    label: 'Skills',
    videoSrc: '/videos/video5.mp4',
  },
  {
    id: 'contact',
    label: 'Contact',
    videoSrc: '/videos/video6.mp4',
  },
]

const sceneContent = [
  <HeroSection />,
  <AboutSection />,
  <ExperienceSection />,
  <ProjectsSection />,
  <SkillsSection />,
  <ContactSection />,
]

const MIN_STARTUP_LOADER_MS = 3000
const MIN_LOGO_VISIBLE_MS = 1800
const MAX_STARTUP_LOADER_MS = 8000

export function ScrollyPage() {
  const [minimumLoaderElapsed, setMinimumLoaderElapsed] = useState(false)
  const [logoVisibleElapsed, setLogoVisibleElapsed] = useState(false)
  const [logoModelReady, setLogoModelReady] = useState(false)
  const [heroVideoReady, setHeroVideoReady] = useState(false)
  const [forceStartupReady, setForceStartupReady] = useState(false)
  const activeSceneIndex = useScrollStore((state) => state.activeSceneIndex)
  const scrollDirection = useScrollStore((state) => state.direction)
  const canMountScenes = logoModelReady || forceStartupReady
  const startupReady =
    forceStartupReady || (minimumLoaderElapsed && logoVisibleElapsed && logoModelReady && heroVideoReady)
  const handleHeroVideoReady = useCallback(() => setHeroVideoReady(true), [])
  const handleLogoModelReady = useCallback(() => setLogoModelReady(true), [])

  useScrollSync()

  useEffect(() => {
    preloadSpiderLogoModel()

    const minimumTimer = window.setTimeout(() => setMinimumLoaderElapsed(true), MIN_STARTUP_LOADER_MS)
    const maximumTimer = window.setTimeout(() => setForceStartupReady(true), MAX_STARTUP_LOADER_MS)

    return () => {
      window.clearTimeout(minimumTimer)
      window.clearTimeout(maximumTimer)
    }
  }, [])

  useEffect(() => {
    if (!logoModelReady) return

    const visibleTimer = window.setTimeout(() => setLogoVisibleElapsed(true), MIN_LOGO_VISIBLE_MS)

    return () => window.clearTimeout(visibleTimer)
  }, [logoModelReady])

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
      {!startupReady && <SpiderLogoLoader onModelReady={handleLogoModelReady} />}
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      {canMountScenes && (
        <>
          <SceneNav scenes={scenes} />
          {scenes.map((scene, index) => (
            <Scene
              config={scene}
              index={index}
              key={scene.id}
              onVideoReady={index === 0 ? handleHeroVideoReady : undefined}
              videoMountMode={getVideoMountMode(index, activeSceneIndex, scrollDirection)}
            >
              {sceneContent[index]}
            </Scene>
          ))}
        </>
      )}
    </main>
  )
}

function getVideoMountMode(
  sceneIndex: number,
  activeSceneIndex: number,
  direction: 'up' | 'down',
): 'auto' | 'metadata' | 'none' {
  if (sceneIndex === activeSceneIndex) return 'auto'

  const warmSceneIndex = activeSceneIndex + (direction === 'up' ? -1 : 1)
  return sceneIndex === warmSceneIndex ? 'metadata' : 'none'
}
