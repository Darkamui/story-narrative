# Inside the Cell — Codex Implementation Handoff

## 0. Mission

Build a production-quality, scroll-driven interactive web experience centered on an aluminum electrolysis cell.

The experience is not a static 3D viewer and not a marketing landing page with a model beside text. **Scrolling operates the machine, camera, materials, overlays, process states, and narrative.** The user should feel as if they are physically entering, dissecting, understanding, and reassembling the cell.

Target experience length: **10–15 minutes** for a first-time visitor who explores at a normal pace.

Primary emotional arc:

> curiosity → scale → disassembly → understanding → process → abnormal state → resolution → transformation into aluminum

Core stack:

- Blender for source asset preparation
- glTF/GLB for runtime assets
- React + TypeScript
- React Three Fiber / Three.js
- GSAP + ScrollTrigger for deterministic scroll choreography
- HTML/CSS UI overlays for copy, labels, data, accessibility
- Shader effects only where they materially improve process comprehension

The result must feel like a serious interactive documentary / museum exhibit, not a tech demo.

---

# 1. Non-negotiable principles

## 1.1 Story first, WebGL second

Every 3D action must answer one of these questions:

- What is this component?
- Where is it located?
- What does it do?
- What interacts with it?
- What changes during operation?
- What changes during an abnormal state?
- Where do current, heat, gas, alumina, bath, and aluminum move?

Do not add motion merely because it looks impressive.

## 1.2 The scroll must directly manipulate the scene

Avoid the pattern:

> paragraph appears → unrelated model rotates

Prefer:

> scroll 0.38 → hood fades → scroll 0.44 → anodes rise → scroll 0.51 → bath exposed → scroll 0.58 → current path illuminates

Animation progress should be tied to normalized chapter progress wherever practical so reverse scrolling reverses the explanation cleanly.

## 1.3 Visual state must remain deterministic

At any scroll position the scene must resolve to a predictable state.

Do not build critical story sequences from uncontrolled time-based animation chains.

Use timelines whose progress can be directly driven by ScrollTrigger.

## 1.4 No fabricated industrial facts

Do not invent dimensions, amperage, temperatures, chemistry, emissions, operating thresholds, or process claims.

All technical numbers and explanatory claims must live in a separate content/data layer and be easy to update from verified references.

The story may use the user-provided **450,000 A** concept as an illustrative target, but implementation must treat this as configurable content rather than an assumed universal cell value.

## 1.5 Desktop-first, graceful mobile adaptation

The hero experience is desktop/tablet landscape.

Mobile must remain functional and visually coherent, but it may use:

- simplified geometry
- reduced particles
- fewer labels
- fewer simultaneous effects
- shorter camera moves

Never make mobile unusable just because the desktop version is cinematic.

---

# 2. Experience structure

Implement the narrative as explicit chapters. Each chapter owns its camera, visible objects, effects, UI, and transition behavior.

Suggested final sequence:

## Chapter 00 — Cold open: The Grain

Visual:

- almost black frame
- one or several bright alumina grains suspended/falling
- extreme macro framing
- subtle dust/particle motion

Copy:

> This grain is about to become aluminum.

Interaction:

- first scroll begins the fall
- camera follows the grain downward
- darkness gradually reveals the larger environment

Purpose:

Introduce scale through contrast: tiny particle → enormous industrial system.

---

## Chapter 01 — The Cell Revealed

The falling grain transitions into a full electrolysis cell.

Camera:

- travel downward / through hooding
- settle into a clean hero three-quarter view

UI:

- minimal title
- no dense labels yet

Goal:

Let the visitor understand the whole object before dissecting it.

---

## Chapter 02 — What You Are Looking At

Introduce the major visible assemblies without exploding them yet.

Potential labels:

- shell
- hooding
- anodes
- busbars / conductors
- superstructure

Interaction:

- subtle focus isolation
- selected component remains opaque while surroundings dim/desaturate slightly

Do not expose every internal detail at once.

---

## Chapter 03 — Exploded Anatomy

This is the centerpiece.

Scroll-driven sequence:

1. hooding disappears or separates
2. exterior shell pulls outward
3. refractory/insulation layers separate in logical order
4. anodes lift vertically
5. busbars move outward along engineered directions
6. cathode blocks slide downward / outward
7. bath becomes visible
8. liquid aluminum pool becomes visible below
9. callout anchors attach to important components

Rules:

- Parts must separate along plausible assembly axes.
- Never create random “explosion” vectors.
- Maintain clear spatial relationships.
- Preserve enough context that users can mentally reassemble the object.
- Explosion distances must be authored and stored in data, not inferred at runtime.

