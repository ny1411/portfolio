const spiderLogoUrl = '/models/spider_logo3d.glb'

export { spiderLogoUrl }
export const spiderLogoPreloadUrl = spiderLogoUrl

export function preloadSpiderLogoModel(): void {
  if (typeof document !== 'undefined') {
    const hrefs = [spiderLogoPreloadUrl, spiderLogoUrl]

    hrefs.forEach((href) => {
      const existing = document.head.querySelector(`link[href="${href}"]`)
      if (existing) return

      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'fetch'
      link.href = href
      link.type = 'model/gltf-binary'
      link.crossOrigin = 'anonymous'
      link.setAttribute('fetchpriority', 'high')
      document.head.prepend(link)
    })
  }
}
