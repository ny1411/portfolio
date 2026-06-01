import {
  Atom,
  Blocks,
  BrainCircuit,
  Braces,
  ChevronLeft,
  ChevronRight,
  CloudCog,
  Database,
  Gauge,
  GitBranch,
  MapPinned,
  PanelsTopLeft,
  Server,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { defaultSelectedSkillId, skillTreeBranches } from './skillTreeData'
import { SkillShowcase } from './SkillShowcase'
import type { SkillIconName, SkillStatus, SkillTreeBranch, SkillTreeNode } from './types'

const statusLabels: Record<SkillStatus, string> = {
  locked: 'Locked',
  mastered: 'Mastered',
  unlocked: 'Unlocked',
}

const iconMap: Record<SkillIconName, LucideIcon> = {
  atom: Atom,
  blocks: Blocks,
  brain: BrainCircuit,
  braces: Braces,
  cloud: CloudCog,
  database: Database,
  gauge: Gauge,
  git: GitBranch,
  map: MapPinned,
  panels: PanelsTopLeft,
  server: Server,
  shield: ShieldCheck,
  sparkles: Sparkles,
  terminal: SquareTerminal,
  workflow: Workflow,
}

interface SkillTreeProps {
  branches?: readonly SkillTreeBranch[]
  initialSelectedNodeId?: string
}

export function SkillTree({
  branches = skillTreeBranches,
  initialSelectedNodeId = defaultSelectedSkillId,
}: SkillTreeProps) {
  const nodes = useMemo(() => branches.flatMap((branch) => flattenNodes(branch.nodes)), [branches])
  const initialNode = nodes.find((node) => node.id === initialSelectedNodeId) ?? nodes[0]
  const [selectedNodeId, setSelectedNodeId] = useState(initialNode.id)
  const [activeIndex, setActiveIndex] = useState(0)
  const [slideOffset, setSlideOffset] = useState(0)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<Array<HTMLElement | null>>([])
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? initialNode
  const maxIndex = Math.max(0, branches.length - 1)

  const scrollToSlide = (index: number) => {
    const viewport = viewportRef.current
    const track = trackRef.current
    const slide =
      slideRefs.current[index] ??
      track?.querySelector<HTMLElement>(`.skill-branch:nth-child(${index + 1})`)
    if (!viewport || !slide) return

    setSlideOffset(slide.offsetLeft - (track?.offsetLeft ?? 0))
  }

  useEffect(() => {
    scrollToSlide(activeIndex)
  }, [activeIndex])

  const goToSlide = (nextIndex: number) => {
    const clampedIndex = Math.min(maxIndex, Math.max(0, nextIndex))
    setActiveIndex(clampedIndex)
    window.requestAnimationFrame(() => scrollToSlide(clampedIndex))
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX === null) return

    const delta = event.clientX - dragStartX
    setDragStartX(null)

    if (Math.abs(delta) < 42) return
    goToSlide(activeIndex + (delta < 0 ? 1 : -1))
  }

  return (
    <section className="skill-tree-section" aria-labelledby="skill-tree-title">
      <div className="skill-tree-section__backdrop" aria-hidden="true" />
      <div className="skill-tree-shell">
        <header className="skill-tree-header">
          <span className="skill-tree-header__eyebrow">Technical Skills</span>
          <div>
            <h2 id="skill-tree-title">Powers unlocked for web products.</h2>
            <p>
              A structured map of frontend, backend, database, tooling, AI, and deployment skills.
            </p>
          </div>
        </header>

        <div className="skill-tree-layout">
          <div className="skill-carousel" aria-label="Technical skill categories">
            <div className="skill-carousel__controls">
              <button
                aria-label="Show previous skill category"
                disabled={activeIndex === 0}
                onClick={() => goToSlide(activeIndex - 1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={18} />
              </button>
              <div className="skill-carousel__status" aria-live="polite">
                <span>{String(activeIndex + 1).padStart(2, '0')}</span>
                <strong>{branches[activeIndex]?.title}</strong>
                <small>{branches.length} sections</small>
              </div>
              <button
                aria-label="Show next skill category"
                disabled={activeIndex === maxIndex}
                onClick={() => goToSlide(activeIndex + 1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            </div>

            <div
              className="skill-carousel__viewport"
              onPointerCancel={() => setDragStartX(null)}
              onPointerDown={(event) => setDragStartX(event.clientX)}
              onPointerLeave={() => setDragStartX(null)}
              onPointerUp={handlePointerUp}
              ref={viewportRef}
            >
              <div
                className="skill-carousel__track"
                ref={trackRef}
                style={{ '--slide-offset': `${slideOffset}px` } as CSSProperties}
              >
                {branches.map((branch, index) => (
                  <SkillBranchSlide
                    branch={branch}
                    index={index}
                    key={branch.id}
                    onSelect={setSelectedNodeId}
                    refCallback={(node) => {
                      slideRefs.current[index] = node
                    }}
                    selectedNodeId={selectedNode.id}
                  />
                ))}
              </div>
            </div>

            <div className="skill-carousel__dots" aria-label="Skill category navigation">
              {branches.map((branch, index) => (
                <button
                  aria-label={`Show ${branch.title}`}
                  aria-pressed={index === activeIndex}
                  key={branch.id}
                  onClick={() => goToSlide(index)}
                  type="button"
                />
              ))}
            </div>
          </div>

          <SkillDetailPanel skill={selectedNode} />
        </div>
      </div>
    </section>
  )
}

function flattenNodes(nodes: readonly SkillTreeNode[]): SkillTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children ?? [])])
}

