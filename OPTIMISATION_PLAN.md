# Portfolio Frame And Asset Optimisation Plan

## Purpose

This plan documents the current preload behaviour on the `feat-preload` branch and the steps needed to optimise frame loading, section preparation, decoded-frame memory use, reverse-direction navigation, and persistent browser caching.

The goal is to make the hero section smooth first, then warm later sections early enough that transitions feel instant without competing with hero startup.

## Current Context

Branch reviewed: `feat-preload`.

Relevant code paths:

- `src/components/scrolly/ScrollyPage.tsx`
- `src/lib/sequenceLoader.ts`
- `src/lib/frameCache.ts`
- `src/components/scrolly/useImageSequence.ts`
- `src/components/scrolly/ImageSequenceCanvas.tsx`
- `src/components/scrolly/Scene.tsx`
- `src/types/sequence.ts`
- `src/lib/frameManifest.ts`
- `src/lib/threeElementAssets.ts`
- `src/components/sections/suit-evolution/SuitModel.tsx`
- `src/components/sections/project-multiverse/ProjectPortalModel.tsx`
- `src/components/sections/skill-tree/SkillShowcase.tsx`

Important assets:

- Hero frame sequence: `public/frames/video1`
- Contact frame sequence: `public/frames/video6`
- 3D assets: `public/3d-elements`
- Skill 3D assets: `public/3d-elements/skills`

Measured local frame counts and compressed sizes:

- `video1`: 297 frames, about 58.18 MB compressed
- `video6`: 140 frames, about 51.88 MB compressed
- Total cinematic frame assets: 437 frames, about 110.06 MB compressed

Current implementation summary:

- `ScrollyPage.tsx` preloads the first available sequence, currently hero/video1.
- Startup waits for:
  - `MIN_STARTUP_LOADER_MS = 3000`
  - first `STARTUP_PRELOAD_FRAME_LIMIT = 50` hero frames
- After startup, `ScrollyPage.tsx` continues preloading the full hero sequence with `BACKGROUND_FRAME_PRELOAD_CONCURRENCY = 3`.
- Contact/video6 frames are not explicitly background-preloaded after startup.
- Contact frames begin loading when the contact scene sequence canvas is enabled and starts drawing/preloading around current scroll progress.
- Non-hero sections are lazy-loaded with `React.lazy`.
- `allowedSceneIndex` limits section mounting:
  - before startup: only hero
  - after startup while scrolling: current scene
  - after startup while idle: current scene plus next scene
- Skill model GLBs are warmed only when the active scene reaches the scene before skills.
- `frameCache` is in-memory only and capped at 160 decoded frames.
- `sequenceLoader.ts` stores pending frame fetches in `pendingFrames`, so duplicate requests for the same frame reuse one promise.
- `loadFrame()` fetches a frame, converts the response to a `Blob`, decodes via `createImageBitmap()` when available, stores the decoded frame in `frameCache`, and returns it.
- `preloadFrameWindow()` warms frames around the current drawn frame.
- The current cache is decoded memory cache, not persistent browser storage.

## Current Problems

1. Hero startup feels good only for the initially loaded frames.

   The first 40-60 frames can be ready, but later hero frames may still be in queue. If the user scrubs quickly or stays in hero long enough to hit unloaded frames, rendering can become inefficient.

2. Later sequences wait behind current-section loading.

   The full hero preload runs after startup, but contact frames are not given their own background preload phase. If the user reaches contact before enough frames are cached, contact begins work too late.

3. Preload is forward-biased.

   The system mostly prepares current and next content. It should also keep the previous section warm so upward scrolling does not cause avoidable loading.

4. Section preparation happens too close to visibility.

   Current flow is close to:

   ```text
   Reach section
   Mount section
   Load assets
   Render
   ```

   Desired flow:

   ```text
   Section 2 visible
   Begin mounting/importing Section 3
   Begin loading Section 3 assets
   User reaches Section 3
   Render quickly
   ```

5. Decoded-frame cache is too small for the current asset set.

   The cache limit is 160 decoded frames. Hero alone has 297 frames. Hero plus contact has 437 frames. The decoded cache cannot hold all frames and should not blindly try to on every device.

6. The app does not control persistent frame caching.

   The browser may use HTTP cache depending on server headers, but the application has no explicit Cache Storage strategy for frame sequences.

## Target Behaviour

The target preload model is phased, not "everything immediately".

```text
Startup
↓
Load first 40-60 hero frames
↓
Show the page
↓
Continue loading remaining hero frames aggressively
↓
Hero completely ready
↓
User reaches section 2
↓
Background preload contact frames
↓
Contact is already warm before user reaches it
```

