# Inside the Cell

This is the aluminum feature in Story Narrative. Its implementation lives in `src/stories/aluminum/`, and its public route is `/stories/aluminum`. The site shell, landing page, and shared language preference are documented in the [root README](../README.md).

Implemented through Milestone 8: the full grain-to-metal narrative now includes Blender-authored vacuum tapping and open-mould ingot casting, final interaction polish, browser checks, accessibility audits and performance profiling. All implementation is isolated in this folder. The original Blender model and exports are unchanged.

The real GLB, exploded anatomy, solid sections and six electrolysis mechanisms remain. Process, comparison and ending chapters offer direct navigation and a complete reading fallback. The 10–15 minute pacing target still requires real-reader testing. See [release verification](MILESTONE_8.md) for measured checks and remaining external acceptance work.

## Run

Requires Node 22.12+ (verified with Node 24.18).

```powershell
cd path/to/story-narrative
npm ci
npm run dev -- --port 5186
```

Open http://127.0.0.1:5186/stories/aluminum. Scroll, use Page Up/Down, choose a chapter, or use the footer arrows. “Read the story” provides a linear text version. Field notes hold the expanded explanation and source links. `?debug` enables development-only scene sliders.

The footer now offers **guided actions** such as “Open the hood”, “Fill the crucible” and “Reveal the ingot”. Each click plays one short transition and stops for inspection; the entire story can be completed without wheel input. Use Pause or the back action, drag the exploded-view layer slider, or select an electrical circuit step directly. Scrolling still works, with a 35% shorter chapter path. See [interaction controls](INTERACTION_CONTROLS.md).

