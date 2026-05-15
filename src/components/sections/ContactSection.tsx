import { BriefcaseBusiness, GitBranch, MessageCircle, X, type LucideIcon } from 'lucide-react'
import { resumeContent } from '../../data/resumeContent'
import { SparklesCore } from '../ui/sparkles'

const contactPage = resumeContent.resumePages.find((page) => page.id === 'contact')
const contactLines = contactPage?.body ?? []
const emailLine = contactLines.find((line) => line.startsWith('Email:'))
const contactEmail = emailLine?.replace('Email:', '').trim() ?? 'neerajyamaji@gmail.com'
const socialLabels = ['LinkedIn', 'Twitter', 'GitHub', 'WhatsApp'] as const
const socialIcons: Record<(typeof socialLabels)[number], LucideIcon> = {
  GitHub: GitBranch,
  LinkedIn: BriefcaseBusiness,
  Twitter: X,
  WhatsApp: MessageCircle,
}
const socialLinks = socialLabels.flatMap((label) => {
  const line = contactLines.find((item) => item.startsWith(`${label}:`))
  const href = line?.replace(`${label}:`, '').trim()

  return href ? [{ Icon: socialIcons[label], label: label === 'Twitter' ? 'X' : label, href }] : []
})

export function ContactSection() {
  return (
    <div className="scene-layout scene-layout--contact contact-cta-scene">
      <a className="contact-sparkles-cta" href={`mailto:${contactEmail}`}>
        <span className="contact-sparkles-cta__title">Start a conversation</span>
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
      </a>
      <div className="contact-social-buttons" aria-label="Social links">
        {socialLinks.map(({ Icon, href, label }) => (
          <a aria-label={label} href={href} key={label} rel="noreferrer" target="_blank" title={label}>
            <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
          </a>
        ))}
      </div>
    </div>
  )
}