The target section-preparation model is a sliding window.

```text
Current section: hot
Previous section: warm
Next section: warm
```

Example when section 3 is active:

```text
Keep section 2 warm
Keep section 3 hot
Keep section 4 warm
```

If the user scrolls upward:

```text
Section 3 active
↓
User scrolls upward
↓
Prioritise section 2
↓
Continue warming hero if needed
```

## Definitions

Hot:

- Content is mounted or immediately mountable.
- JS chunk has already been requested/imported.
- Current sequence has a decoded frame window around current progress.
- Current frame requests use highest priority.

Warm:

- JS chunk has been requested/imported early.
- GLB assets have been preloaded if applicable.
- Frame sequence raw assets are being cached or have been cached.
- A small decoded frame window is available around likely entry progress.

Background:

- Non-urgent asset fetch/cache work.
- Should not interrupt hero startup or active scrubbing.
- Can pause or reduce concurrency while user is actively scrolling.

Persistent raw cache:

- Stores original `.webp` frame responses in Cache Storage.
- Survives page reloads and can speed up second and later visits.
- Does not store decoded `ImageBitmap`s.

Decoded memory cache:

- Stores decoded `ImageBitmap` or `HTMLImageElement` objects.
- Fastest for drawing.
- Temporary and memory-heavy.
- Cleared when page is closed.

## Browser API References

Use these as implementation references:

- MDN CacheStorage: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
- MDN Cache API: https://developer.mozilla.org/en-US/docs/Web/API/Cache
- MDN HTTP caching: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
- MDN Cache-Control: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control
- MDN rel=preload: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload
- MDN navigator.deviceMemory: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
- Vite public directory: https://vite.dev/guide/assets#the-public-directory
- web.dev HTTP cache: https://web.dev/articles/http-cache
- web.dev service worker and HTTP cache: https://web.dev/articles/service-worker-caching-and-http-caching
- web.dev service workers and Cache Storage: https://web.dev/articles/service-workers-cache-storage

Important API notes:

- `CacheStorage` is widely available and exposed through `window.caches` in secure contexts.
- `CacheStorage` can also be used from service workers.
- Cache Storage stores `Request`/`Response` pairs, not decoded image objects.
- Browser HTTP cache already exists, but application control is limited.
- `navigator.deviceMemory` is useful but limited. It is not available in all browsers and should be treated as optional.
- `navigator.deviceMemory` requires a secure context in supporting browsers.
- `rel="preload"` is best for resources needed very soon, not hundreds of frames.
- Vite serves files from `public` at the root path in dev and copies them as-is to production `dist`.

## Phase 1: Establish Asset Metadata

Goal: Give the preload system a single source of truth for scene assets.

Files to change:

- `src/components/scrolly/ScrollyPage.tsx`
- Add new file: `src/lib/sceneAssetManifest.ts`
- Optional type updates: `src/types/scene.ts`
- Optional type updates: `src/types/sequence.ts`
- Use existing `src/lib/threeElementAssets.ts`

Tasks:

1. Move or mirror scene asset knowledge into a manifest.

   The manifest should include:
   - scene id
   - scene index
   - sequence config if present
   - lazy import preloader if present
   - GLB asset URLs if present
   - rough priority role

2. Include sequence scenes:
   - `hero` uses `video1`
   - `contact` uses `video6`

3. Include non-sequence section assets:
   - `suit-evolution`: suit GLBs from `suitEvolutionData`/`SuitModel.tsx`
   - `project-multiverse`: portal GLB from `ProjectPortalModel.tsx` or `threeElementAssets`
   - `skills`: `skillModelAssetUrls`

4. Keep the current `scenes` array in `ScrollyPage.tsx` unless a refactor is needed.

5. Avoid duplicating URLs by hand when an existing asset list exists.

Acceptance criteria:

- Anyone can inspect one manifest file and understand what each section needs.
- The scheduler can operate without waiting for a React component to mount.

Edge cases:

- Some scenes have no sequence.
- Some scenes have no GLB assets.
- Lazy import preloading must not break existing `React.lazy` behaviour.
- Asset URLs must respect `import.meta.env.BASE_URL` through existing helpers where applicable.

## Phase 2: Add A Frame Preload Scheduler

Goal: Replace one-off range preloads with a phased, priority-aware scheduler.

Files to change:

- Add new file: `src/lib/framePreloadScheduler.ts`
- `src/lib/sequenceLoader.ts`
- `src/components/scrolly/ScrollyPage.tsx`
- `src/components/scrolly/useImageSequence.ts`
- Optional: `src/types/sequence.ts`

