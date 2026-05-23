import { resumeContent } from '../../../data/resumeContent'
import { threeElementAssets } from '../../../lib/threeElementAssets'

export interface SuitEvolutionExperience {
  id: string
  stage: string
  suitName: string
  suitClass: string
  modelUrl: string
  company: string
  role: string
  duration: string
  summary: string
  tags: readonly string[]
  href?: string
  accent: string
  secondaryAccent: string
}

type WorkExperience = (typeof resumeContent.workExperiences)[number]

const fallbackSummary = 'Description coming soon.'

const suitMappings = [
  {
    company: 'Kaizen Softservices',
    id: 'kaizen-photographer',
    modelUrl: threeElementAssets.suits.peterParkerPhotographer,
    stage: 'Suit 01',
    suitClass: 'Peter Parker Photographer Suit',
    suitName: 'Neighborhood Origin',
    accent: '#38bdf8',
    secondaryAccent: '#ef233c',
  },
  {
    company: 'Yahweh Software Solutions',
    id: 'yahweh-ultimate-tech',
    modelUrl: threeElementAssets.suits.ultimate,
    stage: 'Suit 02',
    suitClass: 'Ultimate Tech Suit',
    suitName: 'Systems Upgrade',
    accent: '#ef233c',
    secondaryAccent: '#22d3ee',
  },
  {
    company: 'Fermion Infotech',
    id: 'fermion-hybrid',
    modelUrl: threeElementAssets.suits.hybrid,
    stage: 'Suit 03',
    suitClass: 'Hybrid Advanced Suit',
    suitName: 'Hybrid Protocol',
    accent: '#D4A017',
    secondaryAccent: '#60a5fa',
  },
] as const

export const suitEvolutionExperiences: readonly SuitEvolutionExperience[] = suitMappings.map(
  (mapping) => {
    const experience = findWorkExperience(mapping.company)

    return {
      ...mapping,
      company: mapping.company,
      role: getRole(experience, mapping.company),
      duration: experience?.subtitle ?? 'Timeline locked',
      summary: experience?.body?.join(' ') || fallbackSummary,
      tags: experience?.tags ?? [],
      href: experience?.link,
    }
  },
)

function findWorkExperience(company: string): WorkExperience | undefined {
  return resumeContent.workExperiences.find((experience) => experience.title.includes(company))
}

function getRole(experience: WorkExperience | undefined, company: string): string {
  if (!experience) return 'Experience'

  return experience.title.replace(` at ${company}`, '')
}