function countNodes(nodes: readonly SkillTreeNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countNodes(node.children ?? []), 0)
}

function countCompletedNodes(nodes: readonly SkillTreeNode[]): number {
  return nodes.reduce(
    (total, node) =>
      total + (node.status !== 'locked' ? 1 : 0) + countCompletedNodes(node.children ?? []),
    0,
  )
}

interface SkillBranchSlideProps {
  branch: SkillTreeBranch
  index: number
  selectedNodeId: string
  refCallback: (node: HTMLElement | null) => void
  onSelect: (nodeId: string) => void
}

function SkillBranchSlide({
  branch,
  index,
  onSelect,
  refCallback,
  selectedNodeId,
}: SkillBranchSlideProps) {
  const totalNodes = countNodes(branch.nodes)
  const completedNodes = countCompletedNodes(branch.nodes)
  const completion = Math.round((completedNodes / totalNodes) * 100)
  const style = {
    '--branch-accent': branch.accent,
    '--branch-order': String(index),
    '--branch-completion': `${completion}%`,
    '--root-spine-width':
      branch.nodes.length > 1 ? `${(branch.nodes.length - 1) * 4.05}rem` : '1px',
  } as CSSProperties

  return (
    <article className="skill-branch" ref={refCallback} style={style}>
      <header className="skill-branch__header">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <h3>{branch.title}</h3>
        <p>{branch.subtitle}</p>
      </header>

      <div className="skill-branch__completion" aria-label={`${branch.title} completion ${completion}%`}>
        <span>Completion</span>
        <strong>{completion}%</strong>
        <i aria-hidden="true" />
      </div>

      <ol className="skill-branch__nodes" aria-label={`${branch.title} skill tree`}>
        {branch.nodes.map((node) => (
          <SkillNodeItem
            depth={0}
            key={node.id}
            node={node}
            onSelect={onSelect}
            selectedNodeId={selectedNodeId}
          />
        ))}
      </ol>
    </article>
  )
}

interface SkillNodeItemProps {
  node: SkillTreeNode
  depth: number
  selectedNodeId: string
  onSelect: (nodeId: string) => void
}

function SkillNodeItem({ node, depth, selectedNodeId, onSelect }: SkillNodeItemProps) {
  const Icon = iconMap[node.icon]
  const isSelected = node.id === selectedNodeId

  return (
    <li
      className="skill-node-slot"
      style={
        {
          '--child-count': String(node.children?.length ?? 0),
          '--node-depth': String(depth),
        } as CSSProperties
      }
    >
      <button
        aria-label={`${node.name}, ${statusLabels[node.status]}`}
        aria-pressed={isSelected}
        className="skill-node"
        data-depth={depth}
        data-selected={isSelected}
        data-status={node.status}
        onClick={() => onSelect(node.id)}
        style={{ '--node-accent': node.accent } as CSSProperties}
        type="button"
      >
        <span className="skill-node__branch-mark" aria-hidden="true" />
        <span className="skill-node__icon" aria-hidden="true">
          <Icon size={17} strokeWidth={2.1} />
        </span>
        <span className="skill-node__logo" aria-hidden="true">{node.logo}</span>
        <span className="skill-node__label">{node.name}</span>
        <span className="skill-node__state" aria-hidden="true" />
      </button>

      {node.children && node.children.length > 0 && (
        <ol
          className="skill-branch__children"
          style={
            {
              '--branch-spine-width':
                node.children.length > 1 ? `${(node.children.length - 1) * 4.05}rem` : '1px',
              '--child-count': String(node.children.length),
            } as CSSProperties
          }
        >
          {node.children.map((child) => (
            <SkillNodeItem
              depth={depth + 1}
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </ol>
      )}
    </li>
  )
}

function SkillDetailPanel({ skill }: { skill: SkillTreeNode }) {
  return (
    <aside
      className="skill-detail-panel"
      aria-live="polite"
      style={{ '--panel-accent': skill.accent } as CSSProperties}
    >
      <div className="skill-detail-panel__scanline" aria-hidden="true" />
      <header className="skill-detail-panel__header">
        <span>Selected node</span>
        <strong data-status={skill.status}>{statusLabels[skill.status]}</strong>
      </header>

      <div className="skill-detail-panel__showcase-wrap">
        <SkillShowcase skill={skill} />
      </div>

      <div className="skill-detail-panel__body" key={skill.id}>
        <h3>{skill.name}</h3>
        <p>{skill.description}</p>

        <dl className="skill-detail-panel__stats">
          <div>
            <dt>Status</dt>
            <dd>{statusLabels[skill.status]}</dd>
          </div>
          <div>
            <dt>Proficiency</dt>
            <dd>{skill.proficiency}</dd>
          </div>
        </dl>

        <section className="skill-detail-panel__usage" aria-labelledby={`${skill.id}-usage-title`}>
          <h4 id={`${skill.id}-usage-title`}>Project usage</h4>
          <ul>
            {skill.usage.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className="skill-detail-panel__tags" aria-label="Related tags">
          {skill.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </aside>
  )
}
