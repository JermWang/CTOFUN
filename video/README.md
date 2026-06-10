# CTO.fun — onboarding video (Remotion)

An on-brand motion-graphics explainer of how the platform works, built with the
real CTO.fun palette (`src/theme.ts`, mirrored from `globals.css`) and the real
logos (`public/`). Self-contained: it has its own `node_modules`, so it never
touches the Next.js app.

## One-time setup (per machine / fresh clone)

```bash
cd video
npm install        # installs Remotion here once; lives in video/node_modules
```

This is the only "install" — Remotion is a per-project dependency (it bundles
its own Chromium + ffmpeg to render), so it can't be installed globally and
reused. Once it's here, you never scaffold it again.

## Preview / edit live

```bash
npm run dev        # opens Remotion Studio — scrub, tweak, hot-reload
```

## Render the final video

```bash
npm run render     # -> video/out/cto-fun-onboarding.mp4  (1920x1080, 30fps)
npm run still      # -> video/out/frame.png  (single frame, fast sanity check)
```

To use the result on the site, drop the mp4 into the app's `public/` and embed it.

## Structure

- `src/theme.ts` — brand colors + Geist / Geist Mono fonts.
- `src/components.tsx` — background, pipeline footer, soft cards, entrance spring.
- `src/scenes.tsx` — the seven scenes (intro → problem → discover → apply →
  fund → deliver → proof/CTA).
- `src/Root.tsx` — sequences the scenes into the `CtoFunOnboarding` composition.

Edit copy/colors/timing in those files; the studio hot-reloads as you save.
