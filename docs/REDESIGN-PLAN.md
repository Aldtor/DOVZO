# DOVZO discovery and workspace redesign

## Goal
Make the 50-tool collection easier to discover and use, with a coherent premium visual system. Preserve client-side processing, lazy-loaded engines, accessible controls, both themes, and the existing tool routes.

## Sources and evidence
- README.md explains how to use the uploaded visual vocabulary.
- SKILL.md supplies the art-direction workflow: turn aesthetic terms into concrete layout, type, color, spacing and interaction decisions.
- style-catalog.md: Bento Box (28) is the primary direction for modular discovery; Utilitarian (38) is the secondary influence for clear task controls. Do not mix all 50 aesthetics.
- iLoveZIP_Create (1).zip remains unavailable: attachment transfer exceeds 32 MiB, and no alternate attachment-reading tool is available.
- Planned competitor sample: https://www.ilovepdf.com/, https://smallpdf.com/, https://www.iloveimg.com/, https://tinywow.com/. These are established category examples, not a verified traffic ranking. All four live requests were denied by the environment proxy. Saving allowed-domain additions failed with INVALID_ARGUMENT. No claims about their current layouts are based on direct observation.

## Competitive review protocol (pending access)
For each site, inspect desktop/mobile homepage, catalog, and a representative upload workspace. Record category discoverability, search, number of steps to process a file, action placement, error recovery, navigation density, advertising, privacy disclosures, and keyboard behavior. Capture dated screenshots and distinguish observed patterns from recommendations. Adapt useful patterns to DOVZO's local-processing model without copying branding, text, or proprietary assets.

## Implementation sequence
1. Shared visual system: neutral page surface, violet accent, consistent 16px cards, restrained shadows, clear heading rhythm, strong focus states and reduced-motion support.
2. Homepage: concise split hero, search opening the existing keyboard-accessible dialog, direct task links, six-category navigation, eight popular tools, three-step local-processing explanation, concise FAQ and final directory link. Remove duplicate recent/audience/benefit grids.
3. Directory: desktop category sidebar, mobile horizontal categories, sticky search/sort/view controls, result count, favorites, accessible empty state. Preserve all filters and both views.
4. Tool detail: shared toolbar naming the workspace and linking back to its category, accurate task guidance by tool type, supporting format information, compact related-tool area. Avoid fake progress or mock results.
5. Components: category-tagged cards with consistent action affordances, compact main navigation and clear directory entry point, editorial page headers and cohesive footer.
6. Verification: unit tests, TypeScript, build, 50 functional tool cases, 390px populated-workspace overflow checks, homepage/catalog at 390/768/1440px, search keyboard flow, favorites persistence, category filters, mobile menu and light/dark screenshots.

## Acceptance criteria
All 50 tools remain reachable and pass the existing real-input audit. Search opens a real tool. Filters and sorting update results; favorites survive reload. No horizontal page overflow at tested sizes. Dialog/menu keyboard dismissal works. Light/dark text and controls remain readable. No fake social proof, reviews, usage metrics, unsupported formats, or backend integration claims.

## Delivery boundaries
This implementation can proceed with the accessible design attachments. Live competitor research and ZIP inspection remain explicitly incomplete until their access blockers are resolved. Do not describe the redesign as incorporating inaccessible archive assets or a completed competitor review. Publishing is separate from local implementation and validation.

## Implementation results

Implemented the homepage, category tiles, shared tool cards, directory sidebar/mobile category controls, result counts, workspace toolbar, task-sensitive guidance, simplified navigation and updated footer. Search uses the existing keyboard-accessible dialog. Image-to-Base64 guidance correctly directs users to copy rather than download.

Validation completed:
- 50/50 real-input tool cases passed after the layout changes, including file downloads and mobile workspace width checks.
- 21/21 unit tests passed; TypeScript passed; production build passed.
- Discovery browser checks passed: keyboard search to PDF Merger, category counts, persistent favorites after reload, empty-state recovery, list view, sorting, mobile-menu Escape dismissal, and persistent dark mode.
- Homepage, directory and PDF workspace fit at 390, 768 and 1440px. Desktop homepage/directory and mobile homepage screenshots were visually inspected.
- Changed TSX files have no ESLint errors; the existing PageHeader Fast Refresh warning remains.

Reproduce discovery validation with `PLAYWRIGHT_MODULE=/workspace/.browser-tools/node_modules/playwright/index.mjs node scripts/audit-discovery.mjs`. Screenshots are written to `/tmp/dovzo-design`.

Competitor review and ZIP inspection remain blocked as described above. This is an implemented attachment-informed redesign, not a completed live competitor study.
