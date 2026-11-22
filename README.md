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

Tap/click in the play area, press Space, or press ↑ to jump. After rescuing five birds, hold for about a third of a second to begin charging, then release for a stronger jump. A full charge takes about 1.7 seconds total; Leslie pauses safely on the ledge while the charge builds. Leslie runs right automatically. Use the pause button or Escape to pause. Use the Settings panel on the title screen to tune sound; the game also honors the operating system’s reduced-motion preference.

## Project structure

- `src/game/levels`: data-driven level definitions for The Shore, The Cliffs, and The Sanctuary.
- `src/game/scenes`: Phaser gameplay, pause, and completion scenes.
- `src/game/systems`: local progress and synthesized sound effects.
- `src/game/characters/LeslieView.ts`: Phaser artwork and effects, driven by the pose timing in `LeslieAnimation.ts`.
- `public/icons`: Leslie’s original favicon and install icons.

Level 1 is a longer diagonal climb across eleven varied-length ledges with balanced gaps and no spikes. The Cliffs and The Sanctuary are fully playable follow-up chapters, with spikes, solid spike-bearing ledges at least 440 px long and 96 px clear on both sides, separate crumbling ledges, checkpoints, and power-ups. Swim recovery only chooses dry stable platforms and places Leslie’s feet at the platform surface. Rescued birds carry across chapters and saved games. Leslie’s original artwork is bundled in `public/sprites/leslie.png`. The sheet pairs hand-posed body drawings with swappable heads, so Leslie can react to a rescue through a jump or landing. To regenerate the indexed PNG, head attachment coordinates, and icons, run `node scripts/draw-leslie.mjs` with `rsvg-convert` and `vips` installed. Scenery is drawn in Phaser and sound is synthesized locally.

Run `npm test` for 120 Hz, circle-body jump and hazard simulations, spike-clearance, stable-platform recovery, tide visibility, charge timing, animation, and save migration checks.

## Offline and save data

The versioned `leslies-escape-save-v1` LocalStorage record stores rescued bird IDs, active checkpoint, tide height, and power-up state. Clearing browser site data removes the save. The service worker precaches the production app shell and generated assets; offline support requires one successful online production visit first.