Scheduler responsibilities:

- Maintain a queue of frame jobs.
- Deduplicate by frame URL.
- Support priorities:
  - `critical`
  - `hot`
  - `warm`
  - `background`
- Support concurrency limits per phase.
- Support pause/throttle when `isScrolling` is true.
- Support aborting on unmount.
- Avoid re-queuing frames already in decoded memory cache.
- Avoid re-queuing frames already pending.
- Prefer using existing `loadFrame()` for decode/cache once a frame job is selected.

Recommended priority behaviour:

1. `critical`
   - Current frame requested by `draw()`.
   - Must bypass normal background ordering.

2. `hot`
   - Current section nearby frame window.
   - Current section direction-aware next frames.

3. `warm`
   - Previous and next section entry windows.
   - Next likely frames based on scroll direction.

4. `background`
   - Remaining hero frames after startup.
   - Contact frames after hero completion or section 2 entry.

Acceptance criteria:

- Hero startup frames still load first.
- Full hero can load aggressively after startup.
- Contact can begin background loading after hero is complete or once the user reaches section 2.
- Current-frame draw requests are never blocked behind contact background jobs.
- Upward scrolling gets warm previous-section frames.

Edge cases:

- User jumps directly to contact through browser find, anchor navigation, or fast scroll.
- User scrolls upward before hero background preload completes.
- User opens page in a background tab where timers may be throttled.
- `AbortController` cancels in-flight fetches during unmount.
- Duplicate frame jobs must not create duplicate network requests.
- Failed frame jobs should not poison the queue forever.

## Phase 3: Startup And Hero-First Loading

Goal: Preserve the good hero startup behaviour and make the rest of hero smooth.

Files to change:

- `src/components/scrolly/ScrollyPage.tsx`
- `src/lib/framePreloadScheduler.ts`
- `src/lib/sequenceLoader.ts`

Current constants:

- `MIN_STARTUP_LOADER_MS = 3000`
- `STARTUP_PRELOAD_FRAME_LIMIT = 50`
- `BACKGROUND_FRAME_PRELOAD_CONCURRENCY = 3`

Recommended behaviour:

1. During startup:
   - Load first 40-60 hero frames.
   - Use relatively high concurrency, such as 6, only for startup.
   - Wait for the startup frame window and minimum loader delay.

2. After startup:
   - Mark hero as hot.
   - Continue loading the remaining hero frames aggressively.
   - Keep contact disabled or very low priority until hero is done.

3. When hero completes:
   - Mark hero raw sequence as available.
   - Keep decoded cache adaptive, not unlimited.

4. When user reaches section 2:
   - Begin contact background preload.
   - Contact should finish long before the user reaches contact in normal browsing.

Acceptance criteria:

- Hero initial visual quality is unchanged or better.
- Hero later frames no longer feel starved by queue behaviour.
- Contact does not compete with hero during startup.

Edge cases:

- If hero full preload fails, continue app operation and let current-frame draw recover by fetching on demand.
- If user skips hero quickly, scheduler should prioritise the active section's requirements.
- Low-end devices should reduce background concurrency.

## Phase 4: Sliding Window Section Preparation

Goal: Keep previous/current/next sections prepared.

Files to change:

- `src/components/scrolly/ScrollyPage.tsx`
- Add optional file: `src/lib/sectionWarmup.ts`
- `src/lib/framePreloadScheduler.ts`
- `src/components/scrolly/scrollStore.ts` if scroll direction is stored globally
- `src/components/scrolly/useScrollSync.ts` if scroll direction is detected there

Tasks:

1. Track scroll direction.

   Options:
   - Store `lastScrollY` and derive `up`/`down` in `ScrollyPage.tsx`.
   - Add `scrollDirection` to `scrollStore.ts`.
   - Derive direction in `useScrollSync.ts` if that hook already owns scroll observation.

2. Replace `allowedSceneIndex` logic with a warm window.

   Current:

   ```text
   startup: only hero
   scrolling: current scene
   idle: current scene + next scene
   ```

   Target after startup:

   ```text
   mount/prepare activeIndex - 1
   mount/prepare activeIndex
   mount/prepare activeIndex + 1
   ```

3. Do not necessarily render all heavy content at full animation cost.

   Mounting/warming and active rendering can be different states.

4. Preload lazy section JS before the section is active.

   For example, expose import preload functions:
   - `preloadMaskingParallaxSection()`
   - `preloadSuitEvolutionSection()`
   - `preloadProjectMultiverseSection()`
   - `preloadSkillsSection()`
   - `preloadContactSection()`

5. Warm GLB assets by section:
   - Suit models before `suit-evolution`
   - Portal model before `project-multiverse`
   - Skill GLBs before `skills`

