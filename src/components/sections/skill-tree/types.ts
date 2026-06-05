export type SkillStatus = 'mastered' | 'unlocked' | 'locked'

export type SkillIconName =
  | 'atom'
  | 'blocks'
  | 'brain'
  | 'braces'
  | 'bug'
  | 'cable'
  | 'cloud'
  | 'cpu'
  | 'crosshair'
  | 'database'
  | 'fingerprint'
  | 'git'
  | 'gauge'
  | 'key'
  | 'map'
  | 'orbit'
  | 'panels'
  | 'puzzle'
  | 'radar'
  | 'rocket'
  | 'scan'
  | 'server'
  | 'shield'
  | 'sparkles'
  | 'terminal'
  | 'wand'
  | 'workflow'
  | 'zap'

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
