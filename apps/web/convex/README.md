# MirrorWorks Convex (demo deployment)

Backend for the front-end demo. Currently ships **one** action — `aps.viewerToken` — which mints a short-lived Autodesk Platform Services token so `<MirrorViewer>` can load pre-translated CAD URNs in the browser.

Everything else in `aps.ts` (upload, status, pollManifest, archiveToR2) is **designed-for, not built** — see `/plan/how-can-i-implement-happy-zebra.md`. Sharjeel will activate them at go-live by adding R2 + WorkOS env vars and pointing `VITE_CONVEX_URL` at the production deployment.

## First-time setup

```sh
cd apps/web
npx convex dev          # follow prompts; creates a demo deployment
```

After init, set the APS secrets in the demo Convex dashboard (Settings → Environment Variables):

| Variable | Where to get it | Required for |
| --- | --- | --- |
| `APS_CLIENT_ID` | https://aps.autodesk.com → your app | `viewerToken` |
| `APS_CLIENT_SECRET` | https://aps.autodesk.com → your app | `viewerToken` |
| `APS_BUCKET_KEY` | any lowercase string, e.g. `mirrorworks-demo` | go-live (`upload`) |
| `R2_ACCOUNT_ID` | Cloudflare R2 | go-live (`archiveToR2`) |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 | go-live (`archiveToR2`) |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 | go-live (`archiveToR2`) |
| `R2_BUCKET` | Cloudflare R2 | go-live (`archiveToR2`) |

When you register the APS app, pick **Server-to-Server** (2-legged). **No callback URL is needed** — the demo uses the `client_credentials` grant.

After `npx convex dev` prints the deployment URL, copy it into `apps/web/.env.local`:

```
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud
```

## Demo fallback (no APS keys yet)

If `APS_CLIENT_ID` / `APS_CLIENT_SECRET` are missing, `viewerToken` returns `{ token: null, reason: 'demo' }` and the `<MirrorViewer>` component falls back to its bundled GLB demo fixtures. This means the front-end demo runs end-to-end without any Autodesk credentials — useful for sales screen-shares while you're waiting on Autodesk to approve your app.

## Go-live checklist

1. `npx convex deploy --prod` against the real Convex project.
2. Set `APS_*`, `R2_*`, and `WORKOS_*` env vars in the prod dashboard.
3. Point `VITE_CONVEX_URL` at the prod deployment.
4. Add WorkOS gating to `aps.upload`, `aps.pollManifest`, `aps.archiveToR2` (see TODO blocks in `aps.ts`).
