export type SkillStatus = 'mastered' | 'unlocked' | 'locked'

export type SkillIconName =
  | 'atom'
  | 'blocks'
  | 'brain'
  | 'braces'
  | 'cloud'
  | 'database'
  | 'git'
  | 'gauge'
  | 'map'
  | 'panels'
  | 'server'
  | 'shield'
  | 'sparkles'
  | 'terminal'
  | 'workflow'

export type SkillArtifactPreset =
  | 'cards'
  | 'cloud'
  | 'cube'
  | 'database'
  | 'gateway'
  | 'grid'
  | 'map'
  | 'neural'
  | 'orbital'
  | 'pipeline'
  | 'portal'
  | 'server'
  | 'shield'
  | 'terminal'
  | 'web'

export interface SkillTreeNode {
  id: string
  name: string
  status: SkillStatus
  proficiency: string
  description: string
  usage: readonly string[]
  tags: readonly string[]
  icon: SkillIconName
  logo: string
  artifact: SkillArtifactPreset
  accent: string
  children?: readonly SkillTreeNode[]
}

export interface SkillTreeBranch {
  id: string
  title: string
  subtitle: string
  accent: string
  nodes: readonly SkillTreeNode[]
}
