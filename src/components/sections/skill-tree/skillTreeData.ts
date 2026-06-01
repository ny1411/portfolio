import type { SkillTreeBranch, SkillTreeNode } from './types'

function skill(
  id: string,
  name: string,
  options: {
    accent: string
    artifact?: SkillTreeNode['artifact']
    icon?: SkillTreeNode['icon']
    proficiency?: string
    description?: string
    usage?: readonly string[]
    tags?: readonly string[]
    children?: readonly SkillTreeNode[]
  },
): SkillTreeNode {
  return {
    id,
    name,
    status: 'mastered',
    proficiency: options.proficiency ?? 'Portfolio-ready working knowledge',
    description:
      options.description ??
      `${name} is part of my practical web development toolkit for building maintainable, responsive products.`,
    usage: options.usage ?? [
      'Used across portfolio and project work where this tool fits the product requirement.',
    ],
    tags: options.tags ?? [name],
    icon: options.icon ?? 'blocks',
    logo: getLogoMark(name),
    artifact: options.artifact ?? 'cube',
    accent: options.accent,
    children: options.children,
  }
}

function getLogoMark(name: string): string {
  const logoMarks: Record<string, string> = {
    'HTML5': 'H5',
    'CSS3': 'C3',
    'Bootstrap': 'B',
    'Tailwind CSS': 'TW',
    'shadcn/ui': 'UI',
    'JavaScript (ES6+)': 'JS',
    'Axios': 'AX',
    'React.js': 'R',
    'Context API': 'CX',
    'React Router': 'RR',
    'Framer Motion': 'FM',
    'TypeScript': 'TS',
    'Node.js': 'N',
    'Express.js': 'EX',
    'REST APIs': 'API',
    'Middleware': 'MW',
    'Authentication': 'AU',
    'JWT (jsonwebtoken)': 'JWT',
    'bcrypt': 'BC',
    'Real-time Communication': 'RT',
    'WebSockets': 'WS',
    'Socket.IO': 'IO',
    'MVC Architecture': 'MVC',
    'MongoDB': 'MDB',
    'Mongoose': 'MG',
    'MySQL': 'SQL',
    'Git': 'G',
    'GitHub': 'GH',
    'Postman': 'PM',
    'npm': 'npm',
    'Vite': 'V',
    'ESLint': 'ES',
    'Prettier': 'PR',
    'Gemini API': 'AI',
    'Vercel': 'VC',
    'Render': 'RD',
  }

  return logoMarks[name] ?? name.slice(0, 2).toUpperCase()
}

const frontendAccent = '#38bdf8'
const backendAccent = '#22c55e'
const databaseAccent = '#f59e0b'
const toolsAccent = '#c084fc'
const aiAccent = '#ef4444'
const deploymentAccent = '#2dd4bf'

