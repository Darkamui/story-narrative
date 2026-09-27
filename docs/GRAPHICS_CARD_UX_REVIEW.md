# Graphics card: guided teardown review

Reviewed and implemented on 2026-09-27. Scope: `/stories/graphics-card`, its catalog summary, model derivative and browser checks. Aluminum's experience is unchanged.

## Findings and changes

1. **Too many competing elements.** The previous page combined an oversized introduction, statistic, investigation tabs, persistent camera controls and a separate refresh experiment. The replacement has one lesson, one dominant model and one contextual next action. The part index, camera controls, settings and references open on request.
2. **The physical model did too little teaching.** The processor lesson previously showed the whole board. Nine authored cameras now move from assembly to real component close-ups. Source landmarks anchor labels. Memory and power paths identify relationships; thermal contact is isolated; faded fins expose the heatpipes; the original fan blades rotate around their own pivots. The original geometry remains intact.
3. **Copy assumed too much knowledge.** Main explanations now begin with concrete examples: turning a game camera, a brick-wall texture, paste touching the chip, air passing between fins. Each explanation tells the reader what to find on the model. Technical qualifications and references remain in the detail disclosure and reading view. Both languages follow the same sequence.

The sequence is complete card → layers → processor → memory → power → thermal contact → heatpipes → airflow → display sockets → reassembly. It teaches physical relationships rather than implying these are consecutive operating stages. The cooling explanation explicitly describes continuous operation.

## Visual evidence

Fresh captures live under `artifacts/graphics-card/review-02/` (generated, ignored output):

- `01-start.png`, `02-processor.png`, `03-mobile-processor.png`: original experience.
- `before-after.png`: side-by-side processor comparison.
- `final-0.png` through `final-8.png`: all nine desktop views at 1440 × 1000.
- `final-desktop-contact.png`: contact stack at 1280 × 800.
- `final-mobile.png`: processor at 390 × 844.
- `final-mobile-fr.png`, `final-controls-fr.png`: French memory and inspection at 320 × 740.
- `final-reading.png`: illustrated reading view.

These captures were visually inspected. The model is the dominant element, labels identify actual geometry, and mobile follows heading → model → explanation → observation cue. The next action stays accessible at the bottom. The reduced-motion view hides replay; the model caption remains readable without competing with the explanation.

## Verification and limits

State tests cover reversible positions, camera framing, component isolation, source landmarks, three fan pivots, all 4,217 original meshes, and English/French content. Browser scenarios cover forward/reverse history, reload, close-ups, brief fan motion, keyboard controls, reading mode, language persistence, mobile overflow, reduced motion and asset/module/WebGL failures. Automated accessibility checks include narrow French processor and airflow views; secondary text contrast was corrected after the first run.

Model screenshot comparisons allow at most 0.01% differing pixels: Edge's GPU rasterization produced a one-pixel difference in a 606,483-pixel image. This tolerance still catches camera and part movement. Absolute state has separate unit coverage.

Browser checks and screenshot inspection do not establish comprehension for new readers. A useful next reader test is to ask someone to identify the processor, explain what memory supplies, and trace heat from the die to the air without opening extra notes. The 3D paths explain relationships; they are not electrical or thermal simulations.

Final checks: lint, typecheck, 43 unit tests, production build, 28 graphics-card browser scenarios across four browsers, 12 Chromium/Edge library regressions, and production smoke all passed. Four preserved delivery files match their recorded SHA-256 hashes.
