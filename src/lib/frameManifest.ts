const frameUrls = import.meta.glob('../assets/frames/**/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export function getBundledFrameUrl(folder: string, filename: string): string | undefined {
  return (
    frameUrls[`../assets/frames/${folder}/${filename}`] ??
    frameUrls[`/src/assets/frames/${folder}/${filename}`]
  )
}
