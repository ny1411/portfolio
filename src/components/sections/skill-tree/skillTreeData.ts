import type { SkillTreeBranch, SkillTreeNode } from './types'

function skill(
  id: string,
  name: string,
  options: {
    artifact?: SkillTreeNode['artifact']
    icon?: SkillTreeNode['icon']
    status?: SkillTreeNode['status']
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
    status: options.status ?? 'locked',
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
    accent: '#22d3ee',
    children: options.children,
  }
}

function getLogoMark(name: string): string {
  const logoMarks: Record<string, string> = {
    'HTML5': 'H5',
    'CSS3': 'C3',
    'Bootstrap': 'B',
    'Tailwind CSS': 'TW',
    'CSS Grid & Flexbox': 'GF',
    'shadcn/ui': 'UI',
    'JavaScript (ES6+)': 'JS',
    'Axios': 'AX',
    'React.js': 'R',
    'Context API': 'CX',
    'React Router': 'RR',
    'Framer Motion': 'FM',
    'React Performance': 'RP',
    'TypeScript': 'TS',
    'Node.js': 'N',
    'Express.js': 'EX',
    'REST APIs': 'API',
    'Middleware': 'MW',
    'Authentication': 'AU',
    'JWT (jsonwebtoken)': 'JWT',
    'bcrypt': 'BC',
    'API Rate Limiting': 'RL',
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
    'Vector Search': 'VS',
    'Vercel': 'VC',
    'Render': 'RD',
    'CI/CD Pipelines': 'CI',
  }

  return logoMarks[name] ?? name.slice(0, 2).toUpperCase()
}

const spiderCyan = '#22d3ee'

