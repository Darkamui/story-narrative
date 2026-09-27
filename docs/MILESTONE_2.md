# Milestone 2 — real cell, identity and stage

## Implementation

The runtime now loads `public/assets/cell.glb`, a copy of the existing animated export. The original Blender source and root exports remain unchanged. The opening grain renders independently while the asset downloads; HTTP failure and a 12-second timeout offer a model-specific retry without removing the narrative.

The runtime asset and `out/cell_anim.glb` have matching SHA-256: `32BDBE7086EE950B9B02EF322ABDA5887F8D8F68815A5205C245F0D9E33C65E8`.

Measured with Three.js GLTFLoader: 723 renderable meshes, 140,556 triangles, 13 semantic assembly families and 15 animated rig controls. The assembled bounds are approximately 17.18 × 5.065 × 6.53 metres in runtime X/Y/Z. Runtime Y is up. `runtime-asset.json` records the family counts and rig endpoints.

`modelAdapter.ts` validates every mesh and required label anchor. It reads base/end translations directly from the source `Scene` animation. `data/rig.ts` supplies timing windows only; there is no second vector table and no simultaneous AnimationMixer. Parent rig nodes move, while child transforms retain the exported assembly coordinates. Nine unit tests now include the real asset contract, baked endpoints and exact world-matrix restoration after arbitrary forward/reverse seeks.

## Identification

All cell scenes expose a 13-entry component key. It distinguishes shell, lining, cathode, metal, bath, crust/cover, anodes, conductors, structure, feeding, gas offtake, hooding and hardware. Each assembly offers its purpose and a keyboard-accessible list of every individual mesh. Clicking geometry also selects a part. A selection highlights the family, and an individual selection adds a bounding outline when the object is present.

Projected leaders attach to named model anchors and suppress lines to occluded or clipped anchors. The component key remains available even when its representative anchor is hidden. Exposure text describes the representative anchor; a family can contain both exposed and obscured members. Mobile uses a compact two-column key containing all 13 assemblies. This is a functional identity system, with further leader routing and anatomy presentation refinement scheduled for M3.

## Composition

The permanent text/model split has been replaced by a full-width stage with per-chapter layout and camera data. Opening and ending use centered editorial compositions. The reveal leaves the whole object on stage with a small lower caption. Assembly identification uses an overhead view; explosion uses a wider atlas composition; the section becomes a near side elevation. Later process chapters use different interface/detail and overview framings.

Camera projection offsets place each focal point in the authored part of the viewport. Interpolation remains a pure function of story state; reduced motion switches directly between authored endpoints. Source materials are retained with restrained process emission and a generated studio reflection environment so metal surfaces remain readable without external HDR downloads.

## Fidelity and limits

`src/data/claims.ts` records technical statements, source locations, linked chapters, evidence status and limitations. `assemblies.ts` records component purposes and distinguishes assumed above-rim equipment geometry. The previously inaccessible UNECE source is no longer used for the active current/tapping text; the retrieved Hydro process document supplies those references.

The current process overlays are still schematic. Their electrode, bath, metal and cathode markers now use measured model locations; they do not validate circuit branch distribution, gas dynamics or a plant-specific operating condition. M4–M6 still own detailed process visualization, abnormal-state comparison and sourced tapping/casting equipment. The grain and final cast form remain symbolic geometry.

The runtime section currently clips the near half and removes overhead/cover assemblies. It is an open section without authored end caps. M3 must improve cut-surface treatment, spacing and layered anatomy legibility. Source-model geometric assumptions remain in force; this milestone does not claim an exact plant replica.

## Reproduction

Final verification: lint, typecheck, 9 unit tests, production build, all 12 browser tests (6 each in Chromium and Edge), and the production smoke check passed. Desktop shots and mobile opening/reveal/anatomy/process-entry screenshots were visually reviewed. The retry test exposed a stacking-context bug where opening copy intercepted the retry button; the notice now lives above the scene and copy, and retry succeeds in both browsers. Vite retains the documented large-vendor-chunk warning; it is not a build failure.

Run `node tools/inspect-runtime-asset.mjs` to remeasure the original animated export and update `docs/runtime-asset.json`. The checked-in runtime asset is self-contained under `public/assets/`; the root `out/` folder is not required to run the delivered app.

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:browser`. Browser coverage includes Chromium and Edge, all chapters forward/reverse, mobile/reduced motion, navigation/restoration, WebGL fallback, part selection and model retry. `tools/review-scenes.mjs` captures the major desktop and mobile compositions for visual review.

Full profiling of the 60 fps target and cross-browser/device release QA remain M8. The assembled and exploded scenes render 723 mesh draw calls and 140,556 triangles. This is the actual export cost; instancing/merging must preserve part identity and rig control if introduced after measurement.
