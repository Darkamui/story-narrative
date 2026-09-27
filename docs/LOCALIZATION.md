# English and French

The masthead’s EN / FR buttons switch language immediately. English is the default; `inside-cell-language` in localStorage remembers a deliberate choice. If browser storage is unavailable, switching still works for the session. The document language, title and description follow the selection. The buttons use native language names and `aria-pressed` so their purpose and state remain accessible in either language.

Language is independent of the story controller. It does not change chapter IDs, lengths, scroll position, equipment selection, model node names, chemistry, references or preferences, and does not remount the canvas. Imperative anatomy captions, comparison labels and projected component statuses also update while scrolling is idle.

## Editing translations

English aluminum source text lives in `src/stories/aluminum/data/` and the story's UI components. `src/stories/aluminum/i18n/` contains French catalogs keyed by that exact English text:

- `frStory.ts`: all twelve chapters, six mechanisms, four comparison phases and seven ending stages.
- `frParts.ts`: assembly descriptions, inner layers, equipment notes and complete semantic names for every selectable GLB part family.
- `frUi.ts`: controls, diagrams, statuses, accessible descriptions, source-link descriptions and metadata.
- `locale.ts`: story translation and interpolation functions. The language store lives in shared `src/i18n/locale.ts`; site copy lives in `src/app/siteCopy.ts` and catalog copy in `src/app/stories.ts`.

Render user-facing messages through `useTranslation().t(...)`. Interpolated sentences use named placeholders, such as `t('Identify {part}', { part: t(name) })`. Translate labels rather than IDs, URLs, CSS selectors, formulas or source object names. Source links retain their destinations; their descriptive labels are translated. Do not translate an already assembled dynamic sentence as a single lookup key.

French terminology distinguishes alumine (Al₂O₃), aluminium, bain électrolytique, effet d’anode, soutirage and coulée. The vacuum crucible is called a poche de soutirage. The underlying technical qualifications and source addresses are preserved.

## Checks

`npm test` checks catalog coverage against live narrative data, literal translation calls, interpolation fields and mesh part names in the delivered GLB. Missing French copy must be added when English source text changes.

`npx playwright test tests/localization.spec.ts` checks switching and persistence, state retention, all chapter and mechanism text, reading mode, small screens, unavailable WebGL and disabled storage in the four configured engines. `node tools/review-localization.mjs` captures desktop/mobile French scenes, checks SVG label bounds and runs accessibility audits; output lives in ignored `artifacts/localization/`.

No-JavaScript fallback copy is supplied in both languages because its toggle cannot execute. Technical source documents, repository documentation and diagnostic identifiers retain their original languages.

Verified on 20 September 2026: lint, typecheck and production build passed; 28 unit/asset/catalog tests, 16 localization browser tests, 10 English story regression tests in Chromium and four production browser smoke checks passed. French screenshots were reviewed at 1280 × 800 and 390 × 844, with the header additionally checked at 320 px. All 24 diagram-bound samples and 10 desktop/mobile axe audit states passed. The existing Three.js chunk-size warning remains.
