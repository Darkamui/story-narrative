# Repository review — September 27, 2026

## Scope

Reviewed the application entry points, narrative/state modules, rendering and asset lifecycle, UI, translation catalogs, styles, source/asset metadata, tests, build configuration, asset tools, and existing documentation. Generated browser profiles, dependency source, and historical screenshots were treated as output rather than application source. The delivered GLBs are covered by the existing inventory and model contract tests.

The supplied workspace has no `.git` directory. No commit or Git diff is available. Source assets and historical output were preserved.

## Findings addressed

| Area | Finding | Change |
| --- | --- | --- |
| App structure | The entry point and global directories represented only aluminum. | Added a library at `/`, a catalog, an aluminum route, and a dedicated feature folder. |
| Loading | Site-wide imports would make browsing future stories load aluminum copy and styles. | Lazy story entry point, separate story translations/styles, lightweight shared language preference. The library uses an 81 KB still from the actual model. |
| Metadata | Language changes always set the aluminum title and description. | Metadata is owned by the active page; language and preference storage are shared. |
| Navigation | No path back to a wider collection existed. | Added a translated library link, native page navigation, unknown-route recovery, and redirects for original chapter links. |
| History restoration | A lazy story briefly has insufficient page height for native scroll restoration; page-exit persistence was insufficient. | Persist explicit chapter/action seeks immediately and native scroll while in use; verify refresh and back/forward restoration. |
| Asset cleanup | Successful sibling parses and late cancelled parses could escape disposal. Source resources were also omitted from adapter cleanup. | Added shared asset loading/cleanup, deduplicated disposal, and cancellation/partial-failure tests. |
| Module failures | A stalled story import could leave visitors waiting indefinitely. | Bound route loading to 15 seconds with retry and library navigation. |
| Tooling | Asset inspectors read missing `../../out/` files; the ending builder and Lighthouse referenced one machine's paths. | Inspect delivered assets, resolve Blender paths from the script, discover Chromium or honor `CHROME_PATH`. |
| Browser review | Every browser tool and test assumed `/` was the aluminum story. | Updated tools and regressions to the story route; added library/navigation coverage and configurable test port. |
| Dead source | `Callouts.tsx` and `ExplosionController.tsx` were unreferenced primitive-era renderers. | Removed both. The small primitive data remains as an explicitly documented regression fixture. |
| Generated files | ESLint did not explicitly ignore historical artifacts; builds emitted root TypeScript build state. | Ignore artifacts in ESLint and use a no-emit type check in the build script. |
| Fonts | Font paths assumed deployment at the domain root. | Load the local stylesheet through Vite's base URL and use relative font paths. Font licenses remain intact. |
| Documentation | The README described a single story and an obsolete absolute checkout path. | New site README and contribution rules; aluminum details retained in `docs/ALUMINUM.md`. |

## Decisions

- Keep the current React/TypeScript/Vite stack and existing dependencies. No routing library is needed for the current document navigation.
- Keep the aluminum choreography, scientific copy, semantic model mapping, and proven regression tests. Moving them under a feature folder does not require rewriting the renderer.
- Publish only the available story. No speculative second story, empty cards, or graphics-card implementation was added.
- Retain historical reports and editable assets. Old paths in milestone reports describe the layout at the time; current paths are documented in the root README.

## Remaining limits

- The Three.js/R3F chunk remains about 988 KB minified (265 KB gzip). It is requested only when opening aluminum. Further renderer optimization should follow profiling on target devices.
- The original model provenance references `spec.py` and `docs/DESIGN_HISTORY.md` from the original project. Those files were not supplied in this workspace. This change does not re-verify industrial claims or manufacture replacement source evidence.
- Static hosting needs an application-route fallback to `index.html`. The client unknown-route page cannot itself set the HTTP status.
- Existing browser tests and device emulation do not establish technical-expert approval, reader comprehension/pacing, or physical Safari/iOS/Android behavior.

## Verification

Baseline: lint, typecheck, 30 unit tests, and production build passed before restructuring.

The production library entry contains about 12.3 KB of site JavaScript (4.8 KB gzip), plus the shared React chunk (189.6 KB / 59.6 KB gzip). The aluminum narrative, story CSS, GSAP, renderer, and GLBs load only after entering its route. Production network checks confirm this separation.

Visual review covered the landing page at 1440 px and 390 px widths. Browser checks also cover the French header and navigation at 320 px. The story cover is a reproducible capture of the actual model, with its DOM overlays hidden.

| Check | Result |
| --- | --- |
| ESLint, TypeScript, production build | Passed. Existing lazy Three.js chunk-size warning remains. |
| Unit, asset, state, translation, routing and loader tests | 37 passed across 11 files. |
| Chromium browser scenarios | All 34 scenarios passed across the full run and focused follow-up runs. |
| Library scenarios in Edge, Firefox and WebKit | 18 passed. The strengthened back/forward test also passed again in all three engines after the final restoration adjustment. |
| Accessibility | No axe violations in the tested English desktop and French 320 px library views in all four engines. |
| Production smoke | Passed: no story renderer/model downloads on the library, working story entry, chapter controls, refresh, return link, no page errors or development globals. |
| Asset tools | Delivered GLB inventory and runtime inspection completed. Blender regeneration was not run; authored assets were retained. |

One guided-animation test exceeded its 12-second assertion timeout while separate browser suites ran concurrently. Its complete interaction suite passed when rerun in isolation, without relaxing assertions or increasing timeouts. For reliable rendering checks, run browser suites serially on this machine.