6. Warm frame sequences by window:
   - Hero remains warm when user is in section 2 or 3 if memory allows.
   - Contact raw frames begin warming when user reaches section 2 or after hero full preload.

Acceptance criteria:

- From section 3, upward scrolling into section 2 does not start asset loading from scratch.
- From section 2, downward scrolling into section 3 finds JS and GLBs already requested.
- Contact begins loading before the contact section is active.

Edge cases:

- Mounting previous/current/next may increase memory. Heavy scenes may need "warm but inactive" modes.
- Three.js canvases should not all render continuously if offscreen.
- Existing `frameloop="demand"` or active-state optimisations should be preserved.
- Suspense fallbacks should remain invisible or non-jarring.

## Phase 5: Adaptive Decoded FrameCache

Goal: Make decoded-frame memory usage scale with device capability.

Files to change:

- `src/lib/frameCache.ts`
- Add optional file: `src/lib/deviceMemory.ts`
- `src/types/sequence.ts` if priority metadata changes

Current:

```text
new FrameCache(160)
```

Recommended adaptive policy:

```text
if navigator.deviceMemory >= 8: 300 decoded frames
if navigator.deviceMemory >= 4: 220 decoded frames
if navigator.deviceMemory >= 2: 120 decoded frames
unknown: 160 decoded frames
very low/end fallback: 80 decoded frames
```

Refined policy options:

- Desktop/high memory: 260-300
- Mid-range: 160-220
- Low memory: 80-120
- Unknown: 140-160

Tasks:

1. Add a helper that safely reads `navigator.deviceMemory`.

2. Treat unsupported browsers as `unknown`.

3. Do not crash during SSR/build where `navigator` is undefined.

4. Allow `FrameCache` max entries to be configured after construction or computed at construction.

5. Consider adding per-scene retention metadata:
   - hot scene frames evict last
   - warm scene frames evict after hot
   - background frames evict first

6. Ensure closed `ImageBitmap`s are not reused.

7. Continue calling `.close()` on evicted `ImageBitmap`s.

Acceptance criteria:

- High-memory devices can retain more decoded frames.
- Low-memory devices avoid excessive decoded image retention.
- Unknown support behaves safely.

Edge cases:

- `navigator.deviceMemory` may be unavailable in Safari/Firefox.
- `navigator.deviceMemory` values are approximate and privacy-preserving.
- Decoded memory can be much larger than compressed frame size.
- Device memory is not a guarantee of available memory.
- Browser can still evict resources or kill tabs under pressure.

## Phase 6: Persistent Raw Frame Cache

Goal: Store raw `.webp` frame responses in browser Cache Storage so repeat visits avoid network downloads.

Files to change:

- Add new file: `src/lib/persistentFrameCache.ts`
- `src/lib/sequenceLoader.ts`
- Optional: `src/lib/framePreloadScheduler.ts`
- Optional: `src/lib/frameManifest.ts`

Correct mental model:

Without explicit persistent caching:

```text
Visit 1
Download assets
Browser may store in HTTP cache depending on headers
Close browser
Visit 2
Browser may or may not reuse HTTP cache
```

With explicit Cache Storage:

```text
Visit 1
Download frames
Save raw .webp Response objects to Cache Storage
Close browser
Visit 2
Read raw .webp from Cache Storage
Decode to ImageBitmap
Draw
```

Important:

- Cache Storage stores raw responses, not decoded frames.
- Every new page session still decodes frames into memory.
- Repeat visits can avoid network downloads.
- Offline availability is possible for cached frames.
- Browser storage can still be evicted by the browser.

Recommended load order in `loadFrame()`:

1. Check decoded `frameCache`.
2. Check existing `pendingFrames`.
3. Try persistent raw cache.
4. If found, decode cached response blob and store decoded frame in `frameCache`.
5. If not found, fetch from network.
6. Save successful network response clone to persistent cache.
7. Decode network response blob and store decoded frame in `frameCache`.

Tasks:

1. Create cache constants.

   Example:

   ```text
   FRAME_CACHE_NAME = "portfolio-frames-v1"
   FRAME_CACHE_PREFIX = "/frames/"
   ```

2. Add helper functions:
   - `isPersistentFrameCacheAvailable()`
   - `getCachedFrameResponse(url)`
   - `putFrameResponse(url, response)`
   - `deleteOldFrameCaches(currentName)`
   - `warmPersistentFrameRange(sceneId, sequence, options)`

3. Save only successful same-origin frame responses.

4. Do not cache failed responses.

5. Do not let Cache Storage failure break rendering.

