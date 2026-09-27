# AXIOM 320 — editable exploded graphics card

Original fictional triple-fan graphics card, built and rendered in Blender 5.2.1 LTS. The populated board is the stationary datum. Geometry, materials, a reversible assembly control, staged render evidence, and portable exports are included.

## Open the project

- Primary scene: [output/modern_gpu_exploded.blend](output/modern_gpu_exploded.blend)
- Primary hero: [renders/final/01-exploded-hero.png](renders/final/01-exploded-hero.png)
- Board macro: [renders/final/PCB_macro.png](renders/final/PCB_macro.png)
- Cooler underside: [renders/final/Cooler_under.png](renders/final/Cooler_under.png)
- Animation preview: [output/explosion_preview.mp4](output/explosion_preview.mp4)
- GLB exports: [assembled](output/modern_gpu_assembled.glb), [exploded](output/modern_gpu_exploded.glb), [animated](output/modern_gpu_explosion_animated.glb)
- Component inventory: [component-manifest.json](component-manifest.json)
- Stage reviews: [01](reviews/stage-01.md), [02](reviews/stage-02.md), [03](reviews/stage-03.md), [04](reviews/stage-04.md), [05](reviews/stage-05.md), [06](reviews/stage-06.md)

The scene opens exploded, with `GPU • EXPLODE CONTROL` selected. Its Object Properties → Custom Properties → `explode` value is normalized: **0 = assembled, 1 = exploded**. The timeline animates this same property. Scrubbing the timeline overwrites a manual value; disconnect the root's action to use the slider independently. The provided `presentation.state(value)` helper does this while retaining the motion action as a fake-user datablock; `presentation.motion()` restores it.

Named cameras include Exploded, Assembled, Rear, Side, PCB_top, PCB_back, PCB_macro, Cooler_under, Cooler_top, Fan_front, Fan_back, Shroud_under, Mount, Hardware and Animation. Detail renders isolate relevant assemblies without creating duplicate authoritative models. Rotors have individual shaft-centered origins and can rotate about local Z.

## Layout and construction

- Metres internally; metric display in millimetres. X = length, Y = fan-plane height, +Z = fan face; I/O at −X.
- Body: 320 × 132 × 62 mm. Surface text extends 0.001 mm at each face; numerical envelope tolerance is 0.01 mm. Bracket/tab are excluded from the body envelope.
- PCB: 245 × 112 × 1.6 mm, X center −32.5 mm, leaving 70 mm clear to the positive-X end.
- Three 88.6 mm swept rotors at X = −103, 0, +103 mm; nine blades each, 30 mm hubs. Blade thickness and bevel remain editable.
- Eight memory packages; ten illustrative power stages, each with choke, power package, capacitors and supporting components; six continuous bent heatpipes.
- Three logical fin banks. The third bank is divided into array sections around a power-connector recess. Fins are 0.30 mm thick on 1.6 mm pitch.
- Pads, contact lands, holes and mounting hardware derive from shared component/mount coordinates in `scripts/config.py`. Fine feature construction is in `assembly.py` and `geometry.py`.
- Soldered board parts remain with the PCB. Fins, pipes, cold plate and contact lands remain in the cooling module. One I/O bracket clears sockets along −X.

Repeated small mesh types share datablocks. Fin arrays, airfoil solidify, curves, and most bevels stay editable. Structural aperture booleans are applied to robust mesh surfaces; scripts preserve their reproducible construction. Separate named objects/collections retain meaningful component identity.

## Animation

240 frames at 30 fps (8 seconds): assembled hold 1–30; staggered explosion 31–105; exploded hold 106–150; reassembly 151–225; assembled hold 226–240. Fasteners and bracket clear before constrained assemblies separate. The sequence reverses the same deterministic functions.

Group offsets at full explosion: shell +250 mm, fans +172 mm, cooler +85 mm, pads +30 mm, backplate −100 mm, bracket −45 mm along X. Fasteners have separate axial offsets. No reveal tilt is used.

The preview has a fixed landscape camera and retains the whole stack. Complete 1920 × 1080 PNG frames are in `output/animation-frames`, at 30 fps. Identical holds and matching reverse poses reuse rendered frames; every output frame is present. `reviews/animation-frame-index.json` records this reuse.

## Render workflow

Executable used: `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`.

