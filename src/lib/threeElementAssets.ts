

const PUBLIC_ASSET_URL = (relativePath: string) =>
	`${import.meta.env.BASE_URL}${relativePath}`;

const hybridSuitUrl = PUBLIC_ASSET_URL(
	'3d-elements/spider-man - hybrid suit.glb',
);
const peterParkerPhotographerSuitUrl = PUBLIC_ASSET_URL(
	'3d-elements/spider-man - peter_parker_the_photographer suit.glb',
);
const ultimateSuitUrl = PUBLIC_ASSET_URL(
	'3d-elements/spider-man - ultimate suit.glb',
);
const spiderLogoUrl = PUBLIC_ASSET_URL('3d-elements/spider_logo3d.glb');
const portalSingleRingUrl = PUBLIC_ASSET_URL(
	'3d-elements/portal_single_ring.glb',
);
const axiosUrl = PUBLIC_ASSET_URL('3d-elements/skills/axios.glb');
const cssUrl = PUBLIC_ASSET_URL('3d-elements/skills/css.glb');
const expressJsUrl = PUBLIC_ASSET_URL('3d-elements/skills/express-js.glb');
const firebaseUrl = PUBLIC_ASSET_URL('3d-elements/skills/firebase.glb');
const flaskUrl = PUBLIC_ASSET_URL('3d-elements/skills/flask.glb');
const geminiAiUrl = PUBLIC_ASSET_URL('3d-elements/skills/gemini-ai.glb');
const gitUrl = PUBLIC_ASSET_URL('3d-elements/skills/git.glb');
const githubUrl = PUBLIC_ASSET_URL('3d-elements/skills/github.glb');
const htmlUrl = PUBLIC_ASSET_URL('3d-elements/skills/html.glb');
const javascriptUrl = PUBLIC_ASSET_URL('3d-elements/skills/javascript.glb');
const jsonWebTokenUrl = PUBLIC_ASSET_URL(
	'3d-elements/skills/json-web-token.glb',
);
const mapboxUrl = PUBLIC_ASSET_URL('3d-elements/skills/mapbox.glb');
const mongodbUrl = PUBLIC_ASSET_URL('3d-elements/skills/mongodb.glb');
const mongooseUrl = PUBLIC_ASSET_URL('3d-elements/skills/mongoose.glb');
const mySqlUrl = PUBLIC_ASSET_URL('3d-elements/skills/my-sql.glb');
const nodeJsUrl = PUBLIC_ASSET_URL('3d-elements/skills/node-js.glb');
const npmUrl = PUBLIC_ASSET_URL('3d-elements/skills/npm.glb');
const postmanUrl = PUBLIC_ASSET_URL('3d-elements/skills/postman.glb');
const prettierUrl = PUBLIC_ASSET_URL('3d-elements/skills/prettier.glb');
const pythonUrl = PUBLIC_ASSET_URL('3d-elements/skills/python.glb');
const reactRouterUrl = PUBLIC_ASSET_URL('3d-elements/skills/react-router.glb');
const reactUrl = PUBLIC_ASSET_URL('3d-elements/skills/react.glb');
const renderUrl = PUBLIC_ASSET_URL('3d-elements/skills/render.glb');
const socketIoUrl = PUBLIC_ASSET_URL('3d-elements/skills/socket.io.glb');
const tailwindCssUrl = PUBLIC_ASSET_URL('3d-elements/skills/tailwind-css.glb');
const threeJsUrl = PUBLIC_ASSET_URL('3d-elements/skills/three-js.glb');
const typescriptUrl = PUBLIC_ASSET_URL('3d-elements/skills/typescript.glb');
const vercelUrl = PUBLIC_ASSET_URL('3d-elements/skills/vercel.glb');
const viteUrl = PUBLIC_ASSET_URL('3d-elements/skills/vite.glb');
const webSocketsUrl = PUBLIC_ASSET_URL('3d-elements/skills/web-sockets.glb');

export const skillModelAssetUrls = [
	axiosUrl,
	cssUrl,
	expressJsUrl,
	firebaseUrl,
	flaskUrl,
	geminiAiUrl,
	gitUrl,
	githubUrl,
	htmlUrl,
	javascriptUrl,
	jsonWebTokenUrl,
	mapboxUrl,
	mongodbUrl,
	mongooseUrl,
	mySqlUrl,
	nodeJsUrl,
	npmUrl,
	postmanUrl,
	prettierUrl,
	pythonUrl,
	reactRouterUrl,
	reactUrl,
	renderUrl,
	socketIoUrl,
	tailwindCssUrl,
	threeJsUrl,
	typescriptUrl,
	vercelUrl,
	viteUrl,
	webSocketsUrl,
] as const;

export const skillModelAssetUrlById = {
	axios: axiosUrl,
	css3: cssUrl,
	'express-js': expressJsUrl,
	firebase: firebaseUrl,
	flask: flaskUrl,
	'gemini-api': geminiAiUrl,
	git: gitUrl,
	github: githubUrl,
	html5: htmlUrl,
	'javascript-es6': javascriptUrl,
	'jwt-jsonwebtoken': jsonWebTokenUrl,
	mapbox: mapboxUrl,
	mongodb: mongodbUrl,
	mongoose: mongooseUrl,
	mysql: mySqlUrl,
	'node-js': nodeJsUrl,
	npm: npmUrl,
	postman: postmanUrl,
	prettier: prettierUrl,
	python: pythonUrl,
	'react-js': reactUrl,
	'react-router': reactRouterUrl,
	render: renderUrl,
	'socket-io': socketIoUrl,
	'tailwind-css': tailwindCssUrl,
	'three-js': threeJsUrl,
	typescript: typescriptUrl,
	vercel: vercelUrl,
	vite: viteUrl,
	websockets: webSocketsUrl,
} as const;

export const suitModelAssetUrls = [
	peterParkerPhotographerSuitUrl,
	ultimateSuitUrl,
	hybridSuitUrl,
] as const;

export const projectPortalAssetUrls = [portalSingleRingUrl] as const;

export const threeElementAssets = {
	suits: {
		peterParkerPhotographer: peterParkerPhotographerSuitUrl,
		ultimate: ultimateSuitUrl,
		hybrid: hybridSuitUrl,
	},
	skills: {
		axios: axiosUrl,
		css3: cssUrl,
		expressJs: expressJsUrl,
		firebase: firebaseUrl,
		flask: flaskUrl,
		geminiApi: geminiAiUrl,
		git: gitUrl,
		github: githubUrl,
		html5: htmlUrl,
		javascriptEs6: javascriptUrl,
		jwtJsonwebtoken: jsonWebTokenUrl,
		mapbox: mapboxUrl,
		mongodb: mongodbUrl,
		mongoose: mongooseUrl,
		mysql: mySqlUrl,
		nodeJs: nodeJsUrl,
		npm: npmUrl,
		postman: postmanUrl,
		prettier: prettierUrl,
		python: pythonUrl,
		reactJs: reactUrl,
		reactRouter: reactRouterUrl,
		render: renderUrl,
		socketIo: socketIoUrl,
		tailwindCss: tailwindCssUrl,
		threeJs: threeJsUrl,
		typescript: typescriptUrl,
		vercel: vercelUrl,
		vite: viteUrl,
		websockets: webSocketsUrl,
	},
	logo: spiderLogoUrl,
	portalSingleRing: portalSingleRingUrl,
} as const;

export const allThreeElementAssetUrls = [
	...suitModelAssetUrls,
	threeElementAssets.logo,
	...projectPortalAssetUrls,
	...skillModelAssetUrls,
] as const;