6. Use response cloning correctly.

   A `Response` body can be consumed once, so store one clone and decode another.

7. Version the cache name.

   Bump the version when frame files change.

8. Clean old frame caches on startup or app initialisation.

Acceptance criteria:

- On first visit, frames are fetched and saved.
- On second visit, frames can be served from Cache Storage.
- With network offline after first full warmup, cached frames can still render.
- Cache failures degrade to normal network fetch.

Edge cases:

- Cache Storage requires secure context, except localhost development is typically treated as secure.
- Private/incognito browsing may limit or clear storage.
- Storage quota can be exceeded.
- Browser may evict Cache Storage under pressure.
- The app must not assume the full sequence is cached.
- Partial caches must work.
- A deploy with changed frames but same URL names requires cache version bump.
- Query strings and `BASE_URL` must be consistent for cache keys.

## Phase 7: Optional Service Worker

Goal: Add stronger offline/cache-first behaviour later if needed.

This is optional for the first implementation. Direct `window.caches` use from `sequenceLoader.ts` is simpler and enough to prove the concept.

Potential files:

- `public/sw.js`
- `src/main.tsx`
- `vite.config.ts`
- `package.json`

Options:

1. Manual service worker.

   Pros:
   - No new dependency.
   - Full control.

   Cons:
   - More manual lifecycle/versioning work.

2. `vite-plugin-pwa` / Workbox.

   Pros:
   - Established caching tools.
   - Runtime caching rules for `/frames/**`.

   Cons:
   - Adds dependency and config.
   - Service worker update behaviour must be handled carefully.

Recommended service worker strategy if added:

- Runtime cache `/frames/video1/*` and `/frames/video6/*`.
- Use cache-first for immutable frame files.
- Use versioned cache names.
- Keep HTML/app shell update-friendly.
- Avoid stale app JS while frame cache remains versioned.

Acceptance criteria:

- Cached frames work offline after warmup.
- New deploys can invalidate old frames cleanly.
- Service worker does not trap users on stale app versions.

Edge cases:

- Service worker scope depends on deployment base path.
- GitHub Pages or subpath deployment must respect Vite `BASE_URL`.
- Updating service workers can be confusing during development.

## Phase 8: Use `rel=preload` Carefully

Goal: Use browser preload only for truly critical initial frames.

Files to change:

- `index.html` if using static initial preload tags
- Or `src/lib/sequenceLoader.ts` / scheduler if adding runtime preload tags

Current helper:

- `preloadSequenceFrames(sequence, count)` creates `<link rel="preload" as="image">` tags.

Recommended use:

- Only first 10-20 hero frames.
- Maybe hero first frame in `index.html`.
- Do not add hundreds of preload links.

Reason:

- `rel=preload` tells the browser a resource is needed very soon.
- Overusing it can compete with CSS, JS, fonts, and current rendering.

Acceptance criteria:

- Initial hero visual appears quickly.
- Preload tags do not flood the browser scheduler.
- Long sequence loading is managed by the JS scheduler, not by many head preload tags.

Edge cases:

- Preloading too many images can hurt startup.
- Preloaded resources should actually be used soon to avoid browser warnings.

## Phase 9: Section JS And GLB Warmup

Goal: Request section code and 3D assets before the user reaches the section.

Files to change:

- `src/components/scrolly/ScrollyPage.tsx`
- `src/lib/sceneAssetManifest.ts`
- `src/lib/threeElementAssets.ts`
- `src/components/sections/suit-evolution/SuitModel.tsx`
- `src/components/sections/project-multiverse/ProjectPortalModel.tsx`
- `src/components/sections/skill-tree/SkillShowcase.tsx`

Tasks:

1. Expose lazy import preload functions.

   Current lazy sections are declared inline with `lazySection(...)`.

   Add import loader references that can be called before render.

2. Warm current/previous/next section imports.

3. Warm GLBs by section window:
   - `suit-evolution`: use `useGLTF.preload()` for suit models.
   - `project-multiverse`: use `useGLTF.preload()` for portal model.
   - `skills`: use existing `skillModelAssetUrls.forEach(useGLTF.preload)`.

4. Keep 3D rendering inactive when offscreen.

   Preload assets, but avoid unnecessary continuous rendering.

Acceptance criteria:

- Reaching a Three.js section does not trigger major GLB downloads at the moment of entry.
- JS chunks for nearby sections are already requested.
- Existing Three.js scenes remain visually correct.

Edge cases:

- `useGLTF.preload()` should not be called with undefined URLs.
- Preloading many skill GLBs too early can compete with hero.
- Some browsers deprioritise requests in background tabs.

