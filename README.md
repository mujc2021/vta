# VTA — Visual Thought Action Model

Project website for **Scaling Video Foundation Models Enables Generalizable Robot Behavior**.

**Website:** https://mujc2021.github.io/vta/

The page presents instruction-following demonstrations, multimodal in-context learning, benchmark results, the VTA architecture, video-reward learning, and synthetic robot data.

## Local preview

Use Node.js 20 or newer. No packages need to be installed.

```sh
npm start
```

Open http://127.0.0.1:4173/. Set `PORT=4174 npm start` to use a different port.

## Edit

- `index.html`: section structure and research narrative.
- `styles.css`: typography, colors, layouts, and responsive styling.
- `data.js`: demonstration descriptions, benchmark values, and paper/code release links.
- `app.js`: video playback, interactive charts, tabs, and media viewers.
- `assets/`: website images, videos, icons, and fonts.

Paper and model-code links can be added to `VTA_RESOURCES` in `data.js` when they are released.

## Check and publish

```sh
npm run check
git add <changed-files>
git commit -m "Update project website"
git push origin main
```

GitHub Pages publishes the root of `main` automatically. `.nojekyll` serves the existing static files directly. All asset paths are relative so the page works under `/vta/`.

For other static hosts, `npm run build` prepares `dist/`.

Font licenses are included in `assets/fonts/`.
