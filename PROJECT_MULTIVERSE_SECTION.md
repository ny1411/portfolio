# Project Multiverse Portal Scene - Implementation Plan

## Summary

- Add a new pinned `Project Multiverse` chapter for the two portfolio projects, leaving the existing `Suit Evolution` work scene intact.
- Place it in the flow as: `hero -> masking-parallax -> suit-evolution -> project-multiverse -> skills -> contact`.
- Render an interactive React Three Fiber multiverse world using repeated instances of `src/assets/3d-elements/portal_single_ring.glb`, with scroll-guided camera travel, constrained drag exploration, two-stage portal activation, cinematic effects, and an HTML project overlay.
- Use a `2200vh` pin duration in the existing `Scene`/`ScrollTrigger` architecture so the portal journey is the portfolio's project experience.

## Implementation Tasks

- [x] Register the single-ring portal GLB and add the post-processing runtime dependencies.
- [x] Add a `project-multiverse` feature module with project portal configuration, interaction state, scroll synchronization, 3D scene, and accessible focused-project overlay.
- [x] Build the cinematic portal world: guided camera path, constrained exploration controls, animated portal enhancements, atmospheric layers, and tiered post effects.
- [x] Insert `Project Multiverse` after Suit Evolution as the only project section.
- [x] Add responsive, reduced-motion, and custom HUD/overlay styling for desktop and touch devices.
- [x] Verify lint and production build.

## Key Changes

- Add `ProjectMultiverseSection` and a focused feature module for scene rendering, portal models/effects, camera control, overlay UI, scene state, and project-to-portal configuration.
- Add a `project-multiverse` entry to the existing scene array between `suit-evolution` and `skills`; render no image sequence for this scene and hide the generic cinematic HUD/footer in favor of a custom multiverse HUD.
- Register `portal_single_ring.glb?url` in the existing 3D asset registry and lazy-load/preload it only when the new scene is approaching visibility.
- Add `@react-three/postprocessing` and `postprocessing`; keep existing Lenis, GSAP `ScrollTrigger`, Motion, Zustand, Drei, and device profiling patterns.

## Data And Interfaces

- Derive two portal entries from `resumeContent.projectItems` through a local `ProjectPortal` adapter containing: `id`, `title`, `summary`, `stack`, `links`, `primaryHref`, visual theme tokens, world placement, and camera focus target.
- Configure portal destinations as:
  - `Repolyse`: second click opens the live demo; overlay also exposes Source code.
  - `GitMatch`: second click opens its GitHub source URL.
- Define local interaction state with `mode: 'guided' | 'exploring' | 'focused' | 'returning'`, `focusedPortalId`, hover state, and scene progress; use a controls return timer plus frame refs for transient activation/effects intensity.
- Reserve optional `audioCueUrl` or activation callback on each portal; ship no sound playback unless an audio asset is later supplied.

## Scene And Interaction Implementation

- Build a fullscreen atmospheric canvas with dark fog, sparse GPU-driven dust/sparkles, depth-separated light streaks, animated energy trails, subtle rifts, and restrained cyan/red/violet lighting.
- Build each project portal from a native-colored, widely spaced corridor of `portal_single_ring.glb` instances arcing through depth, with nearest rings rotating faster than distant rings; layer colored wireframe cages, an animated inner shader, ribbon/burst graphics, sparse themed particles, and activation-only glitch planes around the untouched model materials.
- Give each universe a distinct treatment:
  - Repolyse: cyan/violet AI portal with scan lines, digital motes, and holographic pulses.
  - GitMatch: magenta/red/cyan portal with kinetic connection trails and comic-motion accents.
- Drive a damped `CatmullRomCurve3` camera route from the section's normalized scroll progress: dark-space entrance, reveal/pass Repolyse, traverse toward GitMatch, then exit through fog/light into Skills.
- Trigger portal reveal, float, rotation, glow, particle density, and parallax from progress windows rather than adding separate scroll listeners.
- Implement constrained exploration as an orbit offset layered over the current guided camera position: no pan or user zoom, damping enabled, limited azimuth/polar rotation, touch support, and an eased return to guided framing after 1.5 seconds without drag input.
- On first portal click/tap, enter `focused` mode, animate the camera toward its focus anchor, brighten the interior, intensify particles/bloom/chromatic shift, and show the project overlay.
- On a second click/tap of the focused portal, open `primaryHref` in a new tab with `noopener,noreferrer`.
- On empty-scene click, overlay close, `Escape`, or intentional scrolling while focused, deactivate the portal and ease back to the guided camera at the current scroll position.
- Provide matching DOM buttons/overlay controls for keyboard users so portal focus and destination navigation are not canvas-only interactions.

## Effects, Responsiveness, And Performance

- Apply HDR emissive values plus thresholded bloom for selective-looking glow, subtle chromatic aberration during activation, vignette and low-opacity grain globally, and depth of field only while focused on capable devices.
- Represent minimal motion-blur energy through velocity-reactive streaks rather than an expensive full-screen motion-blur pass; allow a restrained high-tier god-ray accent only around an activated portal.
- Reuse `getDeviceProfile()` for DPR and quality tiers: high tier receives full post FX and richer particles; mid reduces density/DOF; low/mobile disables expensive rays/DOF/glitch layers and limits particle counts.
- Mount or preload the GLB near scene entry, reuse geometry, clone only mutable materials, dispose generated resources on teardown, and keep frame-loop animation values in refs rather than React render state.
- For coarse pointers, use one-finger constrained drag plus tap-to-focus/tap-again navigation; arrange the overlay below critical portal framing.
- For `prefers-reduced-motion`, disable idle travel, floating/ribbon motion, glitch, and camera zoom transitions; show a stable portal composition with accessible project buttons and simple fades.

## Transition And UI Treatment

- Fade the new world in during the opening progress range with fog and a minimal `Project Multiverse` signal label; keep portal information hidden until hover/focus or keyboard selection.
- Render a translucent holographic overlay for the focused project with title, description, stack chips, all available CTAs, a close action, and a clear "click portal again to enter" cue.
- During the final progress range, pull the camera through an exit rift while reducing particles and overlay chrome into a dark/fog veil before Skills.

## Test Plan

- [x] Run `npm run lint` and `npm run build`, including the new dependencies and GLB asset in the production build.
- [x] Verify from integration configuration that `Project Multiverse` appears between Suit Evolution and Skills.
- [ ] Browser-test desktop interaction: weighted scroll path, portal reveal, constrained drag/return, first-click focus, outside/Escape/scroll reset, and second-click new-tab navigation.
- [ ] Browser-test destinations: Repolyse opens its live demo while its overlay exposes source code; GitMatch opens GitHub.
- [ ] Browser-test mobile/touch layout, gesture behavior, and reduced-quality rendering.
- [ ] Browser-test keyboard access and reduced-motion behavior.
- [ ] Profile active-scene FPS and inspect browser console/network for WebGL/postprocessing/runtime asset errors.

## Assumptions

- Only the two current `projectItems` receive portals in this iteration; the configuration supports adding more later.
- `portal_single_ring.glb` is the shared repeated base portal model for both universes and will be added to tracked assets during implementation.
- Audio is activation-ready at the interface level but silent until a user-approved sound asset is provided.
