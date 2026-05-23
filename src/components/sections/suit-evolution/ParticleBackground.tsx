import { useEffect, useId, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useScrollStore } from '../../scrolly/scrollStore'

let particlesReadyPromise: Promise<void> | null = null

export function ParticleBackground() {
  const [ready, setReady] = useState(false)
  const id = useId()
  const isExperienceActive = useScrollStore((state) => state.activeSceneId === 'suit-evolution')
  const options = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent',
        },
      },
      detectRetina: true,
      fpsLimit: isExperienceActive ? 60 : 24,
      fullScreen: {
        enable: false,
        zIndex: 0,
      },
      interactivity: {
        events: {
          onClick: {
            enable: false,
          },
          onHover: {
            enable: false,
          },
          resize: {
            enable: true,
          },
        },
      },
      particles: {
        color: {
          value: ['#38bdf8', '#ef233c', '#ffffff'],
        },
        links: {
          color: '#38bdf8',
          distance: 92,
          enable: true,
          opacity: 0.08,
          width: 2,
        },
        move: {
          direction: 'none' as const,
          enable: true,
          outModes: {
            default: 'out' as const,
          },
          random: true,
          speed: {
            max: isExperienceActive ? 0.55 : 0.18,
            min: 0.08,
          },
          straight: false,
        },
        number: {
          density: {
            enable: true,
            height: 900,
            width: 600,
          },
          value: isExperienceActive ? 58 : 20,
        },
        opacity: {
          animation: {
            enable: true,
            speed: 0.8,
            sync: false,
          },
          value: {
            max: 0.42,
            min: 0.08,
          },
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: {
            max: 2.2,
            min: 0.45,
          },
        },
      },
    }),
    [isExperienceActive],
  )

  useEffect(() => {
    particlesReadyPromise ??= initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    })

    particlesReadyPromise.then(() => setReady(true))
  }, [])

  return (
    <div className="suit-evolution-particles" aria-hidden="true">
      {ready && <Particles id={`suit-particles-${id}`} options={options} />}
    </div>
  )
}
