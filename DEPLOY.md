Vercel Deploy Guide for english-learning-app

This document explains how to deploy the `english-learning-app` to Vercel and recommended settings to ensure the PWA and offline features work correctly.

1) Push your changes

  git add .
  git commit -m "Prepare for Vercel deploy: PWA/runtimeCaching and IndexedDB changes"
  git push origin main

2) Create/import project on Vercel

  - Go to https://vercel.com and sign in.
  - Click "New Project" → "Import Git Repository" and select your repository.
  - When prompted, set the Framework Preset to "Next.js".

3) Build & Install commands

  - Install Command: pnpm install --frozen-lockfile
  - Build Command: pnpm build
  - Output Directory: (leave empty)

  Note: Vercel automatically sets NODE_ENV=production for builds.

4) Environment & Settings

  - No special environment variables are required by default. If you use any secrets, add them under "Settings -> Environment Variables".
  - Ensure the project uses the `pnpm-lock.yaml` present in the repo; Vercel will detect pnpm automatically.

5) PWA / Service Worker Notes

  - `next.config.js` is configured to disable the PWA during development and enable it in production (`disable: !isProd`). That avoids HMR/service worker interference during dev.
  - The `next-pwa` runtime caching rules were added to cache common assets and API responses. Monitor cache behavior in production and adjust `runtimeCaching` if you see stale content.
  - If you previously deployed versions created a Service Worker on the domain, users may have that SW active. To ensure clean updates:
    - Use `skipWaiting: true` and `clients.claim()` in your SW lifecycle to take control on update.
    - On the client side, provide a way (during dev/testing) to unregister old SWs. Our repo includes code that unregisters SWs in development mode.

6) Post-deploy checks

  - Open the production URL and confirm:
    - `manifest.json` is reachable at https://<your-domain>/manifest.json
    - `sw.js` is registered (in production) — check in Chrome DevTools -> Application -> Service Workers.
    - Installability: on iPhone, use Safari -> Share -> "Add to Home Screen". PWA install requires HTTPS (Vercel provides it).
  - Test offline behavior by going offline and reloading the app (after at least one successful online visit so the SW has cached assets).

7) Rollback / troubleshooting

  - If you see reload loops on iOS, ask affected users to remove the PWA from the Home Screen and re-add after you update the SW.
  - In case of unexpected stale content, consider bumping cache names or handling update notifications in the app.

8) Useful Vercel settings

  - Build & Development Settings: set "Install Command" and "Build Command" as above.
  - Caching: use default Vercel cache; adjust runtimeCaching in `next.config.js` for specific assets.

9) Local production test (optional)

  # build locally
  pnpm install
  pnpm build

  # run production server
  pnpm start

  Then access the PC's LAN IP from your iPhone (e.g. http://192.168.1.100:3000) to test, but note installability requires HTTPS; use Vercel for final PWA installation testing.

---

If you'd like, I can also create the git commit for you (run the provided PowerShell script) or generate a patch to apply to this repo's branch automatically.