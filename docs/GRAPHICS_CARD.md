# One Frame

Route: `/stories/graphics-card`. Catalog entry: `src/app/stories.ts`. All implementation lives in `src/stories/graphics-card`.

## Narrative and interaction

The story opens a card to explain what its parts do. Nine guided views connect the complete assembly, layers, processor, memory, power circuits, thermal contact, heatpipes, fans, and display outputs. A quiet paper background, large model, one explanation and one contextual next action keep attention on the current part. This is an independent guided teardown; aluminum retains its scrolling process narrative.

Selecting a view updates the URL fragment, content, visible components, labels and camera. Browser back/forward and reload recover that selection. Forward and reverse actions derive assembly positions and final cameras from absolute state. Desktop fits the explanation beside the model; mobile places the model between the heading and explanation, with a sticky next action. The part index allows direct navigation. Legacy `#deadline` and `#cooling` links remain supported.

- Guided cameras: real macro views of the processor, memory and output sockets; isolated thermal contact; heatpipes visible through faded fins.
- Anchored labels: one to three labels use component bounds extracted from the original model.
- Demonstrations: brief memory/power packets and actual fan rotation; schematic lines explain relationships without claiming to simulate wiring or fluid flow.
- Inspection: optional turn and zoom sliders plus pointer orbit; layer separation for relevant views. Reset restores the guided camera. Default touch gestures scroll the page.
- Reading view: all nine explanations, extended notes, references and original renders. Opening it releases the WebGL renderer. Sources and settings are disclosed on request.

English and French use the site's persisted preference. System reduced motion or the manual control removes transitions and demonstrations. Otherwise navigation briefly animates the relevant parts, then rendering stops; replay is explicit. Failed models, renderer imports, unavailable WebGL, and context loss retain the narrative and a matching still image. The retry button reloads the page for failed modules and retries the asset/renderer otherwise.

## Assets and provenance

Source project: `C:/Local/2026/3d-graphics-card`.

`assets/graphics-card/delivered` preserves the original assembled, exploded, and animated GLBs and the editable Blender file. The source manifest, README, and historical Markdown/JSON reports are beside them. Historical review images and render logs remain in the source project; relative image links inside the copied historical reports refer to that original project. None of these source files is served to visitors.

`public/assets/graphics-card/axiom-320.glb` is the browser derivative. `tools/build-graphics-card.mjs`:

1. Reads the preserved assembled GLB and bakes each mesh's world transform.
2. Batches by assembly, inspection zone, rotor, and material; all 4,217 original component meshes and 1,116,226 triangles are represented in 57 batches.
3. Preserves assembly parents and three independent fan pivots. Separates processor, memory, regulator, connector, output, paste, contact, pipe and fin zones. Stores source component bounds for anchored labels.
4. Retains float positions, quantizes normals to 12 bits, and applies Meshopt compression. Float positions preserve the tiny spacing under surface lettering; 16-bit positions caused visible depth fighting. No mesh simplification is used.
5. Writes a 12.85 MB GLB and `runtime-inventory.json`, which maps each batch to its source component names. Three.js sanitizes some punctuation in names.

The original Blender and GLB deliveries remain authoritative. Normal quantization can make tiny shading differences in the browser derivative. The browser supplies its own lighting and tone mapping, so its appearance differs from the Blender renders. A tight orthographic depth range preserves the authored lettering's surface separation.

Four WebP illustrations under `public/images/graphics-card` are resized derivatives of the source project's final exploded, assembled, board-macro, and cooler-underside renders. No generated substitute model or imagery is used.

## Content references

- [NVIDIA, Graphics Pipeline Performance](https://developer.nvidia.com/gpugems/gpugems/part-v-performance-and-practicalities/chapter-28-graphics-pipeline-performance): rendering stages and distinctions between computing and memory bottlenecks. This is a historical conceptual reference, not a claim about AXIOM's architecture.
- [Intel, XeSS 2 Whitepaper](https://www.intel.com/content/www/us/en/developer/articles/technical/xess2-whitepaper.html): fixed refresh intervals and frame pacing.
- [NVIDIA, Tesla K20 Active Board Specification](https://www.nvidia.com/content/PDF/kepler/tesla-k20-active-bd-06499-001-v03.pdf): an example of a physical fan/heatsink/baseplate cooling assembly. It does not specify this fictional model's performance.
- [Texas Instruments, Multiphase processor power](https://www.ti.com/product-category/power-management/multiphase.html): voltage regulation and shared load.
- [Noctua, Thermal contact and paste](https://www.noctua.at/en/expertise/tech/performance-comparison-nt-h1-vs-nt-h2): contact resistance and paste.
- [Boyd, Heat pipe technology](https://info.boydcorp.com/hubfs/Thermal/Two-Phase-Cooling/Boyd-Heat-Pipes-Brochure.pdf): evaporation, condensation and capillary return.
- Source model manifest and delivery README: AXIOM dimensions and component counts.

Internal chip structure, board traces, ports, electronics, airflow, temperatures, and performance are illustrative. Cooling operates continuously; it is not a serial stage after each frame. Component count does not establish memory capacity, bandwidth, or generation.

## Verification

`state.test.ts` checks reversible motion, deep links, part isolation, macro cameras, localized labels/content, all source components, rotor pivots and source landmarks. `tests/graphics-card.spec.ts` exercises the live model, stable model restoration, fan motion, navigation/history, controls, reading mode, language, narrow layouts, reduced motion, accessibility, and model/WebGL failures. The library regression asserts that neither story implementation nor 3D assets load on the landing page.

Visual review captures belong in ignored `artifacts/graphics-card/`. Run the repository lint, typecheck, unit tests, production build, and relevant browser suites after changes.

Initial delivery verification (2026-09-27, before the guided teardown redesign): lint, typecheck, all 43 unit tests, and the production build passed. All five graphics-card browser scenarios passed in Chromium, Edge, Firefox, and WebKit (20 tests); the six Chromium library regressions also passed. A production smoke check confirmed lazy library loading and a working model, with no page errors. Desktop and mobile views were inspected, including French at narrow widths. SHA-256 hashes in `assets/graphics-card/provenance.json` confirm that the four copied deliveries match the source project.

Guided teardown verification (2026-09-27): lint, typecheck, 43 unit tests and production build passed. Seven graphics-card browser scenarios passed in each of Chromium, Edge, Firefox and WebKit (28 scenarios); six library regressions passed in both Chromium and Edge (12 scenarios). Production smoke covered both stories, navigation and lazy loading without page errors. Original delivery hashes still match. See [UX review](GRAPHICS_CARD_UX_REVIEW.md) for visual evidence, findings and screenshot tolerance.
