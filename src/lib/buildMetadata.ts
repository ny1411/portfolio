/**
 * Build-time metadata injected by Vite's `define` config.
 *
 * `__BUILD_TIMESTAMP__` is replaced at build time with the ISO timestamp of
 * the production build. During development (`vite dev`), it resolves to the
 * dev server start time, which changes on each restart — giving dev builds
 * their own unique cache versions too.
 *
 * This value is used to derive the persistent frame cache name so that every
 * deploy automatically invalidates old caches without requiring a manual
 * version bump.
 */
declare const __BUILD_TIMESTAMP__: string

/**
 * Returns a short, filesystem/cache-safe version tag derived from the
 * build timestamp. The tag is an 8-character lowercase hex string built
 * from a simple hash of the ISO timestamp.
 *
 * Examples:
 * - `"2026-07-08T00:00:00.000Z"` → `"a1b2c3d4"`
 *
 * The hash is intentionally simple (djb2); collisions are acceptable because
 * the worst case is a redundant re-download, never stale content.
 */
export function getBuildVersion(): string {
  return hashString(getBuildTimestamp())
}

/**
 * Returns the raw ISO timestamp string injected at build time.
 */
export function getBuildTimestamp(): string {
  try {
    return __BUILD_TIMESTAMP__
  } catch {
    // Fallback for SSR/test environments where the define may be missing.
    return 'dev'
  }
}

/**
 * Simple djb2 hash → 8-char hex string.
 * Not cryptographic; only needs to be unique per distinct input.
 */
function hashString(input: string): string {
  let hash = 5381

  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0
  }

  return hash.toString(16).padStart(8, '0')
}