## Phase 10: Sequence Rendering And Direction-Aware Windows

Goal: Make `useImageSequence` and scheduler cooperate.

Files to change:

- `src/components/scrolly/useImageSequence.ts`
- `src/lib/sequenceLoader.ts`
- `src/lib/framePreloadScheduler.ts`
- `src/components/scrolly/scrollStore.ts`

Tasks:

1. Keep direct current-frame `loadFrame()` for draw correctness.

2. Replace or augment `preloadFrameWindow()` calls with scheduler jobs.

3. Use scroll direction when ordering nearby frames.

   Downward:

   ```text
   center + 1
   center + 2
   center + 3
   then center - 1, center - 2
   ```

   Upward:

   ```text
   center - 1
   center - 2
   center - 3
   then center + 1, center + 2
   ```

4. Still include both sides eventually so small scroll reversals stay smooth.

5. Keep radius adaptive by device and section.

Acceptance criteria:

- Fast downward scroll loads future frames first.
- Fast upward scroll loads previous frames first.
- Reversing direction remains smooth because both sides are warmed.

Edge cases:

- Scroll progress jumps due to resize or ScrollTrigger refresh.
- Reduced motion should still draw a representative frame.
- Canvas dimensions/DPR changes invalidate draw keys but not decoded cache keys.

## Phase 11: Network And Concurrency Policy

Goal: Prevent background work from starving active rendering.

Files to change:

- `src/lib/framePreloadScheduler.ts`
- `src/lib/performance.ts`
- `src/components/scrolly/ScrollyPage.tsx`

Recommended policy:

Startup:

- hero initial frames: concurrency 4-6
- no contact
- no bulk skill GLBs

Hero hot phase:

- remaining hero: concurrency 3-5
- active draw requests always critical

After hero ready / section 2 entered:

- contact persistent raw cache: concurrency 2-3
- nearby section JS/GLBs: low concurrency

While scrolling:

- critical current frames continue
- background work drops to 1-2 or pauses

While idle:

- background work resumes

Low-end device:

- lower decoded cache
- lower background concurrency
- smaller frame windows

Acceptance criteria:

- Active scroll/scrub is favoured over background caching.
- Contact still warms before needed in normal use.
- Low-end devices avoid request storms.

Edge cases:

- Browser HTTP/2 multiplexing can still share bandwidth across requests.
- Too many `createImageBitmap()` calls can create main-thread or decoder pressure.
- Background queue should yield between batches.

## Phase 12: Cache Versioning And Deployment

Goal: Prevent stale frame files after deploys.

Files to change:

- `src/lib/persistentFrameCache.ts`
- Optional: `.env` or build metadata helper
- Optional: `vite.config.ts`

Tasks:

1. Use a versioned persistent cache name.

   Example:

   ```text
   portfolio-frames-v1
   ```

2. Bump version when:
   - frame files change
   - frame count changes
   - frame naming changes
   - compression output changes but file URLs stay the same

3. Delete old `portfolio-frames-*` caches at startup or service worker activation.

4. Consider embedding an asset manifest version.

Acceptance criteria:

- New deploys can force new frames.
- Old caches do not accumulate forever.

Edge cases:

- If file names are unchanged and cache version is unchanged, users can see stale cached frames.
- If deployment path/base changes, cache keys may change.

## Phase 13: Observability And Debugging

Goal: Make preload behaviour inspectable during development.

Files to change:

- `src/lib/framePreloadScheduler.ts`
- `src/lib/frameCache.ts`
- `src/lib/persistentFrameCache.ts`
- Optional debug overlay in `src/components/scrolly/CinematicSceneHud.tsx`

Useful debug data:

- decoded cache size
- decoded cache max entries
- pending frame count
- persistent cache hit/miss
- scheduler queue length by priority
- current phase
- active scene
- scroll direction
- last failed frame URL

Tasks:

1. Add development-only logging or a debug object.

2. Avoid noisy production logs.

3. Optionally expose `window.__portfolioPreloadDebug`.

Acceptance criteria:

- DevTools can confirm whether frames come from memory, Cache Storage, or network.
- Debugging does not affect production performance.

Edge cases:

- Logging inside high-frequency draw loops can destroy performance.
- Debug overlays should not ship unless gated.

## Phase 14: Testing And Validation

Goal: Verify first visit, repeat visit, fast scroll, reverse scroll, and low-memory behaviour.

Manual tests:

1. Empty cache first visit.
   - Clear site data in DevTools.
   - Load page.
   - Confirm first 40-60 hero frames preload during loader.
   - Confirm hero remaining frames continue after startup.

