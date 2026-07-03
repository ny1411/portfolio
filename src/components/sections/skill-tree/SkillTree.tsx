import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { defaultSelectedSkillId, skillTreeBranches } from './skillTreeData'
import { SkillShowcase } from './SkillShowcase'
import type { SkillStatus, SkillTreeBranch, SkillTreeNode } from './types'

const statusLabels: Record<SkillStatus, string> = {
  locked: 'Locked',
  mastered: 'Mastered',
  unlocked: 'Unlocked',
}

type TheSvgIcon = {
  fileType?: string
  slug: string
  title: string
}

const skillIconMap: Record<string, TheSvgIcon> = {
  'api-rate-limiting': { slug: 'speedtest', title: 'API Rate Limiting' },
  authentication: { slug: 'auth0', title: 'Authentication' },
  axios: { slug: 'axios', title: 'Axios' },
  bcrypt: { fileType: 'default', slug: 'google-password-manager', title: 'bcrypt' },
  bootstrap: { slug: 'bootstrap', title: 'Bootstrap' },
  'ci-cd-pipelines': { slug: 'github-actions', title: 'GitHub Actions' },
  'context-api': { slug: 'react', title: 'Context API' },
  css3: { slug: 'css', title: 'CSS' },
  'css-grid-flexbox': { slug: 'css', title: 'CSS Flexbox' },
  eslint: { slug: 'eslint', title: 'ESLint' },
  'express-js': { slug: 'express', title: 'Express' },
  'framer-motion': {fileType: 'light', slug: 'motion', title: 'Motion' },
  'gemini-api': { slug: 'google-gemini', title: 'Google Gemini' },
  git: { slug: 'git', title: 'Git' },
  github: { slug: 'github', title: 'GitHub' },
  html5: { slug: 'html5', title: 'HTML5' },
  javascript: { slug: 'javascript', title: 'JavaScript' },
  'javascript-es6': { slug: 'javascript', title: 'JavaScript' },
  'jwt-jsonwebtoken': { slug: 'json-web-tokens', title: 'JSON Web Tokens' },
  middleware: { slug: 'express', title: 'Express' },
  mongodb: { slug: 'mongodb', title: 'MongoDB' },
  mongoose: { slug: 'mongoose', title: 'Mongoose' },
  'mvc-architecture': { slug: 'php', title: 'PHP' },
  mysql: { slug: 'mysql', title: 'MySQL' },
  'node-js': { slug: 'nodedotjs', title: 'Node.js' },
  npm: { slug: 'npm', title: 'npm' },
  postman: { slug: 'postman', title: 'Postman' },
  prettier: { slug: 'prettier', title: 'Prettier' },
  'react-js': { slug: 'react', title: 'React' },
  'react-performance': { slug: 'react', title: 'React' },
  'react-router': { slug: 'react-router', title: 'React Router' },
  'realtime-communication': { slug: 'webrtc', title: 'Real Time Communication' },
  render: { slug: 'render', title: 'Render' },
  'rest-apis': { slug: 'swagger', title: 'Rest APIs' },
  'shadcn-ui': { slug: 'shadcn-ui', title: 'Shadcn UI' },
  'socket-io': { slug: 'socketdotio', title: 'Socket.IO' },
  'tailwind-css': { slug: 'tailwind-css', title: 'Tailwind CSS' },
  typescript: { slug: 'typescript', title: 'TypeScript' },
  'vector-search': { slug: 'pinecone', title: 'Pinecone' },
  vercel: { slug: 'vercel', title: 'Vercel' },
  vite: { slug: 'vite', title: 'Vite' },
  websockets: { slug: 'socketdotio', title: 'Socket.IO' },
}

interface SkillTreeProps {
  branches?: readonly SkillTreeBranch[]
  initialSelectedNodeId?: string
  isActive?: boolean
}

interface ConnectorPath {
  active: boolean
  d: string
  id: string
  muted: boolean
  x: number
  y: number
}

interface ConnectorGraph {
  height: number
  paths: readonly ConnectorPath[]
  width: number
}

interface SkillTreeEdge {
  childId: string
  childStatus: SkillStatus
  parentId: string
  parentStatus: SkillStatus
}

interface BranchPathGeometry {
  d: string
  junctionX: number
  junctionY: number
}

