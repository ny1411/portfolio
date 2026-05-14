# Cinematic Scrollytelling Portfolio - Implementation Plan

## Current Status

The portfolio now uses a shared cinematic scrollytelling architecture across every main section:

- `hero`
- `about`
- `experience`
- `projects`
- `skills`
- `contact`

The implementation follows the Iron Man-style `CinematicReveal` pattern:

```
scroll -> normalized progress -> frame sequence + text visibility + HUD + CTA
```

The core decision is to keep a single normalized progress value per scene as the source of truth. Text cards, headings, HUD readouts, progress indicators, frame sequences, and outro transitions are all derived from that progress value instead of independent card listeners or event-triggered animation chains.

## Completed Tasks

### 1. Frame Sequence Loading & Sync

- [x] Updated `src/types/sequence.ts`
  - Added `preloadStrategy: 'cinematic'`.

- [x] Updated `src/lib/frameManifest.ts`
  - Supports `jpg`, `webp`, and `avif` frame assets.
  - Normalizes bundled frame URLs.

- [x] Updated `src/lib/sequenceLoader.ts`
  - Added first-frame eager loading for cinematic scenes.
  - Added nearby-frame staged loading for `cinematic` preload strategy.
  - Keeps pending frame requests deduplicated.

- [x] Updated `src/components/scrolly/useImageSequence.ts`
  - Avoids unnecessary redraws.
  - Supports smoother cinematic frame synchronization.

### 2. Reusable Cinematic Text System

- [x] Added `src/types/cinematic.ts`
  - Defines theme-agnostic cinematic card and scene contracts.
  - Supports shared card data for standard portfolio sections and future themes.

- [x] Added `src/components/scrolly/CinematicCard.tsx`
  - Single common card component for every cinematic text card.
  - Used by hero, about, experience, projects, skills, and contact.
  - Supports section-specific tone and animation variants.

- [x] Added `src/components/scrolly/CinematicSceneOverlay.tsx`
  - Drives section cards from shared scene progress.
  - Uses refs and CSS variables for hot-path animation updates.
  - Avoids independent scroll listeners per card.

- [x] Added `src/components/scrolly/CinematicSceneHud.tsx`
  - Shared cinematic HUD/readout/footer UI.
  - Reads scene progress through `useSceneProgress`.
  - Gives standard sections a consistent cinematic UI.

- [x] Added `src/data/cinematicSections.ts`
  - Defines progress-windowed text cards for all standard scenes.
  - Hero includes "With great power" / "Comes great responsibility" plus portfolio identity beats.
  - Experience and projects use scroll-windowed cards.
  - Skills use a vertical list animation.
  - Contact uses final CTA cards.

- [x] Updated `src/components/scrolly/Scene.tsx`
  - Renders `CinematicSceneOverlay`.
  - Renders `CinematicSceneHud`.
  - Keeps frame canvas, scene content, and cinematic text synchronized through the same scene progress.

### 3. Section Adoption

- [x] Updated `src/components/sections/HeroSection.tsx`
  - Converted to cinematic-overlay-driven content.

- [x] Updated `src/components/sections/AboutSection.tsx`
  - Converted to cinematic-overlay-driven content.

- [x] Updated `src/components/sections/ExperienceSection.tsx`
  - Experience cards now appear through progress windows.

- [x] Updated `src/components/sections/ProjectsSection.tsx`
  - Project cards now appear through progress windows.

- [x] Updated `src/components/sections/SkillsSection.tsx`
  - Skills now animate as a vertical list using the common card component.

- [x] Updated `src/components/sections/ContactSection.tsx`
  - Contact outro uses the shared cinematic card system.

### 4. Shared Cinematic Timing

- [x] Added `src/lib/cinematicTiming.ts`
  - Shared helpers for clamping, opacity interpolation, and visibility windows.

- [x] Updated `src/components/scrolly/ScrollyPage.tsx`
  - Keeps standard scenes in order.
  - Removes the old top `SceneProgress` bar from the rendered page.

### 5. Styling & Layout

- [x] Updated `src/styles/globals.css`
  - Added shared cinematic card placement.
  - Added section-specific card tones:
    - `hero`
    - `experience`
    - `project`
    - `tool`
    - `contact`
  - Added card animation variants:
    - `fade-slide`
    - `hero`
    - `stack`
    - `list`
    - `cta`
  - Added desktop and mobile placement rules.
  - Added mobile-safe spacing for the skills list.
  - Removed the visible green progress line from the app flow.

### 6. Local Artifacts

- [x] Updated `.gitignore`
  - Ignores `.playwright-mcp/`.

### 7. 3D Startup Loader

- [x] Added `src/components/loaders/SpiderLogoLoader.tsx`
  - Uses `src/assets/3d-elements/spider_logo3d.glb` as a removable startup loader component.
  - Spins the 3D logo in a constrained React Three Fiber canvas.
  - Applies a runtime Spider-Man red material with subtle procedural grain.
  - Falls back gracefully when WebGL is unavailable.

- [x] Updated `src/components/scrolly/ScrollyPage.tsx`
  - Shows the 3D loader before the hero section is revealed.
  - Keeps the loader visible for at least 3 seconds.
  - Keeps the loader running longer when the initial hero frame range is still loading.

