const frameUrls = import.meta.glob('../../public/frames/**/*.{jpg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export function getBundledFrameUrl(folder: string, filename: string): string | undefined {
  const url =
    frameUrls[`../../public/frames/${folder}/${filename}`] ??
    frameUrls[`../../public/frames/${folder}/${filename}`]

  return url ? normalizeFrameUrl(url) : undefined
}

function normalizeFrameUrl(url: string): string {
  return url.replace('?import&url', '').replace('&url', '')
}
