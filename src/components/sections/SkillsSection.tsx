import { SkillTree } from './skill-tree/SkillTree'
import { useScrollStore } from '../scrolly/scrollStore'

export function SkillsSection() {
  const isActive = useScrollStore((state) => state.activeSceneId === 'skills')

  return <SkillTree isActive={isActive} />
}