export const skillTreeBranches: readonly SkillTreeBranch[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    subtitle: 'Markup, styling, React architecture, and typed UI work.',
    nodes: [
      skill('html5', 'HTML5', {
        artifact: 'terminal',
        icon: 'rocket',
        status: 'mastered',
        proficiency: 'Semantic page structure and accessible markup',
        description: 'Semantic HTML foundations for responsive portfolio and multi-page web experiences.',
        usage: ['Built multi-page website structures during internship work.', 'Used semantic sections and buttons in this skill tree.'],
        tags: ['Semantic HTML', 'Accessibility', 'Portfolio UI'],
      }),
      skill('css3', 'CSS3', {
        artifact: 'web',
        icon: 'scan',
        status: 'mastered',
        proficiency: 'Responsive layouts, visual systems, and interaction states',
        description: 'Modern CSS for responsive layouts, dark UI treatments, and readable component states.',
        usage: ['Styled cinematic portfolio sections and responsive project interfaces.'],
        tags: ['Responsive Design', 'CSS Architecture', 'Cross-Browser UI'],
        children: [
          skill('css-grid-flexbox', 'CSS Grid & Flexbox', {
            artifact: 'grid',
            icon: 'crosshair',
            status: 'mastered',
            proficiency: 'Precise responsive structure and alignment',
            description: 'Grid and Flexbox patterns for stable, responsive layouts with clear visual hierarchy.',
            usage: ['Structured responsive portfolio sections and interactive project layouts.'],
            tags: ['CSS Grid', 'Flexbox', 'Responsive UI'],
          }),
          skill('bootstrap', 'Bootstrap', {
            artifact: 'grid',
            icon: 'puzzle',
            status: 'mastered',
            tags: ['Bootstrap', 'Responsive UI'],
          }),
          skill('tailwind-css', 'Tailwind CSS', {
            artifact: 'web',
            icon: 'wand',
            status: 'mastered',
            proficiency: 'Utility-first styling for polished product UI',
            description: 'Tailwind CSS for fast, consistent, responsive interface styling.',
            usage: ['Styled Repolyse and portfolio UI systems with utility-first patterns.'],
            tags: ['Tailwind CSS', 'Repolyse', 'Design Tokens'],
            children: [
              skill('shadcn-ui', 'shadcn/ui', {
                artifact: 'cards',
                icon: 'radar',
                status: 'unlocked',
                tags: ['Components', 'Design System'],
              }),
            ],
          }),
        ],
      }),
      skill('javascript-es6', 'JavaScript (ES6+)', {
        artifact: 'terminal',
        icon: 'zap',
        status: 'mastered',
        proficiency: 'Interactive browser behavior and app logic',
        description: 'Modern JavaScript for interactive UI, dynamic content, filtering, validation, and app behavior.',
        usage: ['Implemented form validation, filtering, pagination, and dynamic loading in internship projects.'],
        tags: ['ES6+', 'Dynamic Interfaces', 'Validation', 'Pagination'],
        children: [
          skill('react-js', 'React.js', {
            artifact: 'orbital',
            icon: 'orbit',
            status: 'mastered',
            proficiency: 'Reusable component architecture',
            description: 'React.js for component-driven project interfaces and portfolio sections.',
            usage: ['Built Repolyse, GitMatch, and this portfolio with reusable React modules.'],
            tags: ['React.js', 'Components', 'Repolyse', 'GitMatch'],
            children: [
              skill('context-api', 'Context API', {
                artifact: 'pipeline',
                icon: 'fingerprint',
                status: 'unlocked',
                tags: ['State Management', 'React'],
              }),
              skill('react-router', 'React Router', {
                artifact: 'portal',
                icon: 'radar',
                status: 'unlocked',
                tags: ['Routing', 'Navigation'],
                children: [
                  skill('typescript', 'TypeScript', {
                    artifact: 'cube',
                    icon: 'cpu',
                    status: 'unlocked',
                    proficiency: 'Typed React components and data models',
                    description:
                      'TypeScript for safer component APIs, data configuration, and maintainable frontend code.',
                    usage: ['Typed the skill tree data, project portals, and portfolio scene components.'],
                    tags: ['Types', 'React', 'Maintainability'],
                    children: [
                      skill('axios', 'Axios', {
                        artifact: 'gateway',
                        icon: 'cable',
                        status: 'unlocked',
                        tags: ['HTTP Client', 'API Calls'],
                      }),
                    ],
                  }),
                ],
              }),
              skill('framer-motion', 'Framer Motion', {
                artifact: 'cards',
                icon: 'wand',
                status: 'unlocked',
                proficiency: 'Smooth UI transitions and gesture feedback',
                description: 'Framer Motion for polished transitions, animated panels, and gesture-driven interfaces.',
                usage: ['Used motion concepts for GitMatch swipe/card interactions and portfolio UI transitions.'],
                tags: ['Animation', 'Gestures', 'Transitions'],
              }),
              skill('react-performance', 'React Performance', {
                artifact: 'pipeline',
                icon: 'bug',
                status: 'locked',
                proficiency: 'Next optimization track for advanced React systems',
                description:
                  'Performance profiling, memoization strategy, and render-budget work for heavier React interfaces.',
                usage: ['Planned next layer for complex portfolio scenes and data-heavy project interfaces.'],
                tags: ['Profiling', 'Optimization', 'React'],
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
     
    nodes: [
      skill('node-js', 'Node.js', {
        artifact: 'server',
        icon: 'cpu',
        status: 'unlocked',
        proficiency: 'Backend runtime for API-driven applications',
        description: 'Node.js for server-side JavaScript, routing, API logic, and real-time app foundations.',
        usage: ['Built GitMatch backend logic with Node.js and Express.js.'],
        tags: ['Node.js', 'Backend', 'GitMatch'],
        children: [
          skill('express-js', 'Express.js', {
            artifact: 'gateway',
            icon: 'cable',
            status: 'unlocked',
            tags: ['Express.js', 'Routes', 'Middleware'],
          }),
          skill('rest-apis', 'REST APIs', {
            artifact: 'shield',
            icon: 'crosshair',
            status: 'unlocked',
            proficiency: 'Request/response contracts for app features',
            description: 'REST APIs for connecting frontend products to backend services and analysis workflows.',
            usage: ['Engineered Flask REST APIs for Repolyse repository analysis.'],
            tags: ['REST', 'Repolyse', 'API Contracts'],
          }),
          skill('middleware', 'Middleware', {
            artifact: 'pipeline',
            icon: 'scan',
            tags: ['Middleware', 'Request Pipeline'],
          }),
          skill('authentication', 'Authentication', {
            artifact: 'shield',
            icon: 'key',
            status: 'unlocked',
            tags: ['Auth', 'Security'],
            children: [
              skill('jwt-jsonwebtoken', 'JWT (jsonwebtoken)', {
                artifact: 'shield',
                icon: 'fingerprint',
                status: 'unlocked',
                tags: ['JWT', 'jsonwebtoken'],
              }),
              skill('bcrypt', 'bcrypt', {
                artifact: 'terminal',
                icon: 'key',
                status: 'unlocked',
                tags: ['Password Hashing', 'Security'],
              }),
            ],
          }),
          skill('api-rate-limiting', 'API Rate Limiting', {
            artifact: 'shield',
            icon: 'radar',
            status: 'locked',
            proficiency: 'Planned hardening layer for production APIs',
            description: 'Rate limits and abuse protection for public API surfaces and auth-heavy services.',
            usage: ['Planned for production-grade backend service hardening.'],
            tags: ['API Security', 'Reliability'],
          }),
          skill('realtime-communication', 'Real-time Communication', {
            artifact: 'pipeline',
            icon: 'zap',
            status: 'unlocked',
            tags: ['Realtime', 'Live Updates'],
            children: [
              skill('websockets', 'WebSockets', {
                artifact: 'gateway',
                icon: 'cable',
                status: 'unlocked',
                tags: ['WebSockets', 'Realtime'],
                children: [
                  skill('socket-io', 'Socket.IO', {
                    artifact: 'portal',
                    icon: 'orbit',
                    status: 'unlocked',
                    tags: ['Socket.IO', 'Realtime'],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  },
  {
    id: 'databases',
    title: 'Databases',
    subtitle: 'Document and relational database foundations.',
     
    nodes: [
      skill('mongodb', 'MongoDB', {
        artifact: 'database',
        icon: 'radar',
        status: 'unlocked',
        proficiency: 'Document database modeling',
        description: 'MongoDB for flexible document-oriented data models in JavaScript applications.',
        tags: ['MongoDB', 'NoSQL', 'Document Data'],
        children: [
          skill('mongoose', 'Mongoose', {
            artifact: 'database',
            icon: 'scan',
            tags: ['Mongoose', 'Schemas', 'Models'],
          }),
        ],
      }),
      skill('mysql', 'MySQL', {
        artifact: 'database',
        icon: 'crosshair',
        status: 'mastered',
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
     
    nodes: [
      skill('git', 'Git', {
        artifact: 'pipeline',
        icon: 'rocket',
        status: 'mastered',
        proficiency: 'Version control for project delivery',
        usage: ['Managed source history and project iterations across portfolio work.'],
        tags: ['Git', 'Version Control'],
      }),
      skill('github', 'GitHub', {
        artifact: 'portal',
        icon: 'orbit',
        status: 'mastered',
        proficiency: 'Repository collaboration and project hosting',
        usage: ['Built GitHub-powered project ideas such as Repolyse and GitMatch.'],
        tags: ['GitHub', 'Repositories', 'Open Source'],
      }),
      skill('postman', 'Postman', {
        artifact: 'gateway',
        icon: 'crosshair',
        status: 'mastered',
        tags: ['API Testing', 'HTTP'],
      }),
      skill('npm', 'npm', {
        artifact: 'terminal',
        icon: 'zap',
        status: 'unlocked',
        tags: ['Packages', 'Scripts'],
      }),
      skill('vite', 'Vite', {
        artifact: 'cube',
        icon: 'rocket',
        status: 'unlocked',
        tags: ['Vite', 'Frontend Tooling'],
      }),
      skill('eslint', 'ESLint', {
        artifact: 'shield',
        icon: 'bug',
        status: 'unlocked',
        tags: ['Linting', 'Code Quality'],
      }),
      skill('prettier', 'Prettier', {
        artifact: 'web',
        icon: 'wand',
        status: 'mastered',
        tags: ['Formatting', 'Code Style'],
      }),
    ],
  },
  {
    id: 'ai-integrations',
    title: 'AI & Integrations',
    subtitle: 'AI-powered API integrations for developer tools.',
     
    nodes: [
      skill('gemini-api', 'Gemini API', {
        artifact: 'neural',
        icon: 'orbit',
        status: 'unlocked',
        proficiency: 'AI-assisted repository analysis',
        description: 'Gemini API integration for practical developer tooling and repository intelligence.',
        usage: ['Used Gemini in Repolyse to analyze GitHub repositories and support security scoring.'],
        tags: ['Gemini API', 'Repolyse', 'AI Integration'],
        children: [
          skill('vector-search', 'Vector Search', {
            artifact: 'neural',
            icon: 'radar',
            status: 'locked',
            proficiency: 'Planned retrieval layer for richer AI products',
            description: 'Vector search and retrieval patterns for more contextual AI-assisted developer tools.',
            usage: ['Future expansion path for AI-powered code and repository intelligence.'],
            tags: ['Embeddings', 'Retrieval', 'AI'],
          }),
        ],
      }),
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment',
    subtitle: 'Hosting and backend deployment targets.',
     
    nodes: [
      skill('vercel', 'Vercel', {
        artifact: 'cloud',
        icon: 'rocket',
        status: 'mastered',
        proficiency: 'Frontend deployment',
        usage: ['Deployed the Repolyse live demo on Vercel.'],
        tags: ['Vercel', 'Frontend Hosting', 'Repolyse'],
      }),
      skill('render', 'Render', {         
        artifact: 'server',
        icon: 'cable',
        status: 'unlocked',
        proficiency: 'Service deployment',
        description: 'Render for hosting backend services and deployable web app infrastructure.',
        tags: ['Render', 'Backend Hosting'],
      }),
      skill('ci-cd-pipelines', 'CI/CD Pipelines', {         
        artifact: 'pipeline',
        icon: 'zap',
        status: 'locked',
        proficiency: 'Planned release automation track',
        description: 'Automated checks and deployment pipelines for stronger shipping workflows.',
        usage: ['Future improvement path for larger portfolio and product codebases.'],
        tags: ['CI/CD', 'Automation', 'Release Quality'],
      }),
    ],
  },
] as const

export const defaultSelectedSkillId = 'react-js'