Use **EN / FR** in the header to switch the entire experience between English and French. The choice is remembered on this browser; switching preserves the current scene, selected part and preferences. Chapters, diagrams, equipment keys, individual parts, field notes, reading mode and accessibility text are translated. See [localization](LOCALIZATION.md) for catalog maintenance and checks.

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser
```

Browser tests use Chromium, installed Microsoft Edge, Firefox and Playwright WebKit. Install bundled engines with `npx playwright install chromium firefox webkit`. Run only Chromium with `npm run test:browser -- --project=chromium`. WebKit on Windows is not a physical Safari/iOS test. Screenshots and traces are written to ignored `test-results/`. The production output is `dist/`; `npm run preview -- --port 4186` serves it locally.

## Implemented

- Twelve chapters, opening grain through casting, with named camera shots.
- One GSAP ScrollTrigger drives a normalized playhead; a pure sampler produces the entire visual state. Both rapid seeks and reverse scrolling resolve from the same data.
- Staged explosion with an endpoint hold, a Whole cell / Inner layers control, labels on both margins and exact base-transform restoration.
- Reassembly finishes before the near half dissolves. A 39 KB Blender-authored asset supplies 35 sets of solid cut faces, with separate bath and metal surfaces.
- A validated semantic mapping of all 723 real meshes into 13 named families, persistent component key, projected leaders, assembly selection and individual-part inspection.
- Electrical topology strip with component highlighting; feeder stroke/dose, dissolution, enlarged reaction interfaces, carbon-loss comparison, off-gas collection and thermal explanation. Model markers and scientific diagrams remain explicitly illustrative in scale and timing.
- Matched normal/anode-effect diagrams with scroll-driven gas coverage, dissolved-alumina markers and a separate qualitative voltage indication. A fixed normal reference, reduced-motion states, WebGL-independent diagrams and explicit return before metal collection.
- Three tapping stages and four casting stages, a 75 KB Blender-authored equipment asset, persistent component identification, collision-resolved anchors and a solid-ingot resolution.
- Mobile composition, discrete reduced-motion scenes, keyboard chapter navigation, reading mode and WebGL failure diagram/retry.
- Lazy 3D module loading; a separate 3.42 MB GLB download with a bounded timeout and retry. The opening grain does not wait for it.
- Demand rendering: scrolling invalidates the canvas; animation does not continuously run when idle. Auto/High/Low resolution choices. Spatial indices accelerate exact label raycasts; mobile avoids invisible leader calculations. Fonts are hosted locally with their licenses.

## Architecture

`src/stories/aluminum/data/content.ts` holds the narrative; `sources.ts` and `claims.ts` hold references and claim status; `process.ts` owns the editable 400 kA design value. `assemblies.ts` maps source names to human-readable identities. The real cell contains 36 anode blocks. The M1 primitive data remains only as a regression fixture.

`src/stories/aluminum/story/states.ts` maps progress to chapter and interpolated state. Chapter lengths drive both document height and normalized boundaries. Transitions finish at 72%; the remainder holds the endpoint. The section reassembles during 0–48% and dissolves the near half during 48–72%. Reduced motion selects endpoints immediately. The store notifies the renderer directly; React subscribes to discrete chapter/view changes.

`src/stories/aluminum/data/shots.ts` owns camera positions, targets, field of view and composition offsets in the real model's Y-up coordinates. `modelAdapter.ts` reads source rig endpoints; `rig.ts` owns staged timing, the shell clearance override and explicit inner-layer offsets. Transforms resolve absolutely. Camera world matrices are refreshed before projecting surface-tested leaders. `sectionGeometry.ts` combines clipped source meshes with the complementary fading half and Blender-authored cut faces. `tools/build-section.py` regenerates those faces from the delivered GLB in an isolated Blender process.

`src/stories/aluminum/three/` consumes state without querying scroll. `ProcessEffects` uses geometry-derived interfaces; `ProcessExperience` supplies scroll-sampled explanatory diagrams. `data/operating.ts` and `story/operating.ts` separate content from mechanism sampling. `data/anodeEffect.ts`, `story/anodeEffect.ts` and `AnodeComparison.tsx` apply the same separation to the abnormal-state comparison. Development globals `__CELL_RENDER__`, `__CELL_ASSET__`, `__CELL_PROCESS__`, `__CELL_COMPARE__` and `__CELL_STORY__` expose statistics, deterministic state and seeking; production disables them.

## Ending architecture and reproduction

`data/ending.ts` owns seven stage descriptions, source links, named shots and equipment identities. `story/ending.ts` samples filling, cooling and reveal. `EndingScene.tsx` preloads the equipment at the metal chapter with a bounded timeout/retry path. `EndingExperience.tsx` keeps navigation and component explanations available without WebGL. `__CELL_ENDING__` is development-only.

`tools/build-ending.py` creates an isolated Blender scene, exports `public/assets/ending.glb` and preserves its source in `assets/ending.blend`. It refuses to replace an existing scene without inspection. Run through Blender MCP or in a fresh Blender session. The asset contains 41 named equipment meshes and 3 groups. `tools/vendor-fonts.mjs` reproduces the locally hosted WOFF2 fonts and SIL Open Font Licenses.

## Representation and validation limits

The grain, process diagrams and ending equipment proportions are illustrative; the cell is the original detailed GLB. There is no fluid simulation, molecular-speciation model, audio, measured gas density, temperature map or operating procedure. The isolated model does not establish verified incoming/outgoing potline busbar connections, so an explicit circuit diagram replaces the provisional physical route. Above-rim geometry remains assumed. The ending depicts a sourced vacuum-tapping mechanism and one air-cooled open-mould ingot route; the final ingot lift is an editorial isolation, not a demoulding mechanism.

Real-reader comprehension/pacing, independent technical-expert review, and physical Safari/iOS/Android/trackpad validation remain external acceptance checks. Automated browsers and emulation do not establish those outcomes. No exact plant replica or universal operating settings are claimed.

See [the asset audit](ASSET_AUDIT.md) for measured GLB inventory and the Milestone 2 contract, and [the checkpoint](MILESTONE_1.md) for verification and remaining limits.

The owner's review adds persistent component identification, varied scene composition, distinct process mechanisms and stricter factual verification. These are recorded as requirements in [the revised Milestones 2–8](NEXT_MILESTONES.md); labels and choreography begin in M2 rather than waiting for final polish.