export const skillTreeBranches: readonly SkillTreeBranch[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    subtitle: 'Markup, styling, React architecture, and typed UI work.',
    accent: frontendAccent,
    nodes: [
      skill('html5', 'HTML5', {
        accent: '#fb923c',
        artifact: 'terminal',
        icon: 'terminal',
        proficiency: 'Semantic page structure and accessible markup',
        description: 'Semantic HTML foundations for responsive portfolio and multi-page web experiences.',
        usage: ['Built multi-page website structures during internship work.', 'Used semantic sections and buttons in this skill tree.'],
        tags: ['Semantic HTML', 'Accessibility', 'Portfolio UI'],
      }),
      skill('css3', 'CSS3', {
        accent: frontendAccent,
        artifact: 'web',
        icon: 'sparkles',
        proficiency: 'Responsive layouts, visual systems, and interaction states',
        description: 'Modern CSS for responsive layouts, dark UI treatments, and readable component states.',
        usage: ['Styled cinematic portfolio sections and responsive project interfaces.'],
        tags: ['Responsive Design', 'CSS Architecture', 'Cross-Browser UI'],
        children: [
          skill('bootstrap', 'Bootstrap', {
            accent: '#a78bfa',
            artifact: 'grid',
            icon: 'blocks',
            tags: ['Bootstrap', 'Responsive UI'],
          }),
          skill('tailwind-css', 'Tailwind CSS', {
            accent: '#22d3ee',
            artifact: 'web',
            icon: 'sparkles',
            proficiency: 'Utility-first styling for polished product UI',
            description: 'Tailwind CSS for fast, consistent, responsive interface styling.',
            usage: ['Styled Repolyse and portfolio UI systems with utility-first patterns.'],
            tags: ['Tailwind CSS', 'Repolyse', 'Design Tokens'],
            children: [
              skill('shadcn-ui', 'shadcn/ui', {
                accent: '#e2e8f0',
                artifact: 'cards',
                icon: 'panels',
                tags: ['Components', 'Design System'],
              }),
            ],
          }),
        ],
      }),
      skill('javascript-es6', 'JavaScript (ES6+)', {
        accent: '#facc15',
        artifact: 'terminal',
        icon: 'braces',
        proficiency: 'Interactive browser behavior and app logic',
        description: 'Modern JavaScript for interactive UI, dynamic content, filtering, validation, and app behavior.',
        usage: ['Implemented form validation, filtering, pagination, and dynamic loading in internship projects.'],
        tags: ['ES6+', 'Dynamic Interfaces', 'Validation', 'Pagination'],
        children: [
          skill('react-js', 'React.js', {
            accent: frontendAccent,
            artifact: 'orbital',
            icon: 'atom',
            proficiency: 'Reusable component architecture',
            description: 'React.js for component-driven project interfaces and portfolio sections.',
            usage: ['Built Repolyse, GitMatch, and this portfolio with reusable React modules.'],
            tags: ['React.js', 'Components', 'Repolyse', 'GitMatch'],
            children: [
              skill('context-api', 'Context API', {
                accent: '#60a5fa',
                artifact: 'pipeline',
                icon: 'workflow',
                tags: ['State Management', 'React'],
              }),
              skill('react-router', 'React Router', {
                accent: '#38bdf8',
                artifact: 'portal',
                icon: 'panels',
                tags: ['Routing', 'Navigation'],
                children: [
                  skill('typescript', 'TypeScript', {
                    accent: '#60a5fa',
                    artifact: 'cube',
                    icon: 'braces',
                    proficiency: 'Typed React components and data models',
                    description:
                      'TypeScript for safer component APIs, data configuration, and maintainable frontend code.',
                    usage: ['Typed the skill tree data, project portals, and portfolio scene components.'],
                    tags: ['Types', 'React', 'Maintainability'],
                    children: [
                      skill('axios', 'Axios', {
                        accent: '#818cf8',
                        artifact: 'gateway',
                        icon: 'workflow',
                        tags: ['HTTP Client', 'API Calls'],
                      }),
                    ],
                  }),
                ],
              }),
              skill('framer-motion', 'Framer Motion', {
                accent: '#f472b6',
                artifact: 'cards',
                icon: 'sparkles',
                proficiency: 'Smooth UI transitions and gesture feedback',
                description: 'Framer Motion for polished transitions, animated panels, and gesture-driven interfaces.',
                usage: ['Used motion concepts for GitMatch swipe/card interactions and portfolio UI transitions.'],
                tags: ['Animation', 'Gestures', 'Transitions'],
              }),
            ],
          }),
        ],
      }),
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    subtitle: 'Node services, APIs, auth, realtime systems, and MVC.',
    accent: backendAccent,
    nodes: [
      skill('node-js', 'Node.js', {
        accent: backendAccent,
        artifact: 'server',
        icon: 'server',
        proficiency: 'Backend runtime for API-driven applications',
        description: 'Node.js for server-side JavaScript, routing, API logic, and real-time app foundations.',
        usage: ['Built GitMatch backend logic with Node.js and Express.js.'],
        tags: ['Node.js', 'Backend', 'GitMatch'],
        children: [
          skill('express-js', 'Express.js', {
            accent: '#4ade80',
            artifact: 'gateway',
            icon: 'workflow',
            tags: ['Express.js', 'Routes', 'Middleware'],
          }),
          skill('rest-apis', 'REST APIs', {
            accent: '#14b8a6',
            artifact: 'shield',
            icon: 'shield',
            proficiency: 'Request/response contracts for app features',
            description: 'REST APIs for connecting frontend products to backend services and analysis workflows.',
            usage: ['Engineered Flask REST APIs for Repolyse repository analysis.'],
            tags: ['REST', 'Repolyse', 'API Contracts'],
          }),
          skill('middleware', 'Middleware', {
            accent: '#86efac',
            artifact: 'pipeline',
            icon: 'workflow',
            tags: ['Middleware', 'Request Pipeline'],
          }),
          skill('authentication', 'Authentication', {
            accent: '#f43f5e',
            artifact: 'shield',
            icon: 'shield',
            tags: ['Auth', 'Security'],
            children: [
              skill('jwt-jsonwebtoken', 'JWT (jsonwebtoken)', {
                accent: '#fb7185',
                artifact: 'shield',
                icon: 'shield',
                tags: ['JWT', 'jsonwebtoken'],
              }),
              skill('bcrypt', 'bcrypt', {
                accent: '#f97316',
                artifact: 'terminal',
                icon: 'terminal',
                tags: ['Password Hashing', 'Security'],
              }),
            ],
          }),
          skill('realtime-communication', 'Real-time Communication', {
            accent: '#22d3ee',
            artifact: 'pipeline',
            icon: 'workflow',
            tags: ['Realtime', 'Live Updates'],
            children: [
              skill('websockets', 'WebSockets', {
                accent: '#38bdf8',
                artifact: 'gateway',
                icon: 'workflow',
                tags: ['WebSockets', 'Realtime'],
                children: [
                  skill('socket-io', 'Socket.IO', {
                    accent: '#818cf8',
                    artifact: 'portal',
                    icon: 'workflow',
                    tags: ['Socket.IO', 'Realtime'],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      skill('mvc-architecture', 'MVC Architecture', {
        accent: '#f59e0b',
        artifact: 'grid',
        icon: 'blocks',
        proficiency: 'Separation of concerns for maintainable apps',
        description: 'MVC Architecture for organizing application responsibilities and maintaining older web systems.',
        usage: ['Worked with MVC patterns during PHP developer experience.'],
        tags: ['MVC', 'Architecture', 'PHP Experience'],
      }),
    ],
  },
  {
    id: 'databases',
    title: 'Databases',
    subtitle: 'Document and relational database foundations.',
    accent: databaseAccent,
    nodes: [
      skill('mongodb', 'MongoDB', {
        accent: '#22c55e',
        artifact: 'database',
        icon: 'database',
        proficiency: 'Document database modeling',
        description: 'MongoDB for flexible document-oriented data models in JavaScript applications.',
        tags: ['MongoDB', 'NoSQL', 'Document Data'],
        children: [
          skill('mongoose', 'Mongoose', {
            accent: '#16a34a',
            artifact: 'database',
            icon: 'database',
            tags: ['Mongoose', 'Schemas', 'Models'],
          }),
        ],
      }),
      skill('mysql', 'MySQL', {
        accent: databaseAccent,
        artifact: 'database',
        icon: 'database',
        proficiency: 'Relational database basics',
        description: 'MySQL for relational data modeling, structured queries, and traditional backend applications.',
        tags: ['MySQL', 'SQL', 'Relational Data'],
      }),
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    subtitle: 'Development workflow, code quality, and API testing.',
    accent: toolsAccent,
    nodes: [
      skill('git', 'Git', {
        accent: '#f97316',
        artifact: 'pipeline',
        icon: 'git',
        proficiency: 'Version control for project delivery',
        usage: ['Managed source history and project iterations across portfolio work.'],
        tags: ['Git', 'Version Control'],
      }),
      skill('github', 'GitHub', {
        accent: '#e2e8f0',
        artifact: 'portal',
        icon: 'git',
        proficiency: 'Repository collaboration and project hosting',
        usage: ['Built GitHub-powered project ideas such as Repolyse and GitMatch.'],
        tags: ['GitHub', 'Repositories', 'Open Source'],
      }),
      skill('postman', 'Postman', {
        accent: '#fb923c',
        artifact: 'gateway',
        icon: 'workflow',
        tags: ['API Testing', 'HTTP'],
      }),
      skill('npm', 'npm', {
        accent: '#ef4444',
        artifact: 'terminal',
        icon: 'terminal',
        tags: ['Packages', 'Scripts'],
      }),
      skill('vite', 'Vite', {
        accent: '#a78bfa',
        artifact: 'cube',
        icon: 'sparkles',
        tags: ['Vite', 'Frontend Tooling'],
      }),
      skill('eslint', 'ESLint', {
        accent: '#818cf8',
        artifact: 'shield',
        icon: 'shield',
        tags: ['Linting', 'Code Quality'],
      }),
      skill('prettier', 'Prettier', {
        accent: '#f472b6',
        artifact: 'web',
        icon: 'sparkles',
        tags: ['Formatting', 'Code Style'],
      }),
    ],
  },
  {
    id: 'ai-integrations',
    title: 'AI & Integrations',
    subtitle: 'AI-powered API integrations for developer tools.',
    accent: aiAccent,
    nodes: [
      skill('gemini-api', 'Gemini API', {
        accent: aiAccent,
        artifact: 'neural',
        icon: 'brain',
        proficiency: 'AI-assisted repository analysis',
        description: 'Gemini API integration for practical developer tooling and repository intelligence.',
        usage: ['Used Gemini in Repolyse to analyze GitHub repositories and support security scoring.'],
        tags: ['Gemini API', 'Repolyse', 'AI Integration'],
      }),
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment',
    subtitle: 'Hosting and backend deployment targets.',
    accent: deploymentAccent,
    nodes: [
      skill('vercel', 'Vercel', {
        accent: '#e2e8f0',
        artifact: 'cloud',
        icon: 'cloud',
        proficiency: 'Frontend deployment',
        usage: ['Deployed the Repolyse live demo on Vercel.'],
        tags: ['Vercel', 'Frontend Hosting', 'Repolyse'],
      }),
      skill('render', 'Render', {
        accent: deploymentAccent,
        artifact: 'server',
        icon: 'cloud',
        proficiency: 'Service deployment',
        description: 'Render for hosting backend services and deployable web app infrastructure.',
        tags: ['Render', 'Backend Hosting'],
      }),
    ],
  },
] as const

export const defaultSelectedSkillId = 'html5'