export function SkillTree({
  branches = skillTreeBranches,
  initialSelectedNodeId = defaultSelectedSkillId,
  isActive = true,
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
  const activeNodeIds = useMemo(
    () => new Set(findNodeIdPath(branches, selectedNode.id) ?? [selectedNode.id]),
    [branches, selectedNode.id],
  )
  const maxIndex = Math.max(0, branches.length - 1)

  const scrollToSlide = (index: number) => {
    const viewport = viewportRef.current
    const track = trackRef.current
    const slide =
      slideRefs.current[index] ??
      track?.querySelector<HTMLElement>(`.skill-branch:nth-child(${index + 1})`)
    if (!viewport || !track || !slide) return

    const rawOffset = slide.offsetLeft - track.offsetLeft
    const maxOffset = Math.max(0, track.scrollWidth - viewport.clientWidth)

    setSlideOffset(Math.min(rawOffset, maxOffset))
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
          <span className="skill-tree-header__eyebrow">Skill Tree</span>
          <div>
            <h2 id="skill-tree-title">UNLOCKED <br/>WEB SKILLS.</h2>
            <p>
              The technologies and skills behind my work.            
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
                <strong>{branches[activeIndex]?.title}</strong>
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
                    activeNodeIds={activeNodeIds}
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

          <SkillDetailPanel isActive={isActive} skill={selectedNode} />
        </div>
      </div>
    </section>
  )
}

function flattenNodes(nodes: readonly SkillTreeNode[]): SkillTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children ?? [])])
}

function findNodeIdPath(
  branches: readonly SkillTreeBranch[],
  selectedNodeId: string,
): readonly string[] | null {
  for (const branch of branches) {
    const nodePath = findNodeIdPathInNodes(branch.nodes, selectedNodeId)

    if (nodePath) return nodePath
  }

  return null
}

function findNodeIdPathInNodes(
  nodes: readonly SkillTreeNode[],
  selectedNodeId: string,
): readonly string[] | null {
  for (const node of nodes) {
    if (node.id === selectedNodeId) return [node.id]

    const childPath = findNodeIdPathInNodes(node.children ?? [], selectedNodeId)

    if (childPath) return [node.id, ...childPath]
  }

  return null
}

function collectSkillTreeEdges(nodes: readonly SkillTreeNode[]): SkillTreeEdge[] {
  return nodes.flatMap((node) =>
    (node.children ?? []).flatMap((child) => [
      {
        childId: child.id,
        childStatus: child.status,
        parentId: node.id,
        parentStatus: node.status,
      },
      ...collectSkillTreeEdges([child]),
    ]),
  )
}

function createBranchPath(
  parentX: number,
  parentY: number,
  childX: number,
  childY: number,
): BranchPathGeometry {
  const deltaX = childX - parentX
  const deltaY = Math.max(1, childY - parentY)
  const stemLength = Math.min(34, Math.max(16, deltaY * 0.34))
  const junctionX = parentX
  const junctionY = parentY + stemLength
  const childStemY = childY - Math.min(26, Math.max(12, deltaY * 0.24))
  const shoulderX = Math.abs(deltaX) < 2 ? childX : parentX + deltaX * 0.68

  return {
    d: [
      `M ${parentX.toFixed(2)} ${parentY.toFixed(2)}`,
      `L ${junctionX.toFixed(2)} ${junctionY.toFixed(2)}`,
      `L ${shoulderX.toFixed(2)} ${childStemY.toFixed(2)}`,
      `L ${childX.toFixed(2)} ${childY.toFixed(2)}`,
    ].join(' '),
    junctionX,
    junctionY,
  }
}

interface SkillBranchSlideProps {
  activeNodeIds: ReadonlySet<string>
  branch: SkillTreeBranch
  index: number
  selectedNodeId: string
  refCallback: (node: HTMLElement | null) => void
  onSelect: (nodeId: string) => void
}

