import { useEffect } from 'react'
import { ScrollTrigger } from '../../lib/gsap'
import type { SceneConfig } from '../../types/scene'
import { AboutSection } from '../sections/AboutSection'
import { ContactSection } from '../sections/ContactSection'
import { ExperienceSection } from '../sections/ExperienceSection'
import { HeroSection } from '../sections/HeroSection'
import { ProjectsSection } from '../sections/ProjectsSection'
import { SkillsSection } from '../sections/SkillsSection'
import { Scene } from './Scene'
import { SceneNav } from './SceneNav'
import { SceneProgress } from './SceneProgress'
import { useScrollStore } from './scrollStore'
import { useScrollSync } from './useScrollSync'

const scenes: SceneConfig[] = [
  { id: 'hero', label: 'Hero', pinDuration: 240, threeScene: true },
  { id: 'about', label: 'About', pinDuration: 260 },
  { id: 'experience', label: 'Experience', pinDuration: 300 },
  { id: 'projects', label: 'Projects', pinDuration: 320 },
  { id: 'skills', label: 'Skills', pinDuration: 240 },
  { id: 'contact', label: 'Contact', pinDuration: 220 },
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
      <SceneProgress />
      <SceneNav scenes={scenes} />
      {scenes.map((scene, index) => (
        <Scene config={scene} index={index} key={scene.id}>
          {sceneContent[index]}
        </Scene>
      ))}
    </main>
  )
}
