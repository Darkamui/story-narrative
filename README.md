# Story Narrative

A collection of interactive stories about how things work. The landing page introduces the collection; each story has its own route, content, and visual experience.

The first story, **Inside the Cell**, follows alumina through an aluminum electrolysis cell to cast metal. Its twelve chapters include exploded anatomy, process diagrams, guided actions, a complete reading view, and English/French translations.

**One Frame**, the second story, opens an original AXIOM 320 graphics card. Nine guided views reveal its layers, processor, memory, power circuits, thermal contact, heatpipes, fans, and display sockets. Each view pairs a focused 3D camera with one concrete explanation and one next action. Optional inspection controls, English/French, reduced motion, and a complete illustrated reading view remain available.

## Run

Requires Node 22.12 or newer.

```sh
npm ci
npm run dev -- --port 5186
```

- Library: http://127.0.0.1:5186/
- Aluminum story: http://127.0.0.1:5186/stories/aluminum
- Graphics card story: http://127.0.0.1:5186/stories/graphics-card
- Graphics card close-up: http://127.0.0.1:5186/stories/graphics-card#compute
- Chapter link: http://127.0.0.1:5186/stories/aluminum#anatomy
- Development controls: `/stories/aluminum?debug`

Existing root chapter links such as `/#anatomy` redirect to the aluminum route. The header's **All stories** link returns to the library. Language preferences carry across both pages.

## Structure

```text
src/
  app/                     Routes, catalog, landing page, site copy, metadata
  i18n/                    Shared language preference
  ui/                      Shared language control
  hooks/                   Shared browser hooks
  styles/                  Shared baseline and landing page styles
  stories/
    aluminum/
      app/                 Story page and lazy 3D canvas
      data/                Narrative, source references, shots, component mappings
      i18n/                Aluminum translations
      story/               Deterministic state, scroll controller, guided actions
      three/               Model loading, rendering, effects
      ui/                  Story controls and diagrams
      styles/              Story-specific styles
    graphics-card/         Guided teardown, content, state, renderer, styles
public/
  assets/                  Existing aluminum GLBs
  images/                  Lightweight story cover images
  fonts/                   Local fonts and licenses
assets/                    Editable Blender source
tests/                     Browser regression tests
tools/                     Asset builders, inspection and browser review tools
docs/                      Architecture, review findings, historical milestone reports
```

`src/app/stories.ts` is the catalog: localized summaries, cover images, URLs, and lazy entry points. Adding a story means adding its feature folder and a catalog entry. The library renders all catalog entries; it does not import a story's renderer, translation catalog, or model until that story opens. Aluminum and graphics card stories are published.

Navigation between stories and the library uses normal document links. This preserves native browser history and releases each page's renderer, listeners, and module state. The aluminum scroll controller owns chapter navigation within its page.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:browser -- --project=chromium
```

`npm run test:browser` also runs Edge, Firefox, and WebKit. Edge must be installed on the machine. Set `PLAYWRIGHT_PORT` to use another development port (PowerShell: `$env:PLAYWRIGHT_PORT='5190'`). Tests run against a local development server; CI starts a fresh server. Screenshots and traces go to ignored `test-results/`.

```sh
npm run preview -- --port 4186
node tools/production-smoke.mjs
```

Browser emulation does not replace physical device, expert content, or real-reader acceptance testing.

## Deployment

Publish `dist/` after `npm run build`. Configure the host to serve `index.html` for application paths, including `/stories/aluminum` and `/stories/graphics-card`, while serving static assets normally. Vite dev and preview already provide this fallback. Unknown application paths show a page with a link to the library; an HTTP 404 status requires host-side routing.

The site uses client rendering. JavaScript is required for both the interactive and reading views. Page titles and descriptions update per route and language.

## Assets and maintenance

- `node tools/inventory-glb.mjs`: inspect the three delivered GLBs.
- `node tools/build-graphics-card.mjs`: rebuild the batched, Meshopt-compressed graphics card from the preserved delivery. See [Graphics card](docs/GRAPHICS_CARD.md) for provenance and controls.
- `node tools/inspect-runtime-asset.mjs`: update the runtime inventory from `public/assets/cell.glb`.
- `node tools/capture-story-cover.mjs`: capture the actual exploded model as the library cover. Defaults to port 5186; set `STORY_URL` for another development server.
- `tools/build-section.py` and `tools/build-ending.py`: Blender asset builders; paths resolve from the workspace. See the aluminum documentation before regenerating authored assets.
- `tools/lighthouse-release.mjs`: review the production aluminum route using Playwright's Chromium, or `CHROME_PATH` when provided.
- `artifacts/`, `dist/`, `test-results/`, and `node_modules/` are generated output and excluded from source checks/version control. Historical artifacts and editable source assets are retained.

## Further reading

- [Repository review and verification](docs/REPOSITORY_REVIEW.md)
- [Aluminum architecture and limitations](docs/ALUMINUM.md)
- [Interaction controls](docs/INTERACTION_CONTROLS.md)
- [Aluminum localization](docs/LOCALIZATION.md)
- [Graphics card architecture and assets](docs/GRAPHICS_CARD.md)

The original `INSIDE_THE_CELL_CODEX_HANDOFF.md`, `AGENTS_INSIDE_THE_CELL.md`, and milestone reports describe the aluminum experience's development history. Their old flat `src/` paths now live under `src/stories/aluminum/`.
