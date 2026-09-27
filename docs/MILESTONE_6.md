# Milestone 6 — tapping and casting

Implemented 20 September 2026 under the owner's instruction to continue through all remaining milestones.

The ending now uses a 74,956-byte Blender-authored GLB with 44 named nodes. `tools/build-ending.py` creates an isolated scene through Blender MCP and preserves the existing scene. `assets/ending.blend` retains the equipment source. The original reduction-cell model is unchanged.

Three tapping stages identify the metal pad, explain vacuum transfer into a lined crucible, then explicitly change location to the cast house. Four casting stages cover melt preparation, open-mould filling, air cooling and solid-ingot resolution. Equipment proportions, fill timing and final ingot isolation are identified as illustrative. No plant transport route, alloy specification, operating settings or demoulding mechanism is invented.

`data/ending.ts` owns stage copy, authored shots, source links and semantic part families. `story/ending.ts` samples every effect from chapter progress. `EndingScene` preloads at the metal chapter, renders both studies, projects numbered component anchors, highlights selected equipment and provides a bounded load/retry path. `EndingExperience` keeps stage navigation and component explanations available without WebGL. Reading mode includes all seven stages and equipment definitions.

Sources: Fives ECL / ICSOBA 2016 AL13 for vacuum tapping; Hydro for cast-house transfer; Pyrotek for product-dependent melt treatment; ALTEK for holding-furnace ingot-caster supply; Hertwich for the selected air-cooled open-mould route. Exact URLs and claim limits are in `sources.ts` and `claims.ts`.

Browser verification: 34 checks passed across Chromium and installed Edge, including forward/reverse state equality, all process stages, retry after HTTP 503, mobile reduced motion and the reading fallback. Screenshots of all seven ending stages were reviewed at 1440×1000, 1280×800 and 390×844. This review corrected a lingering original metal pad and the initially unclosed sectional liquid volume. `artifacts/milestone-6/` contains the local captures.

Next: M7 typography, interaction and responsive polish; M8 broader browser, accessibility and performance verification. These proceed without another approval pause.