2. Hero scrub.
   - Slowly scrub hero.
   - Quickly scrub hero.
   - Confirm no blank canvas and minimal stutter.

3. Contact warmup.
   - Reach section 2.
   - Confirm contact frame jobs begin in background.
   - Reach contact.
   - Confirm contact does not start from zero.

4. Reverse scroll.
   - Scroll to section 3.
   - Scroll upward to section 2 and hero.
   - Confirm previous sections are warm.

5. Repeat visit.
   - Load once and let frames warm.
   - Reload.
   - Confirm Cache Storage hits.
   - Network panel should show fewer network downloads for cached frames.

6. Offline repeat visit.
   - After warmup, set DevTools offline.
   - Reload.
   - Confirm cached frames can render.
   - App JS/CSS availability depends on HTTP cache or service worker strategy.

7. Low-memory simulation.
   - Force fallback policy by temporarily disabling `deviceMemory` reads or testing Safari/Firefox.
   - Confirm conservative cache size.

8. Production build.
   - Run `npm run build`.
   - Run `npm run preview`.
   - Confirm frame URLs respect `BASE_URL`.

Automated checks:

- `npm run lint`
- `npm run build`

Possible browser checks:

- Chrome desktop
- Edge desktop
- Safari if available
- Firefox if available
- Mobile Chrome
- Mobile Safari if available

Acceptance criteria:

- No TypeScript errors.
- No lint errors.
- No uncaught promise rejections from aborted preloads.
- No blank sequence canvas during normal scroll.
- No runaway memory growth.

## Implementation Order

Recommended order to reduce risk:

1. Add scene asset manifest.
2. Add frame preload scheduler without persistent cache.
3. Implement startup hero phase.
4. Implement hero-full then contact-background phase.
5. Add sliding window section warmup.
6. Add adaptive decoded `FrameCache`.
7. Add persistent Cache Storage.
8. Add optional debug instrumentation.
9. Consider service worker only after direct Cache Storage is proven.

## Exact File-Level Change List

### `src/components/scrolly/ScrollyPage.tsx`

Planned changes:

- Keep scene definitions or import them from a manifest.
- Replace direct calls to `preloadSequenceFrameRange()` with scheduler phase calls.
- Keep startup loader logic, but call `scheduler.preloadStartupHeroFrames(...)`.
- After startup, call `scheduler.preloadHeroRemainder(...)`.
- Add logic to begin contact preload when:
  - hero sequence completes, or
  - active scene index reaches section 2, whichever policy is selected.
- Replace `allowedSceneIndex` with previous/current/next warm window logic.
- Start lazy section import preload for warm window scenes.
- Start GLB warmup for warm window scenes.
- Track or consume scroll direction.
- Abort scheduler jobs on unmount.

### `src/lib/sequenceLoader.ts`

Planned changes:

- Keep `getFrameCount()`, `getFrameIndex()`, and `getFrameSrc()`.
- Update `loadFrame()` to:
  - check decoded `frameCache`
  - check `pendingFrames`
  - check persistent raw cache
  - fetch network as fallback
  - save network response clone to persistent cache
  - decode and store decoded frame
- Expose a lightweight "is frame decoded" helper if needed by scheduler.
- Optionally expose "is frame pending" helper.
- Avoid throwing from persistent cache failures.
- Ensure abort behaviour still works for network fetches.

### `src/lib/frameCache.ts`

Planned changes:

- Replace fixed `160` default with adaptive max entries.
- Add method to update max entries if needed.
- Optionally support priority-aware eviction.
- Continue closing evicted `ImageBitmap`s.
- Add debug getters:
  - `size`
  - `maxEntries`
  - maybe per-scene counts

### `src/lib/framePreloadScheduler.ts`

New file responsibilities:

- Priority queue management.
- Deduplication.
- Concurrency management.
- Phase orchestration:
  - startup hero window
  - hero remainder
  - contact background
  - sliding window warmup
- Direction-aware frame ordering.
- Idle/scrolling throttle.
- Abort handling.
- Debug state.

### `src/lib/persistentFrameCache.ts`

New file responsibilities:

- Cache Storage availability check.
- Versioned frame cache name.
- `match` frame responses.
- `put` frame responses.
- Clean old frame caches.
- Handle quota/security errors gracefully.
- No UI dependencies.

### `src/lib/sceneAssetManifest.ts`

New file responsibilities:

- Scene-to-assets mapping.
- Frame sequence references.
- Lazy import preload functions.
- GLB asset lists.
- Section warmup metadata.

### `src/lib/deviceMemory.ts`

Optional new file responsibilities:

