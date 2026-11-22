# Leslie’s Escape

A peaceful, one-touch platform adventure built with Phaser 3, TypeScript, and Vite. Leslie auto-runs across the Shore, wakes sleeping birds, and stays ahead of a gently rising sea. Progress is stored locally; after the first successful load, the PWA caches the app shell for offline play.

## Run locally

```sh
npm install
npm run dev
```

## Build and preview

```sh
npm run build
npm run preview
```

Serve the production build over HTTPS for installation. The Vite PWA plugin generates the manifest and Workbox service worker at build time. On first launch, wait for the “Offline-ready” status before testing with the network disabled.

The GitHub Actions workflow publishes to GitHub Pages at `https://jwsy.github.io/leslies-escape/`. It sets the Vite base path for the project site, so the app shell, icons, and service worker stay within the Pages path.

## Controls

Tap/click in the play area, press Space, or press ↑ to jump. Leslie runs right automatically. Use the pause button or Escape to pause. Use the Settings panel on the title screen to tune sound; the game also honors the operating system’s reduced-motion preference.

## Project structure

- `src/game/levels`: data-driven level definitions for The Shore, The Cliffs, and The Sanctuary.
- `src/game/scenes`: Phaser gameplay, pause, and completion scenes.
- `src/game/systems`: local progress and synthesized sound effects.
- `public/icons`: original SVG app icon.

Level 1 is a longer diagonal climb across eleven wider-spaced ledges, with the spike hazards removed. Missing a jump starts a gentle swim back to a dry ledge, followed by a climb-out and automatic run. Levels 2 and 3 currently provide data scaffolds. Artwork is drawn procedurally with Phaser shapes, and sound is synthesized locally; there are no runtime API calls or external assets required by the game.

## Offline and save data

The versioned `leslies-escape-save-v1` LocalStorage record stores rescued bird IDs, active checkpoint, tide height, and power-up state. Clearing browser site data removes the save. The service worker precaches the production app shell and generated assets; offline support requires one successful online production visit first.
