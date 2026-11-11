# Tool audit and design update

All 50 registered tools passed a functional Chromium audit. The browser suite exercises real inputs and checks outputs, rather than treating a rendered page as a pass. Desktop tests include a 390px mobile-width overflow check for every populated workspace. Homepage and upload workspace screenshots were also inspected in light and dark themes.

## Verified workflows

- 10 image tools: actual image uploads, exported dimensions, resizing, square crop, rotation, conversion, Base64 round-trip, raw JPEG download extension, color sampling, metadata.
- 8 PDF tools: four-page merge, one-file-per-page split ZIP, compression output, rotation, reordered page dimensions, extraction, PDF rendering ZIP, images to PDF. Changing resolution and rendering again produces the expected pixel dimensions.
- 8 text tools: word count, case conversion, duplicate removal, reversal, sorting, diff, lorem word count, slug generation.
- 10 developer tools: JSON formatting/validation/minification, Unicode Base64 round-trip, UUID structure and uniqueness, SHA-256 known value, JWT payload, regex matching/error handling, URL encoding.
- 7 generators: PNG QR export, SVG barcode export, password character sets, constrained random numbers, palettes, live CSS gradient and shadow output.
- 7 file/media tools: ZIP creation and extraction, file SHA-256, WAV trimming, WebM trimming, animated GIF export, PNG frame capture. ffprobe additionally confirmed valid WAV PCM audio, WebM VP9 video plus Opus audio, and GIF duration/dimensions.

All 21 unit tests, TypeScript checking and the production build passed. Existing repository-wide formatting debt remains outside this change.

## Fixes

- Raw image Base64 now detects the actual image format; JPEG bytes no longer download with a PNG filename. Non-image data URLs and invalid image input show an error.
- PDF-to-images offers an explicit re-render action after changing resolution, with resolution selection disabled while processing.
- Uploads with generic application/octet-stream metadata can use a supported filename extension; each processor still decodes and validates its contents.

## Design

Applied the supplied visual-design guide's Bento Box direction: rounded modular cards, subtle shadows, restrained violet accents, stronger heading hierarchy and more whitespace. Shared tool workspaces and upload controls have consistent framing and clear file-selection actions. Both themes and reduced-motion support remain available.

The three Markdown attachments informed this work. The supplied ZIP could not be inspected because it exceeds the attachment transfer tool's 32 MiB limit.

## Reproduce

Requires Node, installed application dependencies, Chromium, ffmpeg, and Playwright. Playwright can be installed outside the checkout; point PLAYWRIGHT_MODULE at its index.mjs. Start the app with `npm run dev -- --host 0.0.0.0 --port 3000`.

```sh
PLAYWRIGHT_MODULE=/workspace/.browser-tools/node_modules/playwright/index.mjs node scripts/audit-tools.mjs
PLAYWRIGHT_MODULE=/workspace/.browser-tools/node_modules/playwright/index.mjs node scripts/audit-invalid-files.mjs
npm test
node_modules/.bin/tsc --noEmit
npm run build
```

The main audit creates its fixtures with canvas, pdf-lib, JSZip and ffmpeg. AUDIT_URL, AUDIT_DIR and CHROMIUM_PATH override defaults. Results and downloaded artifacts default to /tmp/dovzo-audit. The invalid-file suite exercises corrupt image, PDF, ZIP, audio and video inputs plus clipboard output.

## Scope limits

Passing these checks establishes the tested workflows in Chromium, not every possible file or browser. Safari/iOS, Firefox, large-file stress tests and device-specific codecs were not verified. Password-protected PDFs and encrypted ZIPs are not supported. PDF compression may not reduce image-heavy PDFs; image metadata displays basic properties rather than camera EXIF. Video trimming records in real time as WebM, audio exports as WAV, and GIF clips retain the 15-second limit. The website was not deployed by this task.
