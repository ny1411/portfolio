export function registerFrameServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  const serviceWorkerUrl = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.origin)

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(serviceWorkerUrl.href).catch(() => {
      // Frame caching remains opportunistic; direct Cache Storage loading still works.
    })
  })
}
