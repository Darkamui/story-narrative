# Milestone 5 — Normal operation and anode effect

## Delivered

Chapter 8 now has four scroll-driven beats: a normal reference, onset, a held anode-effect comparison, and an explicit return to normal before the metal chapter. Direct Normal reference / Anode effect / Return to normal buttons offer the same states without scrolling through the whole sequence.

Desktop keeps a normal interface beside an identically framed changing interface. Carbon, bath and metal geometry remain fixed. Separate gas patches broaden into a hatched film while dissolved-alumina markers fade. A separate qualitative cell-voltage indicator rises; the current explanation explicitly distinguishes voltage from current. The contrast remains visible through shape and pattern, without depending on warning color. Mobile presents one labelled interface with the same three navigation choices.

The comparison uses enlarged scientific diagrams rather than the original wide model with a warning box. Its components are directly labelled. The existing component reference and individual-part inspector remain available, with hidden geometry marked “Not shown in this view.” The operating model remains in chapter 7; chapter 9 restores its metal-focused view after the comparison has returned to baseline. The provisional 3D amber warning and chapter-8 bubble markers were removed.

## Scientific scope

The chapter describes a **conventional full-cell anode effect** in carbon-anode Hall–Héroult electrolysis. It is not a complete model of local anode effects or emissions.

| Evidence | Locator | Adopted scope |
|---|---|---|
| [Stanic et al., 2022](https://link.springer.com/article/10.1007/s11663-022-02583-6) | Introduction; observations associated with Figs. 16–18 | Qualitative gas-film/contact behaviour. These experiments used laboratory rod-shaped graphite and industrial-carbon anodes. Their bath composition, geometry, voltages and timing are not adopted as Marc-400 operating values. |
| [IAI Aluminium Sector GHG Protocol](https://ghgprotocol.org/sites/default/files/2023-03/aluminium_1.pdf) | Appendix C, printed p. 62 | Insufficient dissolved alumina, voltage rise, PFC formation and the need for intervention. Historical voltage thresholds and corrective procedures are not reproduced. |
| [Tabereaux, ICSOBA 2016 AL16](https://icsoba.org/assets/files/publications/2016/AL16.pdf) | Abstract, PDF p. 1; local-anode-effect discussion | PFC emissions can occur without a conventional full-cell voltage spike. A normal voltage indicator does not establish zero PFC emissions. |

Sources accessed 19 September 2026. Claims and locators live in `src/data/claims.ts`; explanatory text and diagram labels live in `src/data/anodeEffect.ts`. `VISUAL_REGISTER.md` records the abstractions.

There are no invented volts, concentration thresholds, gas-volume readings, recovery times or production rates. Diagram dimensions, ring opacity, patch width and marker position are visual encodings. The ordinary CO₂ reaction and PFC formation are distinguished. The return is explicitly an editorial transition after intervention, not spontaneous recovery or an operating procedure.

## State and architecture

- `story/anodeEffect.ts` defines a pure phase/mix sampler and diagram geometry. Normal holds through 18% of chapter progress, onset finishes at 45%, the effect holds until 72%, and the return finishes at 92%. These percentages are authoring coordinates only.
- `story/states.ts` supplies `abnormalStateMix`. Both chapter endpoints are normal, so advancing to metal cannot leave a residual abnormal state. Reduced motion snaps to the appropriate normal/effect/return state.
- `ui/AnodeComparison.tsx` consumes the shared store. React subscribes to discrete phases/conditions; gas geometry, opacity and voltage position update imperatively. The existing development slider drives the same mix from 0 to 1.
- `styles/comparison.css` owns the comparison composition and responsive layouts. The diagrams do not depend on WebGL, and reading mode includes the complete comparison table, explanations and references.
- `__CELL_COMPARE__` exposes diagram state in development only and is removed when the comparison unmounts. No new library or Blender asset was required.

## Verification

Unit checks cover continuous/reversible sampling, normal endpoints, reduced-motion states, current/metal independence, and the changes in gas geometry and voltage marker position. Browser checks cover matched component geometry, reverse seeks, the development slider, direct navigation, return before metal, mobile reading mode and WebGL failure. Layout checks measure that the indicators remain below the diagrams on desktop, laptop and mobile.

Screenshots under `artifacts/milestone-5/` are reproducible with `node tools/review-comparison.mjs`. Visual review corrected a diagram/indicator overlap and checked normal, onset, effect and return, plus 1280×800 laptop and 390×844 mobile views. The full 3D asset and root modelling files remain unchanged.

Final verification on 19 September 2026:

- Lint, TypeScript and production build passed.
- **21 unit tests passed** across four test files.
- **28 browser tests passed** in Chromium and installed Edge, including the eight new comparison checks. An initial laptop layout check detected a 0.36 px figure/divider overlap; the final layout adds clearance and passes the full rerun.
- Production smoke passed with working navigation, component labels, one canvas and no page errors. A separate production comparison check exercised Anode effect → Return to normal and verified that `__CELL_COMPARE__` is absent.
- Asset hashes remain unchanged: cell `32BDBE7086EE950B9B02EF322ABDA5887F8D8F68815A5205C245F0D9E33C65E8`, section caps `BBF886C04D02A28310BCB3CD5FDD067E80E74608524958D6E5F7B026C22AA415`.

This is the milestone checkpoint; the story folder remains untracked in the shared repository. No release, publication or root-model edit was performed.

## Remaining work

M6 owns physical tapping, transfer and a sourced casting route; those ending chapters remain symbolic. M7 owns final pacing, typography and reader testing. M8 owns broader browser/device profiling, accessibility auditing and expert technical review. The earlier busbar topology and above-rim geometry limitations remain. The existing large Three.js vendor chunk warning remains for measured performance work.
