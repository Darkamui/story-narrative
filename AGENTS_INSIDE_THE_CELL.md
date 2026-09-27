# AGENTS.md — Inside the Cell

## Product goal

Build a premium scroll-driven interactive documentary explaining an aluminum electrolysis cell through a cinematic 3D story.

Scrolling must directly operate the scene. This is not a static 3D viewer and not a conventional text-heavy landing page.

Read `INSIDE_THE_CELL_CODEX_HANDOFF.md` before making architectural or visual decisions.

## Working style

- Work in complete vertical slices.
- Inspect the existing repo before modifying architecture.
- Prefer direct implementation and verification over prolonged planning.
- Do not rewrite working systems without a measurable benefit.
- Do not attempt the entire experience in one pass.
- Keep all important state deterministic and reversible.
- Run lint, typecheck, tests, and production build after meaningful changes.
- Visually inspect every major scene/choreography change in the running app.

## Technical priorities

1. deterministic scroll/story state
2. camera choreography
3. semantic GLB component control
4. exploded-view system
5. process visualizations
6. labels/UI
7. performance
8. polish

## Core stack

Prefer:

- React
- TypeScript
- React Three Fiber
- Three.js
- GSAP + ScrollTrigger
- HTML/CSS overlays

Do not introduce heavy dependencies unless they solve a concrete problem.

## Architecture rules

- Do not place the entire R3F experience in one component.
- Narrative content must not be scattered through JSX.
- Technical/process data must be separate from animation code.
- Scroll is translated into normalized story state.
- Scene components consume story state; they should not independently invent scroll logic.
- Explosion transforms must be data-driven.
- Camera shots must be authored and named.
- All controllable GLB nodes must have stable semantic mappings.

## Visual rules

Target: premium scientific documentary / museum exhibit / product visualization.

Avoid:

- cyberpunk HUD styling
- gratuitous neon
- excessive bloom
- generic glassmorphism cards
- unnecessary particle noise
- random exploded vectors
- camera movement with no explanatory purpose

## Factual rules

Never fabricate technical claims or industrial values.

Treat all numbers, chemistry, process descriptions, component naming, and abnormal-state behavior as content requiring verification.

Keep claims source-addressable and editable outside the rendering code.

## Performance rules

- Measure before optimizing.
- Avoid per-frame React state updates for animation.
- Prefer refs/uniforms/imperative transform updates for high-frequency motion.
- Reuse materials and geometry where practical.
- Use instancing for repeated visual elements when it does not prevent required independent animation.
- Provide reduced quality for constrained devices.
- Avoid large blocking asset loads before the opening scene can render.

## Accessibility rules

- Respect `prefers-reduced-motion`.
- Essential content must exist in semantic DOM.
- Keyboard users must be able to consume the narrative.
- WebGL failure must have a meaningful fallback.
- Never leave an indefinite loading screen.

## Development order

Do not skip directly to final assets.

1. repo/bootstrap
2. full story prototype with primitives
3. real GLB integration
4. exploded anatomy polish
5. process effects
6. normal/anode-effect state system
7. tapping/casting ending
8. visual/UX polish
9. performance/accessibility/QA

## Definition of done for a milestone

A milestone is complete only when:

- implementation works in the browser
- forward and reverse scroll states are correct
- production build passes
- obvious visual defects are fixed
- relevant code is organized and documented
- remaining placeholders are explicitly identified

