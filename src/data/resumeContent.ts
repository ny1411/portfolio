export const resumeContent = {
	resumePages: [
		{
			id: 'overview',
			title: 'Neeraj Yamaji',
			subtitle:
				'Frontend developer focused on React, TypeScript, responsive web experiences, and practical AI-powered developer tools.',
		},
		{
			id: 'profile-focus',
			title: 'About',
			subtitle:
				'Frontend developer building polished, responsive web products with React, TypeScript, and practical AI integrations.',
			summary:
				'I like turning product ideas into interfaces and systems that feel clear, fast, and usable. My work includes real-time dashboards, responsive websites, GitHub-powered matchmaking tools, and AI-assisted code analysis, with a focus on clean React architecture and thoughtful interaction details.',
			highlights: ['ReactJS', 'TypeScript', 'Tailwind CSS', 'Product UI'],
		},
		{
			id: 'technical-range',
			title: 'Full-Stack Range',
			subtitle:
				'Comfortable connecting frontend interfaces with APIs, databases, cloud tools, and AI services.',
			summary:
				'Project work spans Flask, Node.js, Express.js, Firebase, transformer models, Gemini, and matching/recommendation logic.',
			highlights: ['Node.js', 'Express.js', 'Flask', 'Firebase', 'Gemini'],
		},
		{
			id: 'contact',
			title: 'Contact',
			subtitle: '',
			body: [
				'Email: neerajyamaji@gmail.com',
				'LinkedIn: https://linkedin.com/in/neeraj-yamaji',
				'Twitter: https://x.com/n_y_1411/',
				'GitHub: https://github.com/ny1411',
				'Phone: +91-9021017715',
				'WhatsApp: https://wa.me/919021017715',
				'Location: Pune, MH',
			],
			highlights: ['Email', 'LinkedIn', 'GitHub', 'Phone'],
		},
	],
	workExperiences: [
		{
			title: 'PHP Developer at Fermion Infotech',
			subtitle: 'On site, Navi Mumbai, 1 month',
			body: [
				'Built and deployed projects including a Todo App and an E-Commerce Platform in PHP featuring authentication systems, session management, role-based modules, database integration, and responsive user interfaces.',
				'Implemented secure login and password management using bcrypt, and developed interactive frontend features such as form validation, filtering, and dynamic content rendering.'
			],
			link: '',
			tags: ['PHP', 'MVC', 'HTML', 'CSS', 'jQuery', 'REST APIs', 'Bootstrap'],
		},
		{
			title: 'Frontend Developer Intern at Yahweh Software Solutions',
			subtitle: 'Remote, Bengaluru, KA, May 2025 - Sept 2025',
			body: [
				'Architected and developed real-time dashboards across multiple modules of an Education ERP.',
				'Developed a Bus Tracking System to provide real-time location updates using MapBoxGL.',
			],
			link: 'https://drive.google.com/file/d/1b5qlTdBPUsItcsR__OkyJDukrNN78U7p/view?usp=sharing',
			tags: ['Frontend Development', 'ReactJS', 'Tailwind CSS', 'ERP Systems', 'Supabase', 'MapBoxGL'],
		},
		{
			title: 'Web Developer Intern at Kaizen Softservices',
			subtitle: 'Pune, MH, Jan 2025 - Feb 2025',
			body: [
				'Developed a comprehensive multi-page website using HTML5, CSS3, and JavaScript.',
				'Integrated interactive JavaScript features including form validation, search/filtering, pagination, and dynamic content loading.',
			],
			link: 'https://drive.google.com/file/d/1wxjprxRy5IHJs8iBYombCEBykI_BvIUJ/view?usp=sharing',
			tags: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'Responsive Design'],
		},
	],
	projectItems: [
		{
			title: 'Repolyse',
			stack: ['ReactJS', 'Tailwind CSS', 'Flask', 'Python', 'Gemini'],
			body: [
				"Engineered a Flask REST API that analyses GitHub repositories using Google's Gemini and 4 transformer models: CodeBERT, RoBERTa, DistilBERT, and T5.",
				'Implemented intelligent security scanning that detects vulnerabilities through keyword analysis and ML-based classification with a 10-point scoring system.',
			],
			links: [
				{ label: 'Source code', href: 'https://github.com/ny1411/repolyse' },
				{ label: 'Live demo', href: 'https://repolyse.vercel.app/' },
			],
		},
		{
			title: 'GitMatch',
			stack: ['ReactJS', 'Node.js', 'Express.js', 'Firebase'],
			body: [
				'Built a Tinder-style dating web application with interactive swipe gestures and dynamic card transitions using Motion animation library.',
				'Architected and implemented a scalable real-time matching algorithm with a 65/35 weighted scoring system that analyzes GitHub profiles, tech stacks, and compatibility factors.',
			],
			links: [
				{ label: 'Source code', href: 'https://github.com/ny1411/git-match' },
			],
		},
	],
	extracurricularExperiences: [
		{
			title: 'Hacktoberfest',
			subtitle: 'Open-Source Contribution, Remote, Oct 2025',
			link: 'https://www.holopin.io/@ny1411',
			tags: ['Open Source', '6 Accepted PRs', 'Features', 'Bug Fixes'],
		},
		{
			title: 'Smart India Hackathon',
			subtitle: 'Hackathon, Sept 2025',
			link: 'https://youtu.be/6J57p__akaA',
			tags: ['Team Leadership', 'Institute Rank 2', 'Hackathon'],
		},
		{
			title: 'Courses & Hackathon Certifications',
			subtitle: 'Selected certification folder from resume',
			link: 'https://drive.google.com/drive/folders/1Rcdef31gItuSz6HHmgi7xpneBRTOkXB4?usp=sharing',
			tags: ['Courses', 'Hackathons', 'Certifications'],
		},
	],
	educationDetails: {
		institution: "TSSM's BSCOER",
		degree: "Bachelor's of Engineering",
		period: 'July 2022 - June 2026',
		grade: 'Pune, MH',
		focus: 'Engineering undergraduate program.',
	},
	skillsAndStack: {
		languages: [
			'JavaScript',
			'TypeScript',
			'Java',
			'PHP',
			'HTML',
			'CSS',
			'Python',
		],
		frontend: [
			'ReactJS',
			'Tailwind CSS',
			'Next.js',
			'Bootstrap',
			'HTML5',
			'CSS3',
			'Responsive Design',
			'Cross-Browser Compatibility',
		],
		backendApis: ['Node.js', 'Express.js', 'FastAPI', 'Flask', 'REST APIs'],
		cloudDatabases: [
			'Firebase',
			'MySQL',
			'Supabase',
			'MongoDB',
			'Google Cloud',
		],
		developerTools: ['VS Code', 'Git', 'NodeJS', 'Collab', 'Jenkins'],
	},
} as const;
