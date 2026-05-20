# Masking Parallax Effect

## Goal
Rework the first portfolio scene into a cinematic, full-viewport masked hero with two locked portrait plates: `portfolio portrait.png` as the base state and `spidermanportfolio portrait.png` as the reveal state.

## Task Checklist
- [x] Refresh this plan into a task-wise implementation checklist before code work.
- [x] Replace the current canvas cutout with a layered DOM/CSS/SVG hero.
- [x] Keep the first scene sticky, full-screen, and integrated with the existing scrolly scene order.
- [x] Align the base and Spider-Man plates to one shared camera frame, preserving the face and upper-torso anchor.
- [x] Use a soft feathered SVG alpha mask or equivalent, never a circular `clip-path`.
- [x] Prevent floating blob syndrome: the reveal must feel integrated into the portrait lighting and composition.
- [x] Add shared color grading, vignette, and gradient blending so both portrait states feel lit by the same environment.
- [x] Split depth-compressed motion across background, portrait camera, and mask layers.
- [x] Smooth pointer and scroll influence with lerp/interpolation.
- [x] Anchor the mask to the subject's face/upper torso rather than the raw cursor center.
- [x] Add subtle intro choreography so the hero settles into its resting composition.
- [x] Use transform/opacity-based animation only and apply `will-change` selectively.
- [x] Make desktop, tablet, mobile, and reduced-motion states intentionally composed.
- [x] Verify with lint, build, and responsive visual checks.

## Acceptance Criteria
- The reveal feels cinematic and editorial, not like a sticker, spotlight, or hole punch.
- The Spider-Man layer appears through soft, organic edges with depth and lighting cohesion.
- Parallax is visible but restrained, with tiny layered offsets rather than exaggerated cursor travel.
- The composition stays balanced across desktop, tablet, mobile, and reduced-motion modes.
- The rest of the portfolio sections remain intact.

## Phase 2 Dynamic Blob Checklist
- [x] Preserve the approved centered camera framing, portrait alignment, parallax architecture, color grade, and scroll sequencing.
- [x] Replace the static movable reveal mask with a dynamically generated SVG alpha-mask path.
- [x] Drive blob geometry from RAF-managed pointer position, velocity, acceleration, direction, and idle timing refs.
- [x] Avoid React state updates inside the per-frame animation loop.
- [x] Distort normalized blob perimeter points with restrained directional stretch, compression, asymmetry, and idle settling.
- [x] Keep the mask anchored to the face/upper-torso composition with pointer input acting only as directional influence.
- [x] Render the Spider-Man plate through the SVG mask without clip-path circles, canvas artifacts, or rigid geometry.
- [x] Keep animation to transform, opacity, and SVG path mutation with selective `will-change`.
- [x] Verify desktop, tablet, mobile, and reduced-motion states with Playwright.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
