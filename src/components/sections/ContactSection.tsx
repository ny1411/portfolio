import { useEffect, useRef } from 'react'
import githubLogo from '../../../public/icons/GitHub.svg'
import linkedinLogo from '../../../public/icons/LinkedIn.svg'
import whatsappLogo from '../../../public/icons/WhatsApp.svg'
import  XLogo from '../../../public/icons/X.svg'
import { resumeContent } from '../../data/resumeContent'
import { useScrollStore } from '../scrolly/scrollStore'
import { SparklesCore } from '../ui/sparkles'

const contactPage = resumeContent.resumePages.find((page) => page.id === 'contact')
const contactLines = contactPage?.body ?? []
const emailLine = contactLines.find((line) => line.startsWith('Email:'))
const contactEmail = emailLine?.replace('Email:', '').trim() ?? 'neerajyamaji@gmail.com'
const socialLabels = ['LinkedIn', 'Twitter', 'GitHub', 'WhatsApp'] as const
const socialLogos: Record<(typeof socialLabels)[number], string> = {
  GitHub: githubLogo,
  LinkedIn: linkedinLogo,
  Twitter:  XLogo,
  WhatsApp: whatsappLogo,
}
const socialLinks = socialLabels.flatMap((label) => {
  const line = contactLines.find((item) => item.startsWith(`${label}:`))
  const href = line?.replace(`${label}:`, '').trim()

  return href ? [{ logo: socialLogos[label], label: label === 'Twitter' ? 'X' : label, href }] : []
})

const GLASS_REVEAL_START = 0.5
const GLASS_REVEAL_END = 0.9

export function ContactSection() {
  const glassPanelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const syncGlassOpacity = () => {
      const { activeSceneId, sceneProgress } = useScrollStore.getState()
      const opacity = activeSceneId === 'contact' ? getContactGlassOpacity(sceneProgress) : 0

      glassPanelRef.current?.style.setProperty('--contact-glass-opacity', opacity.toFixed(3))
    }

    syncGlassOpacity()

    return useScrollStore.subscribe(syncGlassOpacity)
  }, [])

  return (
    <div className="scene-layout scene-layout--contact contact-cta-scene">
      <div className="contact-sparkles-cta">
        <span ref={glassPanelRef} className="contact-sparkles-cta__readability-panel" aria-hidden="true" />
        <span className="contact-sparkles-cta__ambient-bloom" aria-hidden="true" />
        <a className="contact-sparkles-cta__title" href={`mailto:${contactEmail}`}>
          Start a conversation
        </a>
        <span className="contact-sparkles-cta__stage" aria-hidden="true">
          <span className="contact-sparkles-cta__beam contact-sparkles-cta__beam--indigo-blur" />
          <span className="contact-sparkles-cta__beam contact-sparkles-cta__beam--indigo" />
          <span className="contact-sparkles-cta__beam contact-sparkles-cta__beam--sky-blur" />
          <span className="contact-sparkles-cta__beam contact-sparkles-cta__beam--sky" />
          <SparklesCore
            background="transparent"
            className="contact-sparkles-cta__particles"
            maxSize={1}
            minSize={0.4}
            particleColor="#ffffff"
            particleDensity={1200}
            speed={2}
          />
          <span className="contact-sparkles-cta__mask" />
        </span>
      </div>
      <div className="contact-social-buttons" aria-label="Social links">
        {socialLinks.map(({ href, label, logo }) => (
          <a aria-label={label} href={href} key={label} rel="noreferrer" target="_blank" title={label}>
            <img
              aria-hidden="true"
              className={`contact-social-buttons__logo contact-social-buttons__logo--${label.toLowerCase()}`}
              src={logo}
              alt=""
            />
          </a>
        ))}
      </div>
    </div>
  )
}

function getContactGlassOpacity(progress: number): number {
  const progressInRange = Math.min(
    1,
    Math.max(0, (progress - GLASS_REVEAL_START) / (GLASS_REVEAL_END - GLASS_REVEAL_START)),
  )

  return progressInRange * progressInRange * (3 - 2 * progressInRange)
}