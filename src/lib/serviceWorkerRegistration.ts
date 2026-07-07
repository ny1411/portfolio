import { getFrameCacheName } from './persistentFrameCache'

export function registerFrameServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  const serviceWorkerUrl = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.origin)

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(serviceWorkerUrl.href)
      .then((registration) => {
        const sendCacheVersion = (sw: ServiceWorker | null) => {
          if (sw) {
            sw.postMessage({ type: 'SET_CACHE_VERSION', cacheName: getFrameCacheName() })
          }
        }

        // Send to whichever worker is currently in the pipeline
        sendCacheVersion(registration.installing || registration.waiting || registration.active)

        // Ensure newly activated workers also get the message
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          sendCacheVersion(navigator.serviceWorker.controller)
        })
      })
      .catch(() => {
        // Frame caching remains opportunistic; direct Cache Storage loading still works.
      })
  })
}
