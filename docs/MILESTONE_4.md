# Milestone 4 — Operating mechanisms

## Delivered

The twelve-chapter structure remains. Electrolysis now contains six separately framed, scroll-operated mechanisms, with direct navigation buttons:

1. **Feed:** the central model feeder and an opening diagram. The chisel stroke precedes the illustrative dose. Its displayed travel is derived from the source tip and bath surface, not a plant control setting.
2. **Dissolve:** close bath view; grains disappear into a separate dissolved-material illustration. No grain becomes a silver metal particle, and no simplified fluoride-ion formula is invented.
3. **React:** enlarged interface diagram with a carbon anode, ionic-current region and cathodic liquid-metal surface. Bubbles travel under the anode and around its edge. The idealised net equation is displayed separately from particle motion.
4. **Consume carbon:** earlier/remaining block comparison with a hatched consumed portion. This is a material comparison, not a simulation of operating anode position or service life.
5. **Collect gas:** restored hood context and duct, plus an explicitly schematic collection diagram ending at off-model treatment. It does not depict a streamline through unverified internal roof geometry.
6. **Retain heat:** longitudinal section and energy-flow diagram. Arrows communicate heat-loss direction without a temperature or flux scale.

Current has a five-part electrical connection strip and corresponding model highlights. The normal-operation overview reunites feed equipment, gas offtake and the working layers, explicitly stating that the mechanisms operate concurrently. The metal chapter identifies the reduction interface above the metal pad, without inventing a production rate or changing pad thickness.

The opening now places Bayer refining before Hall–Héroult smelting. Every process beat has its own field notes and source links; reading mode includes all six explanations and references. Reduced motion preserves access to every beat with static mechanism states. All effects remain driven by story position; no timer or autonomous animation loop was added.

## Evidence

Sources accessed 19 September 2026:

| Subject | Source and locator | Adoption |
|---|---|---|
| Refining precedes smelting | [Australian Aluminium Council, alumina refining](https://aluminium.org.au/about-aluminium/how-aluminium-is-made/alumina-refining/) | Opening context only. |
| Feeding | [CHALCO / ICSOBA 2020 AL08](https://icsoba.org/assets/files/publications/2020/AL08S.pdf), p. 631, Introduction | Crust breaking before alumina addition; no controller settings adopted. |
| Dissolution and anode use | [Australian Aluminium Council, smelting](https://aluminium.org.au/about-aluminium/how-aluminium-is-made/aluminium-smelting/), Steps 1–3 | Qualitative process sequence. |
| Electrochemistry | [OpenStax Chemistry 2e §17.7](https://openstax.org/books/chemistry-2e/pages/17-7-electrolysis) | Electronic versus ionic conduction; no actual electrolyte-species distribution claimed. |
| Interfaces and reaction | [Aarhaug & Ratvik, JOM 2019](https://link.springer.com/article/10.1007/s11837-019-03370-6), Process Overview, Eq. 1 | Cathodic metal phase; idealised equation multiplied by four. Independently balanced: both sides contain 4 Al, 6 O and 3 C atoms. |
| Bubble route | [ICSOBA 2019 AL16](https://icsoba.org/assets/files/publications/2019/AL16.pdf), §6, PDF p. 4 | Under-face generation, edge escape and channel rise; no bubble size/speed measurements adopted. |
| Gas treatment | JOM, Gas Treatment Centre; [Fives GTC](https://www.fivesgroup.com/aluminium/gas-treatment-centre) | Collection and dry-scrubbing context, with explicit CO₂ limitation. |
| Electrical path | [Hydro, printed p. 04](https://www.hydro.com/globalassets/download-center/publications/whitepapers/trust-transparency-and-transition.pdf) | Conventional current through the process; not a source for this model’s busbar geometry. |

`src/data/claims.ts` adds traceable claim entries; `VISUAL_REGISTER.md` identifies abstractions. No new industrial setpoint, gas quantity, concentration, operating interval or production rate is displayed.

## Model connection finding

Inspection of root `modules/m06_busbars.py` shows that the isolated source model places risers at a local collector busbar. This geometry is not sufficient to establish a physically correct incoming-versus-outgoing potline circuit. Presenting a continuous animated line through it would imply unverified wiring.

The M2 path that connected mesh centres has therefore been removed. M4 uses an electrical topology diagram and distinguishes supply riser/arm materials from return collector/flex materials for highlighting. The field notes state that the isolated busbars are not a verified plant connection plan. A future exact plant representation requires a reviewed busbar specification; M4 does not claim to resolve that engineering gap.

The accepted closed roof beneath the gas throat is likewise not treated as a verified flow passage. Collection is shown as a process connection diagram. No source geometry outside `story-narrative/` was modified.

## Implementation

- `src/data/operating.ts`: six editable explanations, references, named shots, electrical steps and net equation.
- `src/story/operating.ts`: pure mechanism sampling, representative feed cycle and bubble route.
- `src/three/effects/operatingAnchors.ts`: geometry-derived feeder, bath, metal and anode interfaces.
- `ProcessEffects.tsx`: deterministic feed, dissolved-material and gas markers; metal-interface emphasis. Replaces `ProcessSketch.tsx` and its provisional continuous current line.
- `ProcessExperience.tsx`: semantic mechanism navigation, scroll-sampled SVG diagrams, electrical strip, operating overview and full reading fallback.
- Existing story/controller, model adapter, selection, labels and camera system remain in use. React subscribes to discrete mechanism changes; SVG geometry and Three transforms update imperatively with the story store.
- Development controls independently gate feeding, dissolution, reaction, carbon consumption, gas collection, heat, bath visibility and metal visibility, alongside the previous controls. Bath/metal visibility also applies to their cut faces.

## Verification and limitations

Checks cover feeder-before-dose sequencing, all six mechanisms in both motion modes, reverse seeks, bubble clearance around the anode, and actual GLB interface measurements. Browser checks also exercise direct mechanism selection, mobile layout and complete reading-mode content. Screenshots are reproducible with `node tools/review-process.mjs` under `artifacts/milestone-4/`.

Visual inspection covered all six desktop mechanisms, current, the operating overview, metal collection and mobile process diagrams. It caught and corrected the feeder/dissolution framing, metal-label contrast, current-arrow encoding and gas-diagram placement. The WebGL fallback was also repositioned to avoid the opening copy, and its reaction diagram remains available without the canvas.

Final checks on 19 September 2026: lint, TypeScript, all **17 unit tests** and the production build passed. The complete **20-test Chromium/Edge suite** passed on an unchanged run. An earlier Edge failure coincided with Vite hot updates and WebGL context loss in its trace; the isolated test and subsequent full run passed. The final independent bath control passed direct keyboard checks in both engines; process browser checks were rerun after that addition. Production smoke passed with one canvas, chapter navigation, component labels, no page errors and no development globals. The existing 951 KB raw / 254 KB gzip Three.js vendor chunk warning remains for measured M8 performance work.

The process is a sourced qualitative explanation, not CFD, electrochemical speciation, thermodynamics software, a production control interface or a replica of an identified plant. Particle quantities, time scales, reaction-gap enlargement and consumed-carbon amount are labelled illustrative. Expert technical review remains a release requirement in M8.

M5 still owns the normal/anode-effect comparison; its existing amber warning is not the completed comparison. M6 still owns physical tapping and casting. M7–M8 own reader pacing, broader device performance and final accessibility/technical review.
