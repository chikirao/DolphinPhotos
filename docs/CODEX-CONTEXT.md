# DolphinPhotos: context for continuing in Codex Cloud

Static clothing-drop album for dta / ni24lab. Keep the intentional iCloud Photos
appearance: header, Expires pill, gray placeholders, footer and existing controls.
No backend, database or runtime third-party API is needed.

## Current decisions

- Default composition is **mixtape**. Other edits remain available through
  `?layout=original`, `?layout=editorial`, `?layout=objects`.
- Square grid by default. Gutters are equal: 16px desktop, 2px mobile.
- 115 items, including six silent looping MP4s. Repeated takes have already been
  curated: do not restore deleted photos or import the whole shoot again.
- `src/photos/album.json` defines the canonical selection and metadata;
  `src/lib/album-variants.ts` defines compositions and emphasis.
- Canonical `#N` links refer to the same media in every composition.
- EXPIRES uses the visitor's local date, updates daily, falls back to NEVER.
- Media loads near the viewport and unmounts far away. Viewer preloads current,
  two ahead and one behind. Keep these performance behaviors.
- All UI primitives must use the installed **Fluid Functionalism Base UI**
  components. Animations use `src/lib/springs.ts` tokens. Keep the slider's local
  `hairline` prop. Reuse existing SVG assets instead of drawing replacements.

## Setup and verification

Use Node.js 24 and npm (the lockfile is committed):

```sh
npm ci
node --test scripts/*.test.ts
npm run build
npm run dev -- --host 0.0.0.0
```

Existing lint warnings in Fluid/vendor and older components are known. Run
`npm run lint` when relevant. No secrets are required to build this static site.

Prepared photos, posters, videos and soundtrack are committed. `newphotos/`,
original archives and local `AGENTS.md` are intentionally ignored and unavailable
in a Git checkout. Normal development does not require importing media again.
`scripts/import-media.mjs` needs local originals and FFmpeg only for new intake.

## Publication

Production: https://chikirao.github.io/DolphinPhotos/
Pushing main triggers `.github/workflows/deploy.yml`. Build changes in a branch
and review/merge when ready. Preserve the GitHub Pages base `/DolphinPhotos/`.
Cloudflare support is prepared, but hosting is currently GitHub Pages.
