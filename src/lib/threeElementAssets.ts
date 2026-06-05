import hybridSuitUrl from '../../public/3d-elements/spider-man - hybrid suit.glb?url'
import peterParkerPhotographerSuitUrl from '../../public/3d-elements/spider-man - peter_parker_the_photographer suit.glb?url'
import ultimateSuitUrl from '../../public/3d-elements/spider-man - ultimate suit.glb?url'
import spiderLogoUrl from '../../public/3d-elements/spider_logo3d.glb?url'
import portalSingleRingUrl from '../../public/3d-elements/portal_single_ring.glb?url'
import axiosUrl from '../../public/3d-elements/skills/axios.glb?url'
import cssUrl from '../../public/3d-elements/skills/css.glb?url'
import expressJsUrl from '../../public/3d-elements/skills/express-js.glb?url'
import geminiAiUrl from '../../public/3d-elements/skills/gemini-ai.glb?url'
import gitUrl from '../../public/3d-elements/skills/git.glb?url'
import githubUrl from '../../public/3d-elements/skills/github.glb?url'
import htmlUrl from '../../public/3d-elements/skills/html.glb?url'
import javascriptUrl from '../../public/3d-elements/skills/javascript.glb?url'
import jsonWebTokenUrl from '../../public/3d-elements/skills/json-web-token.glb?url'
import mongodbUrl from '../../public/3d-elements/skills/mongodb.glb?url'
import mongooseUrl from '../../public/3d-elements/skills/mongoose.glb?url'
import mySqlUrl from '../../public/3d-elements/skills/my-sql.glb?url'
import nodeJsUrl from '../../public/3d-elements/skills/node-js.glb?url'
import npmUrl from '../../public/3d-elements/skills/npm.glb?url'
import postmanUrl from '../../public/3d-elements/skills/postman.glb?url'
import prettierUrl from '../../public/3d-elements/skills/prettier.glb?url'
import reactRouterUrl from '../../public/3d-elements/skills/react-router.glb?url'
import reactUrl from '../../public/3d-elements/skills/react.glb?url'
import renderUrl from '../../public/3d-elements/skills/render.glb?url'
import socketIoUrl from '../../public/3d-elements/skills/socket.io.glb?url'
import tailwindCssUrl from '../../public/3d-elements/skills/tailwind-css.glb?url'
import typescriptUrl from '../../public/3d-elements/skills/typescript.glb?url'
import vercelUrl from '../../public/3d-elements/skills/vercel.glb?url'
import viteUrl from '../../public/3d-elements/skills/vite.glb?url'
import webSocketsUrl from '../../public/3d-elements/skills/web-sockets.glb?url'

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
    geminiApi: geminiAiUrl,
    git: gitUrl,
    github: githubUrl,
    html5: htmlUrl,
    javascriptEs6: javascriptUrl,
    jwtJsonwebtoken: jsonWebTokenUrl,
    mongodb: mongodbUrl,
    mongoose: mongooseUrl,
    mysql: mySqlUrl,
    nodeJs: nodeJsUrl,
    npm: npmUrl,
    postman: postmanUrl,
    prettier: prettierUrl,
    reactJs: reactUrl,
    reactRouter: reactRouterUrl,
    render: renderUrl,
    socketIo: socketIoUrl,
    tailwindCss: tailwindCssUrl,
    typescript: typescriptUrl,
    vercel: vercelUrl,
    vite: viteUrl,
    websockets: webSocketsUrl,
  },
  logo: spiderLogoUrl,
  portalSingleRing: portalSingleRingUrl,
} as const

export const allThreeElementAssetUrls = [
  threeElementAssets.suits.peterParkerPhotographer,
  threeElementAssets.suits.ultimate,
  threeElementAssets.suits.hybrid,
  threeElementAssets.logo,
  threeElementAssets.portalSingleRing,
  ...Object.values(threeElementAssets.skills),
] as const
