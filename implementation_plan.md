# Video Scrollytelling Implementation Notes

The portfolio now uses local MP4 assets for scroll-scrubbed cinematic sections.
Scene progress remains the shared source of truth for video time, text card visibility,
HUD progress, and navigation state.

## Current Architecture

- `src/components/scrolly/ScrollyPage.tsx` defines the ordered video scenes.
- `src/components/scrolly/Scene.tsx` pins each scene and mounts video only for the
  active scene plus one warm adjacent scene.
- `src/components/scrolly/VideoScrub.tsx` maps normalized scene progress directly
  to `HTMLVideoElement.currentTime`.
- `src/components/scrolly/CinematicSceneOverlay.tsx` derives card visibility from
  the same normalized scene progress.
- `src/components/scrolly/CinematicSceneHud.tsx` reports video scrub progress.

## Removed Legacy Pipeline

- Image-sequence configs and asset-count based timing.
- Canvas image-sequence rendering.
- Frame preload/cache utilities.
- Frame conversion/upload scripts.
- Remote object-storage delivery dependencies and environment variables.

## Verification Checklist

- Run `npm run build`.
- Confirm the startup loader releases once the hero video is ready.
- Scroll through all sections and check that active, previous, and next video
  mounting behavior feels responsive.
- Check reduced-motion mode uses the midpoint still for each video section.