- Safe `navigator.deviceMemory` read.
- Cache-size policy.
- Concurrency policy.
- Fallback values for unsupported browsers.

### `src/components/scrolly/useImageSequence.ts`

Planned changes:

- Keep direct current-frame draw path.
- Replace blind `preloadFrameWindow()` with scheduler hot-window request.
- Pass scroll direction if available.
- Keep reduced motion behaviour.
- Ensure stale async draw requests are still ignored.

### `src/components/scrolly/scrollStore.ts`

Optional planned changes:

- Add `scrollDirection`.
- Add setter for scroll direction.
- Preserve existing active scene/progress state.

### `src/components/scrolly/useScrollSync.ts`

Optional planned changes:

- Compute scroll direction if this is the best owner of scroll state.
- Avoid excessive store updates.

### `src/lib/threeElementAssets.ts`

Planned changes:

- Ensure all GLB URLs used for warmup are exported in reusable lists.
- Avoid duplicating strings across section components and manifest.

### `index.html`

Optional planned changes:

- Add only the first hero frame or a tiny number of critical hero preloads.
- Avoid hundreds of `<link rel="preload">` entries.

### `vite.config.ts`

Optional planned changes:

- Only needed if adding service worker/PWA plugin or build-time asset versioning.

### `package.json`

Optional planned changes:

- Only needed if adding `vite-plugin-pwa`, Workbox, or a small helper dependency.
- Direct Cache Storage implementation needs no new dependency.

## Key Decisions To Make Before Coding

1. Startup hero frame count:

   Recommended: 50.

2. When contact preload starts:

   Recommended: after hero full preload OR when user reaches section 2, whichever happens first after startup.

3. Whether to use direct Cache Storage first or service worker first:

   Recommended: direct Cache Storage first.

4. Adaptive cache sizes:

   Recommended initial policy:

   ```text
   >= 8 GB: 300
   >= 4 GB: 220
   >= 2 GB: 120
   unknown: 160
   lower: 80
   ```

5. Background concurrency:

   Recommended:

   ```text
   startup hero: 6
   hero remainder: 3-5
   contact background: 2-3
   while scrolling: 1-2 background, critical unchanged
   ```

6. Section mount window:

   Recommended:

   ```text
   active - 1
   active
   active + 1
   ```

## Final Target Flow

First visit:

```text
Open site
↓
Startup loader
↓
Decode/cache first hero frames
↓
Render hero
↓
Aggressively finish hero sequence
↓
Warm section JS/GLBs using sliding window
↓
Start contact frame cache in background after hero or section 2
↓
Reach contact with frames already warming/cached
```

Second visit:

```text
Open site
↓
Startup loader
↓
Read hero raw frames from Cache Storage if available
↓
Decode into memory
↓
Render
↓
Use persistent cached frames where available
↓
Fetch only missing/new frames
```

Reverse scroll:

```text
Section 3 active
↓
Section 2 is already warm
↓
User scrolls upward
↓
Prioritise section 2 hot window
↓
Hero remains available through decoded cache or persistent raw cache
```

## Non-Goals

- Do not preload every asset at startup.
- Do not decode all hero and contact frames on every device.
- Do not replace the frame-sequence architecture with video in this plan.
- Do not add a service worker until direct Cache Storage proves useful.
- Do not allow background contact loading to compete with hero startup.

## Alternative Approaches

### Scrubbed Video

Use MP4/WebM/AV1 video instead of image sequences.

Pros:

- Fewer network requests.
- Browser video cache is mature.
- Often smaller transfer size.

Cons:

- Accurate scroll scrubbing depends on encoding.
- Needs frequent keyframes or all-I-frame encoding.
- Can be inconsistent across devices.

### Sprite Sheets / Atlases

Pack frames into larger image sheets.

Pros:

- Fewer requests.
- Easier to cache groups of frames.

Cons:

- More complex draw math.
- Large image dimensions can hit browser/GPU limits.
- Less flexible for high-resolution sequences.

### Full PWA / Workbox

Use a service worker from the start.

Pros:

- Strong runtime caching tools.
- Offline-ready patterns.

Cons:

- More lifecycle complexity.
- Risk of stale app shell if update strategy is wrong.

## Success Criteria

- Hero starts with ready frames and remains smooth through later hero frames.
- Contact frames start warming before contact is active.
- Previous/current/next sections stay prepared.
- Upward scrolling does not feel like a cold path.
- High-memory devices keep more decoded frames.
- Low-memory devices avoid excessive memory pressure.
- Repeat visits can reuse Cache Storage for frames.
- App still works if Cache Storage is unavailable.
- App still works if `navigator.deviceMemory` is unavailable.
- Build and lint pass.