At full exploded state, allow a brief pause/hold in scroll progress so the user can inspect.

---

## Chapter 04 — Reassembly / Cross-section

Mechanically reassemble most of the cell, but retain a clean cross-sectional or clipped presentation.

Goal:

Prepare the visitor to understand the operating process inside the cell.

Use one of:

- intentionally authored cutaway geometry
- clipping planes
- sectional materials

Prefer authored cutaway geometry for important hero views if clipping artifacts reduce clarity.

---

## Chapter 05 — Current

Title concept:

> What 450,000 A actually means

The number itself must be content-driven/configurable.

Visual language:

- current enters busbars
- current path becomes visible progressively
- conductors glow subtly according to path progression
- arrows/flow streaks should indicate direction without resembling electricity magic
- current passes through anodes, bath, cathode system and onward according to the verified process model

Avoid neon sci-fi effects.

This should look like an engineering visualization with cinematic polish.

Possible UI:

- current value
- relative scale analogy if factually verified
- current route legend

---

## Chapter 06 — Electrolysis

Show process interactions rather than only components.

Visual concepts:

- alumina particles entering bath
- dissolved material represented with subtle shader/particle language
- gas bubbles forming around anode regions
- aluminum accumulating below
- temperature/heat represented through color and distortion very carefully

The objective is comprehension, not molecular simulation accuracy.

Use schematic visual abstraction and clearly label it as such where appropriate.

---

## Chapter 07 — Normal Operation

Establish a calm operating baseline.

UI state label:

`NORMAL OPERATION`

Potential indicators:

- stable bath
- moderate gas bubble activity
- stable current visualization
- steady aluminum pool

Hold this state long enough that users visually learn the baseline before the abnormal-state chapter.

---

## Chapter 08 — Anode Effect

Transition the *same* scene into an abnormal process state.

UI:

`ANODE EFFECT`

Potential visual changes, subject to factual validation:

- increased bubble/gas behavior
- altered current/voltage representation
- stronger warning state
- affected process zones isolated visually
- before/after comparison language

Important:

This chapter must be based on verified technical explanation. Do not let visual drama overstate what physically occurs.

Prefer a controlled comparison:

`NORMAL` ⇄ `ANODE EFFECT`

rather than creating a disaster scene.

---

## Chapter 09 — Liquid Aluminum

Reduce complexity.

Camera moves beneath the bath/cathode region toward the aluminum pool.

Use lighting to make the metal visually distinct without turning it into unrealistic lava.

Explain:

- where it accumulates
- why it sits where it does
- how it is removed

---

## Chapter 10 — Tapping

Transition from contained pool to removal/tapping.

Depending on available assets, use either:

A. an accurate tapping sequence with equipment, or
B. an intentionally stylized transition that follows the metal out of the cell.

Do not fake specific machinery if correct assets are unavailable.

---

## Chapter 11 — Casting / Transformation

The visual narrative leaves the cell.

Possible transition:

- liquid aluminum fills frame
- frame becomes reflective white/silver
- camera pulls back to reveal cast metal form

This can be more cinematic and less mechanically detailed than the cell chapters.

Final narrative line should resolve the opening grain-to-metal transformation.

---

# 3. Technical architecture

Use a maintainable architecture from day one.

Recommended structure:

```text
src/
├─ app/
│  ├─ App.tsx
│  └─ Experience.tsx
├─ three/
│  ├─ CellScene.tsx
│  ├─ CameraRig.tsx
│  ├─ Lighting.tsx
│  ├─ Environment.tsx
│  ├─ ModelLoader.tsx
│  ├─ ExplosionController.tsx
│  ├─ SectionController.tsx
│  └─ effects/
│     ├─ CurrentFlow.tsx
│     ├─ AluminaParticles.tsx
│     ├─ GasBubbles.tsx
│     ├─ HeatDistortion.tsx
│     └─ AluminumPool.tsx
├─ story/
│  ├─ chapters.ts
│  ├─ StoryController.ts
│  ├─ timelines/
│  │  ├─ grain.ts
│  │  ├─ reveal.ts
│  │  ├─ explode.ts
│  │  ├─ current.ts
│  │  ├─ electrolysis.ts
│  │  ├─ anodeEffect.ts
│  │  └─ casting.ts
│  └─ states.ts
├─ ui/
│  ├─ ChapterCopy.tsx
│  ├─ Callout.tsx
│  ├─ DataReadout.tsx
│  ├─ Progress.tsx
│  └─ ReducedMotionFallback.tsx
├─ data/
│  ├─ content.ts
│  ├─ components.ts
│  ├─ explosion.ts
│  ├─ process.ts
│  └─ sources.ts
├─ shaders/
├─ hooks/
├─ lib/
└─ styles/
```

