# Milestone 3 — Exploded anatomy and solid sections

## Delivered

- Staged enclosure removal, conductor separation with attached clamps, anode lift, cathode drop and individually separated process/lining layers.
- Whole cell / Inner layers study controls, an explanatory stage caption and a final inspection hold. Anatomy uses both margins rather than the preceding chapter's single component key.
- The inner study names 11 groups: alumina cover, frozen crust, electrolyte, liquid aluminium, cathode/collectors, side lining/ledge, bedding, upper and lower firebrick courses, insulation and shell. Each entry selects its source part; the inspector offers every individual member of the corresponding family.
- Leaders attach to ray-tested surfaces, including the near edges of thin courses. Occluded exact selections retain the inspector. Number positions receive a small collision offset; leader endpoints remain on geometry.
- Reassembly completes during the first 48% of the section chapter; the camera settles on the same side of the cell. The near half and overhead equipment then dissolve during 48–72%. The final 28% is a hold. Reduced motion selects the completed section directly.
- Solid cut faces for the shell, lining, cathode, bath and metal, generated in Blender from the delivered GLB. The section is longitudinal through the centre aisle; no false cut through the anode row is implied.

## Transform authority

The source GLB's 15 position tracks remain the base rig. No animation mixer runs concurrently. `src/data/rig.ts` explicitly extends the diagram:

- Shell endpoint changes from −4.7 m to −6.1 m vertically, clearing the separated lining courses.
- Process parent retains +1.2 m. Local reading offsets produce metal +0.95 m, bath +1.4 m, crust +1.85 m and cover +2.2 m total travel.
- Refractory parent retains −2.4 m. Bedding, upper brick, lower brick and insulation receive additional downward offsets of 0.4, 0.8, 1.2 and 1.6 m.
- The existing unanimated cathode group receives −0.3 m travel.

These are diagram gaps in runtime metres, not new model dimensions. Every transform is sampled from its saved base, with zero accumulated motion. Geometry, scale and rotations remain intact.

## Blender asset and isolation

The connected Blender session contained an unrelated scene. Blender MCP launched a hidden, separate Blender 5.2.1 process with `--background --factory-startup`; the live scene and original `out/` files were preserved. All output is under `story-narrative/`.

`tools/build-section.py` imports `public/assets/cell.glb`, samples frame zero, measures the cutter bounds and extracts new faces at Blender Y=0 (runtime Z=0). `public/assets/section-caps.glb` is 39,012 bytes, containing 35 named face sets. `docs/section-asset.json` records source SHA-256, plane, mesh names and surface areas.

An initial boolean against the open gas duct returned a cutter-sized face, visible as a grey background during the fade. The duct and other wholly removed overhead assemblies are now excluded. Export asserts that new faces stay inside the original mesh bounds; runtime tests independently verify the same condition. No renderer workaround or enlarged geometry was retained.

`sectionGeometry.ts` keeps complementary front-half meshes only visible during the dissolve, while the authored faces fade in. Final section materials are opaque. The base cell retains 723 mapped meshes and 140,556 triangles; supplementary section surfaces are recorded separately.

## Verification

The checkpoint requires lint, TypeScript, production build, unit and Chromium/Edge browser checks. Coverage includes:

- Every original mesh's exact world-matrix restoration after arbitrary forward/reverse seeks.
- Pairwise AABB checks across separated groups at the exploded endpoint, with positive overlap tolerance 1 mm; only intentional flex-clamp/conductor grips are exempt. This is a conservative endpoint check, not an intermediate maintenance-path collision simulation.
- Each section vertex lies on the correct plane and within its original part; independent ray hits prove the bath and metal faces exist.
- Reassembly completes before section exposure; supplementary surfaces disappear again at the assembled state.
- Inner-layer controls and individual course selection; reset to the whole-cell key when leaving anatomy; original and section-asset failure/retry.
- Existing forward/reverse, keyboard, restoration, reduced motion, mobile and WebGL fallback cases.

Visual review captures are reproducible with `node tools/review-anatomy.mjs` in `artifacts/milestone-3/`: four explosion positions, inner detail, reassembly, half-section, completed section and mobile counterparts. Production smoke uses `node tools/production-smoke.mjs` against port 4186.

Completed on 19 September 2026: lint, typecheck, all 12 unit tests, all 16 browser cases (8 Chromium + 8 Edge), production build and production smoke passed. Desktop 1440×1000 and mobile 390×844 captures were inspected, including the corrected half-section and mobile controls. Vite retains the existing size warning for the Three.js vendor chunk (951 KB raw / 254 KB gzip); no broad device performance claim is made. Source cell SHA-256 remains identical to `out/cell_anim.glb`.

## Remaining scope

Milestone 4 is detailed process visualization and source validation. The current/bubble/anode-effect overlays and tapping/casting ending remain schematic. Exact manufacturer geometry, a physically reviewed current branch, feeding/dissolution/reaction mechanisms, gas behavior and casting equipment are not claimed complete. See `VISUAL_REGISTER.md` and the revised milestone roadmap.
