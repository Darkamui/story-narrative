# Guided actions and direct manipulation

The experience no longer requires repeated scrolling to operate each scene. Thirty-one contextual actions span the cell reveal, exploded layers, five electrical steps, six process mechanisms, four comparison states, tapping and casting. There is no automatic sequence: each action plays for 1.35 seconds, stops and waits for the visitor. Previous action reverses to the preceding inspection point; chapter shortcuts remain independent.

The anatomy slider lets the visitor separate and reassemble the layers directly. The five electrical circuit entries are buttons. Existing process, comparison and ending tabs remain available. The slider is omitted with reduced motion, which presents the exploded endpoint and retains Whole cell / Inner layers inspection; guided travel becomes immediate.

Scrolling remains native and reversible. Chapter lengths total 29.3 viewport heights instead of 45, a 34.9% reduction. The extra one-viewport tail is unchanged. Nothing captures or suppresses wheel or touch scrolling. There is no autoplay and no required click gate that prevents ordinary browsing.

## One playhead

`src/data/journey.ts` holds the authored action labels and chapter-local stopping points. `src/story/journey.ts` chooses the next/previous stop from the actual current story position, with a small rounding tolerance. It does not maintain a second current-step state.

`seekStory` in `StoryController.ts` is shared by chapter links, direct controls and guided actions. Guided travel animates the native scroll position; the existing ScrollTrigger and pure sampler still drive cameras, materials and process effects. Pause, manual wheel/touch input, another control, Escape, viewport resize, reading mode and unmount cancel travel. There are no queued actions that can pull the visitor away after an interruption. Language changes retain the current scene.

The footer presents the current action and a pause control while moving. Mobile places these above the chapter shortcuts and preferences, reserving space in narrative panels. English and French action copy lives with the existing catalogs.

## Verification

`src/story/journey.test.ts` checks forward/reverse stops, rounding tolerance, complete mechanism coverage and the final solid-ingot state. `tests/interaction.spec.ts` exercises a complete tour without wheel input, interruption and keyboard pause, the anatomy slider, circuit selection, French text, reading mode, reduced motion and the mobile WebGL fallback. Existing localization and story regression suites continue to cover direct navigation and reversible scenes.

Verified 26 September 2026: lint, typecheck, 30 unit/asset/catalog tests and the production build passed. All four interaction scenarios passed in Chromium, Edge, Firefox and WebKit, including a full animated tour in Chromium and discrete reduced-motion tours in the other engines. The 10 Chromium story regressions and four localization scenarios passed; keyboard navigation/restoration was also verified in all four engines. Four production smoke checks passed. Desktop/mobile French captures and axe audits passed, including dedicated production checks of the new layer slider and circuit buttons. Firefox required explicit Page Up/Down forwarding from fixed footer controls; text inputs and native content-panel scrolling retain their own keys.
