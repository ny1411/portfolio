const FRAME_CACHE_NAME = 'portfolio-frames-v1'
const FRAME_CACHE_PREFIX = '/frames/'
const FRAME_CACHE_FOLDERS = ['/frames/video1/', '/frames/video6/']
const FRAME_CACHE_NAME_PREFIX = 'portfolio-frames-'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith(FRAME_CACHE_NAME_PREFIX) && cacheName !== FRAME_CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  if (!isFrameRequest(request.url)) return

  event.respondWith(getCachedFrameFirst(request))
})

async function getCachedFrameFirst(request) {
  const cache = await caches.open(FRAME_CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) return cachedResponse

  const response = await fetch(request)
  if (isCacheableFrameResponse(response)) {
    await cache.put(request, response.clone())
  }

  return response
}

function isFrameRequest(url) {
  try {
    const resolvedUrl = new URL(url)
    if (resolvedUrl.origin !== self.location.origin) return false
    if (!resolvedUrl.pathname.includes(FRAME_CACHE_PREFIX)) return false

    return FRAME_CACHE_FOLDERS.some((folder) => resolvedUrl.pathname.includes(folder))
  } catch {
    return false
  }
}

function isCacheableFrameResponse(response) {
  if (!response.ok) return false

  return response.type === 'basic' || response.type === 'default'
}