Cycles with OptiX on the NVIDIA GeForce RTX 5060 Laptop GPU (8 GB). `reviews/backend.json` and `reviews/backend-probe.png` record the successful test. The code enables the OptiX device, with a CPU fallback. Warnings about unused HIP/Intel backends did not prevent OptiX rendering; no drivers or system settings were changed.

The final preview's camera rerender used Cycles CPU fallback: that fresh process did not inherit GPU preferences. Stills and visual review renders used the configured OptiX backend. The delivery script now explicitly initializes the device for animation-only runs as well. Both paths retain the stated resolution and sample count.

AgX color management, neutral world and four area lights. Neutral review and beauty light-energy presets are separate. Reviews are 1400–1500 pixels wide, generally 32 samples; final hero is 3000 × 3200 at 96 samples; final macros and assembled/rear heroes are 2000 × 1400 at 64 samples. Animation uses 20 samples with denoising. No depth-of-field blur, bloom, grunge, or image-generation replacements are used.

Materials use Principled BSDF base color, metallic, roughness, and restrained cyan emission. No external textures, fonts or paid assets are required. Export copies convert text/curves/modifiers to geometry. GLB preserves simple PBR materials; lighting, AgX tone mapping and renderer-specific shading are not portable and viewers can look different.

## Rebuild commands (PowerShell)

Run from this project folder. `build.py` starts a fresh background scene and writes only project outputs. It is not intended to run inside an unrelated interactive scene.

```powershell
$blenderExe = 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe'
& $blenderExe -b --factory-startup --python scripts/probe.py
& $blenderExe -b --factory-startup --python scripts/build.py -- 5
& $blenderExe -b output/modern_gpu_exploded.blend --python scripts/delivery.py -- --animate
& $blenderExe -b output/modern_gpu_exploded.blend --python scripts/export.py
& $blenderExe -b output/modern_gpu_exploded.blend --python scripts/source_bounds.py
& $blenderExe -b --factory-startup --python scripts/reimport.py -- assembled
& $blenderExe -b --factory-startup --python scripts/reimport.py -- exploded
& $blenderExe -b --factory-startup --python scripts/reimport.py -- explosion_animated
& $blenderExe -b output/modern_gpu_exploded.blend --python scripts/geometry_checks.py
& $blenderExe -b output/modern_gpu_exploded.blend --python scripts/verify_saved.py
python scripts/sheets.py
python scripts/encode.py
```

To reproduce individual checkpoints, pass stages 1, 2, 3, 4 or 5 to `build.py`. Stages 4/5 can also reuse an existing complete checkpoint via `render_stage.py`. Historical `*-initial.png` files document actual defects and iterations; later source includes the corrections. `refine_stage3.py`, `refine_stage4.py` and `refine_stage5.py` document the one-time corrections made to saved checkpoints and should not be rerun on the final scene.

Blender Python needs no additional packages. Encoding and contact sheets use the already available system Python `imageio_ffmpeg` and Pillow packages. PNG delivery remains usable independently of encoding.

## Validation and limitations

Validation checks dimensions, required counts, resource paths, modifier visibility, manifest coverage and exact transform reversibility at 0, 0.5, 1 and 0. Documented transform tolerance: 1e−7 m; measured return error is recorded in the JSON reports. Fan blade/frame/support intersections are checked separately with evaluated mesh BVHs. Intentional blade-root embedding and soldered cooler joints are excluded.

All three GLBs were imported into fresh scenes and rendered. Each retained all 4,217 named component meshes and the assembly hierarchy. World-space vertex bounds of every component match the editable source within 2e−6 m (measured maximum 7.05e−10 m). The animated file contains one combined clip; assembled endpoints match exactly and the exploded midpoint matches the static exploded geometry. `reviews/reimport-*.json` records these checks. `reviews/saved-file-verification.json` checks the saved floating-point control and action directly, without repairing them on load.

This is a technical visualization of a fictional product. Traces are cosmetic; connector dimensions/contact counts beyond the specified power interface are illustrative. BGA solder balls, internal PCB layers, detailed screw threads, actual electronics, airflow and thermal performance are not simulated. Port mouths are stylized. Thin fins and tiny traces can alias in previews. The mesh exports are inspection assets with many named parts; they are not game optimized. Visual motion checks and bounded collision checks do not certify a repair procedure or manufacturing accuracy.

Reference mapping: `all-sides.png` = exterior identity; `2.png` = exploded concept; `3.png` = component details. `1.png` is the superseded exterior milestone board. Reference images are retained unchanged and are not used as evidence of the built model.