- [x] Updated `src/lib/sequenceLoader.ts`
  - Added a concurrency-limited full-range frame preload helper for initial scene readiness.

- [x] Updated `src/styles/globals.css`
  - Styles the startup loader shell, centered 3D logo canvas, and WebGL fallback mark.
  - Removes the lower loading-line animation from the startup loader.

## Current Architecture

### Standard Scene Flow

```
ScrollTrigger scene pin
  -> Scene.onProgress(progress)
  -> scrollStore.setSceneProgress(progress)
  -> ImageSequenceCanvas reads progress
  -> CinematicSceneOverlay reads progress
  -> CinematicSceneHud reads progress
  -> canvas + cards + HUD update together
```

### Text Visibility Contract

Every cinematic card is controlled by a progress window:

```ts
const visible = progress >= card.show && progress <= card.hide
```

Cards can overlap intentionally to create cinematic crossfades. The system does not create per-card scroll listeners, per-card `ScrollTrigger`s, or independent event timelines.

## Key Files

### Data

- [x] `src/data/cinematicSections.ts`
  - Standard portfolio section cards and timing windows.

### Components

- [x] `src/components/scrolly/CinematicCard.tsx`
  - Shared card renderer.

- [x] `src/components/scrolly/CinematicSceneOverlay.tsx`
  - Standard scene card synchronizer.

- [x] `src/components/scrolly/CinematicSceneHud.tsx`
  - Shared cinematic HUD/footer.

### Hooks & Utilities

- [x] `src/components/scrolly/useSceneProgress.ts`
  - Reads active scene progress from the store without render churn.

- [x] `src/components/scrolly/useImageSequence.ts`
  - Draws canvas frames based on progress.

- [x] `src/lib/sequenceLoader.ts`
  - Loads, caches, and preloads frame sequences.

- [x] `src/lib/cinematicTiming.ts`
  - Small timing helpers.

## Section Behavior

### Hero

- [x] Uses cinematic cards for:
  - "With great power"
  - "Comes great responsibility"
  - `Neeraj`
  - portfolio identity / scroll prompt

- [x] Places hero copy with higher visual priority than supporting copy.

### Experience

- [x] Each experience card appears for a progress window.
- [x] Cards alternate side placement for visual weight.
- [x] Cards use the common `CinematicCard` component.

### Projects

- [x] Each project card appears for a progress window.
- [x] Cards use the common `CinematicCard` component.
- [x] Cards inherit project tone and placement rules.

### Skills

- [x] Skills animate as a vertical list.
- [x] List items fade and slide up.
- [x] Layout is adjusted for mobile to avoid overlap.

### Contact

- [x] Uses cinematic CTA cards.
- [x] Shares card and scene progress architecture.

## Performance & Anti-Jank Rules

- [x] One scene progress source drives all scene visuals.
- [x] Passive scroll listeners where local listeners are needed.
- [x] Hot-path animation uses refs and style mutation.
- [x] Canvas redraws are skipped when the frame index has not changed.
- [x] Frame loading is deduplicated through pending request tracking.
- [x] Cinematic preload strategy loads the first frame early, then nearby frames.
- [x] Text animation stays on `opacity` and `transform`.

## Verification Completed

- [x] `npm run build` passed.
- [x] Desktop browser verification completed with Playwright.
- [x] Mobile browser verification completed with Playwright.
- [x] Confirmed no console errors during verification.
- [x] Confirmed green top progress line is gone.
- [x] Confirmed skills list no longer overlaps on mobile.
- [x] Confirmed 3D startup loader build/lint verification passes.

## Commit History

- [x] `a99afee perf(scrolly): improve cinematic frame loading`
- [x] `b08c3ce feat(scrolly): add reusable cinematic text cards`
- [x] `792eabd chore: ignore playwright artifacts`
- [x] `e9d84fe feat(loader): add 3d startup loader`
- [x] `2fae714 perf(loader): preload hero frames before reveal`

## Remaining Follow-Up Tasks

### Visual Polish

- [ ] Review final card placement over the actual frame sequences scene by scene.
- [ ] Tune exact progress windows after watching the full scroll on multiple screen sizes.
- [ ] Add more deliberate hierarchy between primary hero beats and supporting portfolio text if needed.
### Accessibility

- [ ] Verify keyboard navigation through the full page.
- [ ] Add or confirm accessible labels for all CTA links.
- [ ] Review reduced-motion behavior across every cinematic section.
- [ ] Ensure cards do not trap focus while invisible.

### Performance

- [ ] Run Lighthouse performance audit.
- [ ] Record Chrome Performance trace and check dropped frames.
- [ ] Profile memory during full-page scroll.
- [ ] Decide whether frame assets should be converted to WebP/AVIF.
- [ ] Consider CDN/cache strategy for production frame delivery.

### Reusability

- [ ] Extract shared hero-theme config shape for future Iron Man/Batman-style reveals if another hero section is added.
- [ ] Add optional theme tokens for future card variants.
- [ ] Add docs/comments around progress-window authoring conventions.

## Known Workspace State

- [x] `src/assets/3d-elements/` contains the 3D logo consumed by the startup loader.
