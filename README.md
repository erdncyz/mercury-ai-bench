# Mercury AI Bench

Premium AI model benchmark site powered by [Artificial Analysis](https://artificialanalysis.ai/) live data. Rank models by coding, intelligence, math, speed, or price-performance — with request cost estimates.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Netlify Functions (API key proxy + daily snapshot in Netlify Blobs)
- EN / TR i18n (default EN)

## Local development

```bash
cp .env.example .env
# set ARTIFICIAL_ANALYSIS_API_KEY in .env

npm install
npm run dev
```

Open http://localhost:5173 — `/api/models` is served by the Vite middleware during local dev.

Optional full Netlify emulation:

```bash
npm run netlify:dev
```

## Netlify deploy

1. Connect this repo to Netlify (or drag-drop `dist` after build).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Site settings → Environment variables:
   - `ARTIFICIAL_ANALYSIS_API_KEY` = your Artificial Analysis API key
5. Deploy.

`netlify.toml` already configures redirects so `/api/models` hits the function and SPA routes fall back to `index.html`.

### Model data cache (once a day)

The Artificial Analysis free tier allows 100 requests / 24h (a full refresh needs ~6–12), so model data is fetched at most once a day and everything else reads the cached snapshot:

- **Production:** the scheduled function `models-refresh` runs daily at 04:00 UTC (07:00 TR) and stores the snapshot in Netlify Blobs; `/api/models` only serves that snapshot. If a scheduled run is missed and the snapshot is over 24h old, the first request refreshes it once. A 429 sets a cooldown until the quota resets.
- **Local dev:** the snapshot is saved to `.cache/mercury/aa-models.json` (git-ignored, survives `npm install`) with the same 24h rule.
- **Build:** `npm run build` refreshes the bundled fallback only when it is older than 20h, reuses a fresh dev snapshot instead of calling the API, and skips during a cooldown. Force it with `REFRESH_FALLBACK=force npm run build`.

## Attribution

Model scores, pricing, and latency metrics are provided by Artificial Analysis and must be credited. The footer links to https://artificialanalysis.ai/.

The **Prompts** page (`/prompts`) pulls live, CC0-licensed prompts from the public [prompts.chat](https://prompts.chat) API through the keyless `/api/prompts` proxy (10 min cache). Role-based sections (architect, backend, DevOps, marketing…) are defined in `shared/prompts.ts`. The **Architecture** group (AutoCAD & automation, 2D → 3D visualization, BIM/Revit, concept, codes & site, presentation, interior, landscape) filters one shared pool of drawing-related prompts.chat searches per topic and pins Mercury-authored templates from `shared/architect/`. The **Photo editing** group (All edits, Cinematic, Black & white, Film & vintage, Light & atmosphere, Retouch & restore) works the same way: Mercury photo-editing templates from `shared/imageEditPrompts.ts` are pinned above relevance-filtered live matches (video prompts excluded). With `lang=tr`, titles and descriptions are machine-translated via a keyless Google Translate endpoint (prompt text stays English) and Turkish searches are translated to English before querying.
