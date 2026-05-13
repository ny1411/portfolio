import { useEffect } from 'react'
import { ScrollTrigger } from '../../lib/gsap'
import { preloadSequenceFrames } from '../../lib/sequenceLoader'
import type { SceneConfig } from '../../types/scene'
import { AboutSection } from '../sections/AboutSection'
import { ContactSection } from '../sections/ContactSection'
import { ExperienceSection } from '../sections/ExperienceSection'
import { HeroSection } from '../sections/HeroSection'
import { ProjectsSection } from '../sections/ProjectsSection'
import { SkillsSection } from '../sections/SkillsSection'
import { SpiderVerseReveal } from '../sections/SpiderVerseReveal'
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
      startIndex: 10178,
      endIndex: 10579,
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
      startIndex: 2000,
      endIndex: 2106,
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
      endIndex: 3151,
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
      endIndex: 4202,
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
      endIndex: 5303,
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
      endIndex: 6296,
      preloadStrategy: 'viewport',
      preloadRadius: 18,
    },
  },
]

const navScenes: SceneConfig[] = [
  scenes[0],
  { id: 'spider-verse', label: 'Spider-Verse' },
  ...scenes.slice(1),
]

const sceneContent = [
  <HeroSection />,
  <AboutSection />,
  <ExperienceSection />,
  <ProjectsSection />,
  <SkillsSection />,
  <ContactSection />,
]

export function ScrollyPage() {
  useScrollSync()

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

    const heroSequence = scenes[0].sequence
    if (heroSequence) preloadSequenceFrames(heroSequence, 5)

    return () => {
      window.removeEventListener('scroll', updateGlobalProgress)
      window.removeEventListener('resize', refreshScrollTriggers)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <main className="scrolly-page">
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <SceneNav scenes={navScenes} />
      <Scene config={scenes[0]} index={0} key={scenes[0].id}>
        {sceneContent[0]}
      </Scene>
      <SpiderVerseReveal sceneIndex={1} />
      {scenes.slice(1).map((scene, index) => (
        <Scene config={scene} index={index + 2} key={scene.id}>
          {sceneContent[index + 1]}
        </Scene>
      ))}
    </main>
  )
}
