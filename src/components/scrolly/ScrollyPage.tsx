import { useEffect, useState } from 'react'
import { ScrollTrigger } from '../../lib/gsap'
import { preloadSequenceFrameRange } from '../../lib/sequenceLoader'
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
    id: 'about',
    label: 'About',
    sequence: {
      folder: 'video2',
      prefix: 'video',
      startIndex: 200,
      endIndex: 288,
      extension: 'webp',
      padLength: 3,
      preloadStrategy: 'viewport',
      preloadRadius: 14,
    },
  },
  {
    id: 'experience',
    label: 'Experience',
    sequence: {
      folder: 'video3',
      prefix: 'video',
      startIndex: 3000,
      endIndex: 3185,
      extension: 'webp',
      preloadStrategy: 'viewport',
      preloadRadius: 16,
    },
  },
  {
    id: 'projects',
    label: 'Projects',
    sequence: {
      folder: 'video4',
      prefix: 'video',
      startIndex: 4000,
      endIndex: 4168,
      extension: 'webp',
      preloadStrategy: 'viewport',
      preloadRadius: 20,
    },
  },
  {
    id: 'skills',
    label: 'Skills',
    sequence: {
      folder: 'video5',
      prefix: 'video',
      startIndex: 5000,
      endIndex: 5334,
      extension: 'webp',
      preloadStrategy: 'viewport',
      preloadRadius: 18,
    },
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

const sceneContent = [
  <HeroSection />,
  <AboutSection />,
  <ExperienceSection />,
  <ProjectsSection />,
  <SkillsSection />,
  <ContactSection />,
]

const MIN_STARTUP_LOADER_MS = 3000

export function ScrollyPage() {
  const [startupReady, setStartupReady] = useState(false)

  useScrollSync()

  useEffect(() => {
    const controller = new AbortController()
    const heroSequence = scenes[0].sequence
    const minimumDelay = new Promise((resolve) => {
      window.setTimeout(resolve, MIN_STARTUP_LOADER_MS)
    })
    const framePreload = heroSequence
      ? preloadSequenceFrameRange(scenes[0].id, heroSequence, controller.signal)
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
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <SceneNav scenes={scenes} />
      {scenes.map((scene, index) => (
        <Scene config={scene} index={index} key={scene.id}>
          {sceneContent[index]}
        </Scene>
      ))}
    </main>
  )
}
