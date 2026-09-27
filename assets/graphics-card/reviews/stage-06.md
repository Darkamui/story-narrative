# Stage 06 — Motion and delivery

## Render evidence inspected

- `stage-06-motion-contact-sheet.png`, containing `motion-001.png`, `motion-045.png`, `motion-075.png`, `motion-105.png`, `motion-150.png`, `motion-180.png`, `motion-210.png`, `motion-240.png`.
- `stage-06-reopened-exploded.png`, `stage-06-reopened-assembled.png`, `stage-06-side.png`.
- `stage-06-saved-motion-075.png`, rendered directly from the saved action in another fresh Blender process.
- `reimport-assembled-001.png`, `reimport-exploded-001.png`.
- `reimport-explosion_animated-001.png`, `reimport-explosion_animated-121.png`, `reimport-explosion_animated-240.png`.
- Final landscape `../output/animation-frames/frame-0075.png`; encoded-video extracts `preview-decoded-01.png` through `preview-decoded-04.png` (frames 1, 75, 105, 240).

## Observations

The contact sheet shows fasteners withdrawn before the shell/fan/cooler stack separates. Frame 75 and its reverse at 180 have clear shell-to-fan and fan-to-cooler gaps, while the cooler is still close to the board. Frames 105/150 show the fully separated stack; frames 1/240 show the same assembled silhouette. The bracket moves along negative X, keeping the sockets attached to the stationary PCB. No visible interpenetration was found in these inspected poses. Mating planes remain parallel in the side view.

The reopened model retains its populated board, three fans, cooling module, shell and backplate. Export re-imports retain the same layers and material categories. Fin ends now stay inside the casing. Low-sample review renders show some denoising softness in screw shadows and aliasing on thin fin edges; the higher-resolution final hero is clearer.

## Defects found and corrected

1. The initial motion sheet jumped from assembled to exploded. An integer custom property caused the keyframed control to round intermediate values. Recreated the control as a float and rebuilt its action. Fresh-file evaluation now gives 0.104 at frame 45 and 0.648 at frame 75. The corrected sheet and direct saved-action render show intermediate poses.
2. The first animated GLB contained separate clips for each moving group; its default imported clip moved only the rear screws. Disabled the exporter's per-object scene split and exported one combined baked clip. The imported midpoint now separates all moving groups. `reimport-animation-initial.png` preserves the failed result.
3. Static export conversion reused a baked mesh between fin banks sharing base geometry but different array counts. This extended fins past the casing. Made export-copy geometry single-user before converting modifiers. Corrected static and animated files were re-imported and rendered. Initial evidence is retained in `reimport-assembled-initial.png` and `reimport-exploded-initial.png`.
4. The first landscape preview clipped the highest screw at the top edge (`animation-framing-initial.png`). Widened its orthographic camera and checked projected bounds at all eight review frames. All components now have at least 5% margin on every edge; `animation-framing.json` records the bounds. The portrait hero camera remains the same.

## Verification

- Body dimensions: 320.00002 × 132.00001 × 62.002 mm, within the 0.01 mm tolerance including surface text.
- Inventory: 3 fans, 27 blades, 8 memory packages, 10 regulator stages, 6 heatpipes, 1 bracket, 12 main and 4 sense power contacts.
- 4,217 component meshes retained in every GLB; no missing names. Assembly and rotor parent hierarchy retained.
- Every imported component's world-space vertex bounds compared with the evaluated source. Maximum error 7.05e−10 m; tolerance 2e−6 m. Animated endpoint and exploded-midpoint geometry also passed.
- Return-transform error: zero, including comparison with the stored immutable assembled transforms. Imported animation endpoint error: zero. Animated GLB: one action.
- Saved project opens at frame 120 with the root selected, a floating-point control and attached action. No invalid drivers detected.
- Bounded fan BVH check found no blade-to-blade, blade-to-frame or blade-to-strut intersections. This check does not cover every possible surface pair.

Gate: PASS. All 240 PNG frames are present at 1920 × 1080. The sequence contains 101 rendered poses with matching holds/reverse poses reused. The H.264 MP4 decoded to 240 frames at 30 fps and eight seconds; `encoding.json` records the measured output. Decoded review frames retain the full stack with clear margins, and the returned state matches the opening state. No frame cropping or missing component was seen in these final video extracts.

Limitations: the disassembly is illustrative. Cable unplugging, threads, thermal deformation and electrical behavior are not simulated. Connector details and traces are stylized; small features may alias in the preview. GLBs are detailed inspection assets, with lighting and tone mapping supplied by their viewer.

Backend audit: the final camera-only preview rerender used CPU fallback because the new Blender process had `compute_device_type = NONE`. GPU preferences are not stored in the blend file. `animation-backend-audit.log` records this finding; `delivery.py` now configures OptiX explicitly even when skipping the still-render pass. The delivered preview retains 1920 × 1080 and 20 samples.