Do not put the entire experience in one R3F component.

---

# 4. Story state model

Create a normalized global story state independent of DOM layout.

Example conceptual shape:

```ts
type StoryState = {
  globalProgress: number
  chapterId: ChapterId
  chapterProgress: number
  explodedAmount: number
  shellOpacity: number
  anodeLift: number
  currentIntensity: number
  bubbleIntensity: number
  aluminumVisibility: number
  abnormalStateMix: number
}
```

The DOM scroll system updates the story state.

The 3D scene consumes story state.

Do not allow individual components to independently query arbitrary scroll positions and create conflicting animation logic.

---

# 5. Scroll orchestration

Use GSAP ScrollTrigger as the high-level timeline conductor.

Recommended strategy:

- one vertical document
- each chapter owns a scroll section of deliberate length
- canvas remains sticky/pinned during primary experience
- chapter timelines convert scroll progress into deterministic scene properties

Avoid hundreds of tiny ScrollTriggers.

Prefer a small number of master timelines and explicit chapter-local timelines.

Scrubbing should remain smooth in both directions.

Scroll velocity must not break the final state.

Test:

- slow wheel
- fast wheel
- scrollbar dragging
- trackpad momentum
- Page Up / Page Down
- refresh at middle of page
- browser back/forward restoration

---

# 6. Asset contract between Blender and web

The Blender scene must be prepared intentionally for runtime control.

## Naming

Every controllable assembly receives a stable semantic name.

Example:

```text
CELL_ROOT
├─ SHELL
├─ HOODING
├─ SUPERSTRUCTURE
├─ BUSBARS
│  ├─ BUSBAR_LEFT
│  └─ BUSBAR_RIGHT
├─ ANODES
│  ├─ ANODE_01
│  ├─ ANODE_02
│  └─ ...
├─ REFRACTORY
│  ├─ REFRACTORY_OUTER
│  ├─ REFRACTORY_INNER
│  └─ ...
├─ CATHODE
├─ BATH
└─ ALUMINUM_POOL
```

Do not export objects named `Cube.041`.

## Origins

Set origins intentionally for animation.

For example:

- anode origin allows vertical lift
- hood panel origin supports plausible opening/removal
- busbar origin supports authored outward movement

## Transforms

Before export:

- apply scale where appropriate
- verify coordinate system
- verify normal orientation
- remove hidden junk geometry
- remove duplicate materials
- eliminate accidental high-poly modifiers

## Explosion metadata

Store explosion data separately from model transforms.

Example:

```ts
{
  object: 'ANODE_01',
  axis: [0, 1, 0],
  distance: 1.8,
  delay: 0.1
}
```

This allows designers to tune choreography without reopening Blender for every adjustment.

---

# 7. GLB optimization

Establish a measurable performance budget.

Initial targets for desktop:

- compressed GLB(s), not raw Blender-scale exports
- sensible polygon budget for hero object
- Draco or Meshopt compression where appropriate
- KTX2/Basis textures where useful
- texture resolution based on actual screen importance
- reuse materials
- instance repeated components such as anodes when feasible without compromising unique animation

Do not optimize blindly before visual baseline is established.

Measure with Chrome Performance + Three.js renderer stats.

Suggested runtime target on a normal recent desktop:

- stable ~60 fps preferred
- no sustained frame drops during chapter transitions
- no large main-thread stalls when entering chapters

Provide quality tiers:

```text
HIGH
MEDIUM
LOW
```

Automatically choose a reasonable default from device capability, but allow manual override if a settings control is implemented.

---

# 8. Camera language

Treat the camera like documentary cinematography.

Define authored camera shots rather than continuously orbiting around the cell.

Possible shot library:

```text
MACRO_GRAIN
DESCENT
CELL_HERO
FRONT_ENGINEERING
EXPLODED_3Q
SECTION_SIDE
CURRENT_PATH
BATH_CLOSE
ALUMINUM_POOL
TAPPING_EXIT
CASTING_REVEAL
```

Each shot should define:

```ts
position
lookAt
fov or orthographic state
target distance
optional DOF parameters
```

Interpolate using deliberate easing.

Avoid camera paths that intersect geometry.

Do not overuse depth of field; labels and technical components must remain readable.

---

# 9. Exploded-view system

Build a reusable explosion controller rather than hardcoding GSAP calls per mesh.

Each exploded component should support:

```text
base position
base rotation
exploded position offset
optional exploded rotation
start threshold
end threshold
```

Then calculate transforms from `explodedAmount`.

