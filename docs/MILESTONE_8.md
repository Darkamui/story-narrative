# Milestone 8 — release verification

20 September 2026. Implementation of M0–M8 is complete. This is a local release candidate; deployment was not requested. External reader, technical-expert and physical-device acceptance is explicitly separate below.

## Reproduce

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:browser
# Serve the production build on 4186 before the next two commands.
node tools/lighthouse-release.mjs
node tools/profile-release.mjs
# Serve development on 5186 before these visual/accessibility checks.
node tools/audit-accessibility.mjs
node tools/review-ending.mjs
node tools/review-comparison.mjs
node tools/smoke-release.mjs
```

The Lighthouse/profile scripts use the installed Windows Microsoft Edge executable. Reports, screenshots and DevTools-compatible timeline traces are retained locally under ignored `artifacts/milestone-8/`. These are measurements of this machine and run, not service-level guarantees.

## Functional and accessibility checks

- Lint, TypeScript and production build pass. The build retains a warning for the approximately 988 KB minified Three/R3F/BVH chunk (approximately 265 KB gzip); it is loaded separately from the React UI.
- 25 unit/asset checks pass. They cover source geometry, rig endpoints, independent process channels, section caps, forward/reverse sampling, phase ordering, all ending mesh identities and the tapping inlet's measured position inside the metal pad.
- All 80 browser checks passed: 20 each in Chromium, installed Edge, Firefox and Playwright WebKit. They cover all chapters, rapid forward/reverse seeks, selection, reduced motion, mobile layout, reading mode, model/cap/ending HTTP failures and retry, a 13.5-second stalled transfer, chapter links, keyboard input, mouse wheel, resizing, refresh, back restoration and no-WebGL fallback.
- Separate production smoke checks passed in all four engines, covering direct chapter entry, inner anatomy, the ending, reading mode and absence of development globals/page errors. This caught a Firefox exact-boundary issue hidden by the development loading sequence: reading ScrollTrigger's full-precision progress, rather than a rounded tween property, corrected it. The pure sampler also tests every exact chapter boundary.
- After that controller correction, twelve targeted browser checks passed again across all four engines (whole-story reversal, interface comparison, navigation/restoration), as did all 25 unit/asset checks. Final production screenshots were inspected; the ending equipment now fades before the close ingot framing so it does not cover the closing copy.
- Axe WCAG A/AA checks found zero violations in eighteen sampled states: eleven desktop chapter states, the complete reading version, and six mobile states. This is an automated audit, not a claim of full accessibility certification or screen-reader testing.
- Visual captures cover the ending at 1440×1000, 1280×800 and 390×844, as well as the earlier cell, section, mechanisms and comparison. Ending anchors resolve collisions with leaders. Mobile controls have at least the audited 24-pixel minimum target size.
- A real WebKit deep-link/restoration race was fixed in the controller; its previously failing no-WebGL case passed three consecutive runs after correction.

## Performance evidence

Hardware profile: Windows, installed Edge, NVIDIA GeForce RTX 5060 Laptop GPU through ANGLE/D3D11, 1440×1000, production build. Twenty-four scroll samples per chapter, with a DevTools timeline recording. Median animation-frame intervals were approximately 16.7 ms across reveal, anatomy, section, electrolysis, tapping and casting. Section and electrolysis p95 intervals were approximately 72 and 67 ms; transition/startup tasks reached approximately 183 ms. This supports smooth sustained desktop playback, with brief hitches still present.

Stress profile: 390×844, software SwiftShader graphics, 4× CPU slowdown, automatic low quality. Median intervals were approximately 40 ms for reveal, 18 ms for anatomy, 30 ms for section, 24 ms for electrolysis, and 13–14 ms for the lightweight ending. This is an artificial constrained configuration, not a physical phone measurement. Both runs had no page errors and no production debug globals.

Optimizations were tied to measurements: exact triangle raycasts now use shared per-geometry BVHs; invisible mobile leaders no longer perform expensive raycasts; transparent model fades avoid a redundant second render pass. Sampled desktop label work fell from approximately 23 ms to 12 ms in the reveal and from approximately 8 ms to 6 ms in anatomy. The added BVH code is approximately 15 KB gzip; its integration follows the [library's documented API](https://github.com/gkjohnson/three-mesh-bvh#use). The first profile used software-rendered bundled Chromium unintentionally; it was replaced by the GPU-identified hardware/stress measurements above.

Lighthouse 13.5, production preview, installed Edge, correct desktop/mobile configurations:

| Audit | Desktop | Simulated mobile |
|---|---:|---:|
| Performance | 79 | 57 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| First contentful paint | 0.6 s | 2.9 s |
| Largest contentful paint | 0.7 s | 3.6 s |
| Total blocking time | 470 ms | 2,070 ms |
| Layout shift | 0.001 | 0.001 |

Mobile startup remains a material performance limitation. The 3.42 MB model and 3D initialization are still substantial under simulated slow-network/CPU conditions. UI-first chunking, the independent opening, local fonts, low quality and a complete reading mode mitigate the impact; they do not make the detailed scene cheap. Lighthouse results vary with shader caches and machine load. Do not compare the earlier misconfigured “desktop” report (which actually used mobile settings) to this final table.

## Scientific and geometry review

Claims and visuals are registered in `src/data/claims.ts`, `sources.ts` and `VISUAL_REGISTER.md`, with source locators and limits. No new industrial amperage, temperature, pressure, feed rate, gas density, alloy specification or control setting was invented. Equipment-stage descriptions use Fives ECL, Hydro, Pyrotek, ALTEK and Hertwich sources. Section geometry, explanatory motion and actual operating mechanisms are distinguished in the interface.

The delivered original cell GLB and section caps remain byte-for-byte unchanged. New equipment lives in its own Blender scene and export. No root modelling module or specification was modified.

## External acceptance not claimed

- Real-reader comprehension and 10–15 minute first-visit pacing.
- Independent aluminium-process expert approval. Published-source checking is not expert sign-off.
- Exact plant/OEM geometry, above-rim equipment, incoming/outgoing potline connections and the original hood's internal gas passage. These remain identified assumptions, not hidden factual claims.
- Physical Safari/macOS/iOS, Android, tablet hardware and human trackpad testing. Firefox and WebKit engines, viewport emulation, wheel events and SwiftShader stress tests are the evidence available here.
- Audio, fluid dynamics, molecular speciation and a plant operating procedure are outside the implemented documentary scope.
