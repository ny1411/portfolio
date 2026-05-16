import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { preloadSpiderLogoModel } from './lib/spiderLogoModel'

preloadSpiderLogoModel()

const root = createRoot(document.getElementById('root')!)

void import('./App.tsx').then(({ default: App }) => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