This allows:

- reversible scroll
- animation tuning
- debugging slider
- future component reuse

Provide a development-only control panel to manually scrub:

- explosion amount
- shell opacity
- anode lift
- current intensity
- bath visibility
- bubble intensity
- abnormal-state mix

Remove or disable developer controls in production.

---

# 10. Labels and callouts

Use DOM overlays projected from 3D anchor points where possible.

Every label requires:

- stable 3D anchor object or coordinate
- collision/overlap strategy
- visibility range
- chapter ownership
- optional leader line

Do not show 15 labels simultaneously.

Labels should be introduced progressively.

If anchor moves behind camera or becomes occluded, fade or reposition the label rather than drawing a line through the scene.

Accessibility:

All essential label content must also exist in semantic DOM text, not exclusively WebGL.

---

# 11. Current-flow visualization

Implement this as a reusable system.

Potential techniques:

- animated texture coordinates on curves/tubes
- instanced moving pulses
- emissive masks
- line material with directional dashes

Preferred visual character:

- restrained
- high-contrast enough to read
- directional
- engineering diagram, not superhero electricity

Current animation must follow verified conductor paths.

---

# 12. Bath, bubbles, alumina, aluminum

Do not attempt expensive physically accurate simulation.

Use layered visual systems.

## Bath

Potential implementation:

- translucent/opaque shader depending on artistic direction
- subtle normal motion
- restrained thermal distortion

## Gas bubbles

Use instanced meshes or GPU particles.

Bubble density is story-state driven.

Normal operation and anode-effect states use the same particle system with different parameters.

## Alumina

Use sparse particles/grains where individual particles are narratively useful.

Avoid particle noise that obscures the cell.

## Aluminum pool

Use dedicated geometry/material.

It should read visually as molten metal while remaining distinct from bright orange molten iron/steel imagery unless actual temperature/color references justify that appearance.

---

# 13. Visual direction

Target:

**premium scientific documentary + interactive museum exhibit + high-end product visualization**

Avoid:

- cyberpunk HUD overload
- neon sci-fi outlines everywhere
- generic corporate gradients
- giant floating glass cards
- excessive bloom
- video-game health-bar aesthetics

Palette should mostly emerge from:

- dark environment
- metallic cell materials
- warm process zones
- white technical typography
- restrained warning color when abnormal state appears

Use typography with strong editorial hierarchy.

---

# 14. Audio

Audio is optional for MVP but architect for it.

Potential layers:

- low industrial ambience
- distant electrical hum
- granular alumina sound
- mechanical separation sounds during exploded view
- subtle transition impacts

Rules:

- never autoplay loud audio
- respect browser policies
- provide mute
- preserve experience without sound

---

# 15. Accessibility / reduced motion

Implement `prefers-reduced-motion` from the beginning.

Reduced-motion mode should:

- eliminate long camera flights
- replace continuous exploded motion with discrete state transitions
- reduce particles
- retain all explanatory content
- preserve the story sequence

Keyboard navigation must allow reading the entire narrative without precision scrolling.

WebGL failure should display a meaningful fallback, not an infinite loader.

---

# 16. Loading experience

Do not show a generic spinner for ten seconds.

Implement staged loading:

1. shell/UI loads immediately
2. opening copy appears
3. lightweight grain scene becomes available
4. hero model loads progressively
5. noncritical later chapter assets preload after entry

Display genuine progress only if progress can be measured.

Use asset prefetching strategically.

---

# 17. Error handling

Never leave the page on `Loading...` forever.

Required:

- model load timeout/retry UX
- WebGL capability check
- shader fallback
- missing-node warnings in development
- graceful production behavior if optional scene elements fail

Log meaningful diagnostics in development.

---

# 18. Content architecture

Do not scatter narrative copy across JSX.

Keep content separate.

Example:

```ts
{
  id: 'current',
  eyebrow: 'ELECTRICAL CURRENT',
  title: 'What 450,000 A actually means',
  body: [...],
  dataPoints: [...],
  sources: [...]
}
```

This allows factual review without editing animation code.

---

# 19. Source / factual review system

Create `data/sources.ts` or equivalent.

Each technical claim should be traceable to a source ID.

During development, allow a debug mode that prints source identifiers alongside text.

Before final release:

- verify chemistry statements
- verify operating values
- verify component naming
- verify current path
- verify anode-effect explanation
- verify tapping/casting description

Do not use AI-generated technical statements as final authority.

---

# 20. Development milestones

Codex must work in visible vertical slices.

## Milestone 0 — Repository audit / bootstrap

Deliver:

- inspect existing repo before changing architecture
- identify framework/tooling already present
- establish clean project structure
- configure lint/typecheck/test/build
- basic full-screen R3F canvas
- placeholder narrative section system

Acceptance:

`npm run build` succeeds with zero TypeScript errors.

---

## Milestone 1 — Story prototype with primitives

DO NOT wait for finished 3D assets.

Use boxes/cylinders/placeholder volumes representing:

- shell
- anodes
- busbars
- bath
- aluminum pool

Build the complete scroll mechanics with primitives.

Acceptance:

- chapters work end-to-end
- camera works
- explosion works
- reverse scrolling works
- UI chapter transitions work

This validates the experience before asset polish.

---

## Milestone 2 — Hero GLB integration

Replace primitives with the actual cell model.

Tasks:

- inventory GLB node names
- map semantic components
- create adapter layer if names are poor
- verify pivots/origins
- establish materials and lighting

Acceptance:

The real cell reproduces Milestone 1 choreography without regressions.

---

## Milestone 3 — Exploded anatomy polish

Implement production-quality exploded sequence.

Acceptance:

- spatially readable
- no intersections at endpoints
- reverse-scroll perfect
- labels remain attached
- final exploded composition looks intentionally art-directed

---

## Milestone 4 — Process visualization

Implement:

- current
- alumina
- bath
- bubbles
- aluminum pool

Acceptance:

Each process can be individually toggled in development and reacts to story state.

---

## Milestone 5 — Normal vs anode effect

Build state interpolation.

Acceptance:

A development slider from 0→1 cleanly transforms normal operation into the abnormal-state visualization.

Then connect it to scroll.

---

## Milestone 6 — Tapping and casting ending

Complete narrative arc.

Acceptance:

The ending feels like a resolution rather than simply the page stopping.

---

## Milestone 7 — UX / visual polish

Focus on:

- typography
- spacing
- transitions
- chapter progress
- label collision
- loading
- responsive layout
- subtle microinteractions

---

## Milestone 8 — Performance / accessibility / QA

Test:

- Chrome
- Edge
- Firefox
- Safari where available
- desktop mouse wheel
- trackpad
- tablet
- mobile
- reduced motion
- refresh mid-page
- slow network
- GPU-constrained machine

Run Lighthouse and browser performance profiling.

Do not chase Lighthouse score at the expense of the intended experience, but address genuine regressions.

---

# 21. Acceptance criteria for final experience

The project is not complete merely because every chapter exists.

Final acceptance requires:

1. The first 10 seconds create curiosity without explanatory overload.
2. A user unfamiliar with a cell can identify the major components after the exploded chapter.
3. Reverse scrolling never breaks scene state.
4. Camera never clips obviously through hero geometry.
5. Explosion choreography appears engineered rather than random.
6. Current path is visually understandable.
7. Normal operation and anode effect are visually distinguishable without reading the labels.
8. Labels remain readable and do not become a screen full of callouts.
9. Runtime is smooth on a reasonable modern desktop.
10. Mobile has a deliberate reduced experience rather than a broken desktop layout.
11. All key narrative information remains accessible with reduced motion.
12. Technical claims remain editable and traceable to sources.
13. No indefinite loading state exists.
14. The final chapter resolves the opening “grain → aluminum” premise.
15. The piece feels like one authored story rather than a collection of WebGL tricks.

---

# 22. Codex operating instructions

You are not being asked to produce a huge one-shot implementation.

Operate as a senior creative developer / technical director.

For every milestone:

1. inspect the current repo and existing assets
2. identify the smallest coherent vertical slice
3. implement it completely
4. run lint/typecheck/tests/build
5. run the app
6. inspect the result visually
7. fix visible problems yourself
8. document meaningful architecture decisions
9. commit/checkpoint only after the slice works
10. proceed to the next milestone

Do not endlessly refactor working systems because an alternative architecture exists.

Do not use multiple autonomous agents for routine implementation. Use targeted parallel analysis only when independent investigation materially saves time.

Favor direct implementation + verification over speculative planning.

When a visual choice is uncertain, create the simplest high-quality version first and make it tunable.

---

# 23. First task for Codex

Begin with this exact instruction:

> Read this handoff completely. Audit the current repository and available assets before editing anything. Do not attempt the final experience immediately. First implement Milestone 0 and Milestone 1 using clean placeholder geometry so that the entire narrative architecture, scroll choreography, camera system, deterministic story state, chapter UI, and exploded-view controller can be validated before integrating the final Blender model. Run and visually inspect the result yourself. Stop after Milestone 1 and report what works, what is placeholder, what architectural decisions were made, and what asset information you need for Milestone 2.

