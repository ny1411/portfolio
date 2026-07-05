import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerFrameServiceWorker } from './lib/serviceWorkerRegistration.ts'
import './styles/globals.css'
import App from './App.tsx'

registerFrameServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
