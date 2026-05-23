# SUIT_UPGRADE_SECTION.md - Suit Evolution Experience Section

## Summary
Build a fullscreen, pinned "Suit Evolution" section where each formal work experience becomes a Spider-Man suit upgrade. This section replaces the old frame-sequence experience scene and uses the existing `.glb` suit assets.

Final suit mapping:
- Suit 01: Peter Parker Photographer Suit -> Kaizen Softservices, Web Developer Intern
- Suit 02: Ultimate Tech Suit -> Yahweh Software Solutions, Frontend Developer Intern
- Suit 03: Hybrid Advanced Suit -> Fermion Infotech, PHP Developer

## Key Changes
- [x] Create this plan file at the repo root before implementation.
- [x] Add a modular feature under `src/components/sections/suit-evolution/`:
  - [x] `SuitScene`
  - [x] `SuitModel`
  - [x] `HUDOverlay`
  - [x] `ExperienceCard`
  - [x] `ParticleBackground`
  - [x] `TransitionManager`
- [x] Add `SuitEvolutionSection` as the active experience presentation.
- [x] Keep the existing Lenis, GSAP `ScrollTrigger`, and scrolly scene architecture; consume existing scene progress instead of adding a second scroll system.
- [x] Add a new `suit-evolution` scene with a long cinematic pin duration equivalent to the intended `560vh` pacing in this repo's scroll system.
- [x] Remove the generic `experience` cards from `cinematicSections.ts` after replacing the old frame-sequence scene.

## Data And Interfaces
- [x] Update `resumeContent.workExperiences` to include Fermion Infotech as the third displayed suit stage:
  - Company: Fermion Infotech
  - Role: PHP Developer
  - Duration/location: `1 month, on site, Navi Mumbai`
  - Summary: `Description coming soon.`
  - Tags: `PHP`, `MVC`, `HTML`, `CSS`, `jQuery`, `Bootstrap`
  - Certificate link: omitted until available
- [x] Add a `suitEvolutionData` adapter that maps each work experience to:
  - suit name
  - model URL
  - company
  - role
  - duration/location
  - summary
  - tech tags
  - optional external link
- Model mapping:
  - Kaizen -> `spider-man - peter_parker_the_photographer.glb`
  - Yahweh -> `spider-man - ultimate suit.glb`
  - Fermion -> `spider-man - hybrid suit.glb`

## Implementation Checklist
- [x] Build the fullscreen section shell and atmospheric background.
- [x] Render the React Three Fiber suit scene with lazy-loaded GLB models.
- [x] Add scroll-driven active suit tracking and transition progress.
- [x] Add hover parallax and model/camera response.
- [x] Add velocity-reactive lens treatment.
- [x] Add custom HUD cards, tech tags, stage rail, and optional CTA handling.
- [x] Add responsive and reduced-motion states.
- [x] Verify lint and production build.
- [x] Verify desktop rendering.
- [ ] Verify mobile rendering.
- [x] Confirm the original frame-sequence experience scene has been removed.

## Experience Design
- Layout:
  - Fullscreen pinned section.
  - 3D suit model centered/right.
  - Minimal holographic HUD cards on the left.
  - Dark cinematic background with subtle fog, particles, scanlines, noise, and red/cyan lighting.
- 3D behavior:
  - Lazy-load `.glb` models with `Suspense` and `useGLTF`.
  - Normalize model scale/framing with Drei `Bounds`/`Center`.
  - Add slow float, auto-rotation, breathing scale, rim lighting, shadows, reflective material treatment, and emissive highlights.
  - On hover, apply restrained cursor parallax and slight head/upper-body tracking.
  - On scroll, transition suits with holographic reconstruction, particle dissolve, energy pulse, and camera offset.
- Lens behavior:
  - Use detected eye/lens meshes where reliable.
  - If unavailable, render a subtle holographic lens overlay near the head.
  - Scroll velocity drives lens intensity: fast scroll sharpens the lens effect; slow scroll relaxes it.
- HUD behavior:
  - Show company, role, duration/location, short summary, tech tags, and certificate button only when a link exists.
  - Use glassmorphism, animated brackets, scanlines, grid overlays, and restrained glow.
  - Use Framer Motion for UI reveal and hover states.
  - Use Lucide React icons for compact action buttons.

## Performance And Responsiveness
- Tune Canvas DPR using the existing `getDeviceProfile`.
- Keep animation hot paths in refs and `useFrame`, not React state.
- Pause or reduce 3D/particle intensity when the suit-evolution scene is inactive.
- Use low-density tsParticles with no click interaction.
- Dispose cloned materials/textures on unmount.
- On mobile, reduce particles, shadows, parallax, and transition intensity; place HUD so it never overlaps critical model framing.
- Respect `prefers-reduced-motion` with simple fades instead of dissolve/rebuild effects.

## Test Plan
- Run `npm run lint`.
- Run `npm run build`.
- Verify with desktop and mobile screenshots:
  - Old frame-sequence experience section no longer renders.
  - Suit Evolution experience section renders nonblank.
  - All three suits appear in order.
  - Fermion Infotech appears on the third/hybrid suit.
  - HUD updates cleanly during scroll.
  - Missing Fermion certificate link does not render a dead CTA.
  - No duplicate old experience cards appear.
  - HUD and model do not overlap on mobile.
- Check browser console for GLB loading, WebGL, and particle errors.
- Manually test slow and fast scrolling to confirm suit transitions and velocity-reactive lens behavior.

## Assumptions
- Fermion Infotech is intentionally the third suit stage, regardless of exact chronology.
- Fermion description and certificate link will be added later.
- The reference image is inspiration only; the implementation must create an original luxury HUD/interface.
- The rest of the existing scrollytelling portfolio remains intact.
