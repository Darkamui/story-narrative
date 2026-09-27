# Story Narrative

This app is a library of independent interactive stories. The site shell and catalog live in `src/app`; aluminum is one feature under `src/stories/aluminum`.

- Keep story renderers, large content catalogs, and assets out of the landing page's initial bundle.
- Register published stories in `src/app/stories.ts`; keep each story's implementation inside its feature folder.
- Keep shared code small and promote components only when there is a concrete shared use.
- Preserve deterministic forward/reverse story state, reading fallbacks, reduced motion, source references, and both languages.
- Use normal document links between stories and the library. Chapter navigation remains owned by each story.
- Run lint, typecheck, unit tests, production build, and relevant browser tests after substantive changes.
- Inspect major visual changes at desktop and mobile sizes.
- Preserve authored Blender files, delivered GLBs, font licenses, and historical reports.
- The original aluminum handoff and `AGENTS_INSIDE_THE_CELL.md` apply to that story's visual/content requirements. Their single-story app goal and old file paths are superseded by this structure.
