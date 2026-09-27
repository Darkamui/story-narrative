# Milestone 1 checkpoint

The repository started with the two narrative documents and no frontend framework. The new standalone app uses React 19.2, TypeScript, React Three Fiber, Three.js, GSAP ScrollTrigger, and Vite. React 19.2 satisfies the installed R3F peer range; React 19.3 did not. Exact dependency versions are recorded in `package-lock.json`.

## Verification

Final checkpoint: lint, typecheck, all six unit tests, production build, and all eight browser tests (four each in Chromium and Microsoft Edge) pass. Refresh, browser back navigation, and returning from reading mode preserve the story position through explicit history-state restoration.

- Six unit tests exercise chapter coverage, clamping, forward/reverse determinism, boundary continuity, explosion endpoint holds and base-transform restoration, reduced motion, and source IDs.
- Browser coverage exercises all twelve chapters in both directions, compares rendered part transforms, captures desktop/mobile screenshots, checks headings remain in view, chapter navigation, Page Down, refresh in the middle, reduced motion, narrow layout, reading mode and forced WebGL failure.
- Desktop screenshot review covers opening, reveal, exploded anatomy, current, abnormal state and casting. Mobile exploded anatomy was inspected at 390 × 844.
- Visual defects fixed during review: premature fallback activation, chapter copy leaving the viewport before the endpoint hold, and stale camera matrices displacing projected labels.
- The TypeScript production build produces a lazy 3D chunk. The Three/R3F dependency bundle is about 240 kB gzip; the entry bundle about 108 kB gzip. Vite reports a large uncompressed vendor chunk warning. No GLB or external texture download blocks the opening.
- Measured primitive scene: 39 draw calls / 468 triangles for assembled and exploded endpoints; 49 / 1,608 for current; 62 / 2,580 for abnormal-state markers; 1 / 80 for the grain and 1 / 12 for the symbolic cast form. These counts do not describe the final GLB.

These are prototype checks, not a claim of completed Milestone 8. No physical trackpad/tablet, Firefox/Safari, Lighthouse run, GPU-constrained device, or 10–15 minute reader study was performed. The 60 fps target has not been established by hardware profiling. Canvas rendering is demand-driven; `node tools/browser-diagnostics.mjs` reports representative draw calls and triangle counts from the local development server.

## Content review

The IAI *Aluminium Sector GHG Protocol* (2006), Appendix B §1.2 and Appendix C, was consulted for electrolysis and anode-effect copy. The UNECE source search excerpt supports the simplified current/tapping route; the PDF endpoint returned HTTP 403 during retrieval, so a full source review of that route remains required before M4. Numeric operating thresholds, temperatures and gas quantities are intentionally absent.

Schematic process markers validate state transitions only. Amber coloration is an explanatory marker, not a temperature scale or a statement that current increases during anode effect. The source model’s 400 kA design basis is editable in `src/data/process.ts`.

## Next boundary

Milestone 2 integrates the real GLB through a semantic adapter, then reruns the same state, camera, reversal and visual checks. The full documentary remains future work. No changes were made outside `story-narrative/`.
