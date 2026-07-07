/**
 * Frame-caching service worker.
 *
 * The cache name is no longer hardcoded — it is sent from the main thread
 * via a `SET_CACHE_VERSION` message so the service worker always uses the
 * same build-derived version as the app bundle.
 *
 * Until a version message is received the worker falls through to network
 * fetch without caching (safe degraded behaviour).
 */

const FRAME_CACHE_NAME_PREFIX = 'portfolio-frames-'
const FRAME_CACHE_URL_PREFIX = '/frames/'
const FRAME_CACHE_FOLDERS = ['/frames/video1/', '/frames/video6/']

/** Set by the main thread via postMessage. */
let activeCacheName = null

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    deleteOldFrameCaches().then(() => self.clients.claim()),
  )
})

/**
 * Listen for the app to send the current build-derived cache version.
 * This message is sent once from `serviceWorkerRegistration.ts` after
 * the worker is registered and `getFrameCacheName()` is available.
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_CACHE_VERSION') {
    activeCacheName = event.data.cacheName || null

    // Clean up old caches whenever the version updates.
    event.waitUntil(deleteOldFrameCaches())
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  if (!activeCacheName) return
  if (!isFrameRequest(request.url)) return

  event.respondWith(getCachedFrameFirst(request))
})

async function getCachedFrameFirst(request) {
  const cache = await caches.open(activeCacheName)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) return cachedResponse

  const response = await fetch(request)
  if (isCacheableFrameResponse(response)) {
    await cache.put(request, response.clone())
  }

  return response
}

/**
 * Deletes all `portfolio-frames-*` caches except the currently active one.
 * Keeps one previous cache for rolling deploy safety.
 */
async function deleteOldFrameCaches() {
  try {
    const cacheNames = await caches.keys()
    const oldCaches = cacheNames
      .filter((name) => name.startsWith(FRAME_CACHE_NAME_PREFIX) && name !== activeCacheName)
      .sort()

    // Retain 1 previous cache to ease rolling deploys.
    const toDelete = oldCaches.slice(0, Math.max(0, oldCaches.length - 1))

    await Promise.all(toDelete.map((name) => caches.delete(name)))
  } catch {
    // Cleanup is best-effort.
  }
}

function isFrameRequest(url) {
  try {
    const resolvedUrl = new URL(url)
    if (resolvedUrl.origin !== self.location.origin) return false
    if (!resolvedUrl.pathname.includes(FRAME_CACHE_URL_PREFIX)) return false

    return FRAME_CACHE_FOLDERS.some((folder) => resolvedUrl.pathname.includes(folder))
  } catch {
    return false
  }
}

function isCacheableFrameResponse(response) {
  if (!response.ok) return false

  return response.type === 'basic' || response.type === 'default'
}