function SkillBranchSlide({
  activeNodeIds,
  branch,
  index,
  onSelect,
  refCallback,
  selectedNodeId,
}: SkillBranchSlideProps) {
  const branchRef = useRef<HTMLElement | null>(null)
  const [connectorGraph, setConnectorGraph] = useState<ConnectorGraph>({
    height: 0,
    paths: [],
    width: 0,
  })
  const edges = useMemo(() => collectSkillTreeEdges(branch.nodes), [branch.nodes])
  const style = {
    '--branch-order': String(index),
    '--root-spine-width':
      branch.nodes.length > 1 ? `${(branch.nodes.length - 1) * 4.05}rem` : '1px',
  } as CSSProperties
  const handleBranchRef = useCallback(
    (node: HTMLElement | null) => {
      branchRef.current = node
      refCallback(node)
    },
    [refCallback],
  )
  const measureConnectors = useCallback(() => {
    const branchElement = branchRef.current

    if (!branchElement) return

    const branchRect = branchElement.getBoundingClientRect()
    const paths = edges.flatMap((edge) => {
      const parent = branchElement.querySelector<HTMLButtonElement>(
        `.skill-node[data-node-id="${edge.parentId}"]`,
      )
      const child = branchElement.querySelector<HTMLButtonElement>(
        `.skill-node[data-node-id="${edge.childId}"]`,
      )

      if (!parent || !child) return []

      const parentRect = parent.getBoundingClientRect()
      const childRect = child.getBoundingClientRect()
      const parentX = parentRect.left + parentRect.width / 2 - branchRect.left
      const parentY = parentRect.bottom - branchRect.top
      const childX = childRect.left + childRect.width / 2 - branchRect.left
      const childY = childRect.top - branchRect.top
      const active = activeNodeIds.has(edge.parentId) && activeNodeIds.has(edge.childId)
      const geometry = createBranchPath(parentX, parentY, childX, childY)

      return [
        {
          active,
          d: geometry.d,
          id: `${edge.parentId}-${edge.childId}`,
          muted: edge.parentStatus === 'locked' || edge.childStatus === 'locked',
          x: geometry.junctionX,
          y: geometry.junctionY,
        },
      ]
    })

    setConnectorGraph({
      height: branchRect.height,
      paths,
      width: branchRect.width,
    })
  }, [activeNodeIds, edges])

  useLayoutEffect(() => {
    const branchElement = branchRef.current

    if (!branchElement) return

    measureConnectors()

    const resizeObserver = new ResizeObserver(() => {
      measureConnectors()
    })

    resizeObserver.observe(branchElement)
    branchElement.querySelectorAll('.skill-node').forEach((node) => resizeObserver.observe(node))

    const frame = window.requestAnimationFrame(measureConnectors)
    window.addEventListener('resize', measureConnectors)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', measureConnectors)
      resizeObserver.disconnect()
    }
  }, [measureConnectors])

  return (
    <article
      className="skill-branch"
      data-root-count={branch.nodes.length}
      data-tree-density={edges.length === 0 ? 'shallow' : 'branched'}
      ref={handleBranchRef}
      style={style}
    >
      <header className="skill-branch__header">
        <h3>{branch.title}</h3>
      </header>

      <SkillBranchConnectors graph={connectorGraph} />

      <ol className="skill-branch__nodes" aria-label={`${branch.title} skill tree`}>
        {branch.nodes.map((node) => (
          <SkillNodeItem
            depth={0}
            branchTitle={branch.title}
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

function SkillBranchConnectors({ graph }: { graph: ConnectorGraph }) {
  if (graph.width <= 0 || graph.height <= 0 || graph.paths.length === 0) return null

  return (
    <svg
      aria-hidden="true"
      className="skill-branch__connectors"
      focusable="false"
      viewBox={`0 0 ${graph.width} ${graph.height}`}
    >
      {graph.paths.map((path) => (
        <g data-active={path.active} data-muted={path.muted} key={path.id}>
          <path className="skill-branch__connector-path skill-branch__connector-path--base" d={path.d} />
          <path className="skill-branch__connector-path skill-branch__connector-path--glow" d={path.d} />
          {path.active && (
            <path className="skill-branch__connector-path skill-branch__connector-path--energy" d={path.d} />
          )}
          <circle className="skill-branch__connector-junction" cx={path.x} cy={path.y} r="3.4" />
        </g>
      ))}
    </svg>
  )
}

interface SkillNodeItemProps {
  node: SkillTreeNode
  depth: number
  branchTitle: string
  selectedNodeId: string
  onSelect: (nodeId: string) => void
}

function SkillNodeItem({ branchTitle, node, depth, selectedNodeId, onSelect }: SkillNodeItemProps) {
  const icon = skillIconMap[node.id]
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
        aria-current={isSelected ? 'true' : undefined}
        aria-label={`${node.name}, ${branchTitle}, ${statusLabels[node.status]}`}
        aria-pressed={isSelected}
        className="skill-node"
        data-depth={depth}
        data-node-kind={depth === 0 ? 'major' : 'sub'}
        data-node-id={node.id}
        data-selected={isSelected}
        data-status={node.status}
        onClick={() => onSelect(node.id)}
        style={{ '--node-accent': node.accent } as CSSProperties}
        type="button"
      >
        <span className="skill-node__branch-mark" aria-hidden="true" />
        <span className="skill-node__icon" aria-hidden="true">
          <TheSvgIcon icon={icon} />
        </span>
        <span className="skill-node__logo" aria-hidden="true">{node.logo}</span>
        <span className="skill-node__label">{node.name}</span>
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
              branchTitle={branchTitle}
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

function TheSvgIcon({ icon }: { icon: TheSvgIcon }) {
  const fileType = icon.fileType ?? 'default'
  return (
    <img
      alt=""
      className="skill-node__svg-mark"
      height="40"
      src={`https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${icon.slug}/${fileType}.svg`}
      title={icon.title}
      width="40"
    />
  )
}

function SkillDetailPanel({ isActive, skill }: { isActive: boolean; skill: SkillTreeNode }) {
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
        <SkillShowcase isActive={isActive} skill={skill} />
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
