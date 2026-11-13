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
- **Public benchmarks:** `benchmarks-refresh` checks the supplemental sources, including PresentBench, daily at 04:10 UTC (07:10 Türkiye) and saves the results in Netlify Blobs. The API also refreshes snapshots older than 24h on demand, retrying failed sources after an hour. A failed source retains its last successful data and original timestamp with a stale status. Published evaluation dates can be older than the latest fetch; fetching a leaderboard does not create new evaluations.
- **Build:** `npm run build` refreshes the bundled fallback only when it is older than 20h, reuses a fresh dev snapshot instead of calling the API, and skips during a cooldown. Force it with `REFRESH_FALLBACK=force npm run build`.

## Attribution

Model scores, pricing, and latency metrics are provided by Artificial Analysis and must be credited. The footer links to https://artificialanalysis.ai/.

The **Prompts** page (`/prompts`) pulls live, CC0-licensed prompts from the public [prompts.chat](https://prompts.chat) API through the keyless `/api/prompts` proxy (10 min cache). Role-based sections (architect, backend, DevOps, marketing…) are defined in `shared/prompts.ts`. The **Architecture** group (AutoCAD & automation, 2D → 3D visualization, BIM/Revit, concept, codes & site, presentation, interior, landscape) filters one shared pool of drawing-related prompts.chat searches per topic and pins Mercury-authored templates from `shared/architect/`. The **Photo editing** group (All edits, Cinematic, Black & white, Film & vintage, Light & atmosphere, Retouch & restore) works the same way: Mercury photo-editing templates from `shared/imageEditPrompts.ts` are pinned above relevance-filtered live matches (video prompts excluded). With `lang=tr`, titles and descriptions are machine-translated via a keyless Google Translate endpoint (prompt text stays English) and Turkish searches are translated to English before querying.


The default **Visual library** combines 72 Mercury templates with category matches from the latest 300 prompts.chat entries (`/api/prompts?section=library&lang=en`, or `lang=tr`). `shared/promptLibrary.ts` classifies titles, tags, source categories and descriptions before translation; unmatched entries remain available in the community feed. Categories show live counts and newest community prompts first. While visible, the library checks every 10 minutes and checks stale data when focus returns; the existing API cache also lasts 10 minutes. A failed refresh retains the last loaded data, reports the failure and allows retrying. Source images are shown when supported, with illustrated category covers when absent or broken. This is a rolling discovery feed, not a permanent archive; users can save prompts to their personal workspace.

## Install as an app (PWA)

Mercury can be added to a phone home screen or installed on a computer. The header **Install / Yükle** button and footer **Install the app / Uygulamayı yükle** button open a guide in the selected language. When the browser provides a native install prompt, the guide includes **Install now / Şimdi yükle**. Otherwise it shows device-specific steps:

- **iPhone/iPad:** Safari → Share → Add to Home Screen → Add. Keep Open as Web App enabled if offered.
- **Android:** Chrome menu → Install app / Add to Home screen → confirm.
- **Desktop:** Chrome/Edge install icon or install menu; Safari 17+ on macOS supports File → Add to Dock.

Installation needs HTTPS (localhost is allowed for testing). Some browsers provide a shortcut instead of a standalone app. The install button hides in standalone mode and after the browser reports installation.

The production build generates `manifest.webmanifest` and a Workbox service worker. It precaches the application, icons and bundled model snapshot. After initial caching, pages can open offline; live data endpoints are excluded from the navigation fallback and still need the network. External fonts, remote images and live feeds are not saved by the service worker. Updates wait for the user to choose **Update app** before reloading.

Service workers are disabled during `npm run dev` to avoid stale development files. Verify the production build:

```bash
npm run build
npm run check:pwa
npm run preview
```

Open the printed localhost URL and wait for the installation guide to show **Ready to open offline**. Stop the preview server, then navigate to `/bench` and reload to verify offline opening. The preview server does not run Netlify Functions, so model data uses the bundled snapshot and live feeds are unavailable. For live data, use the deployed HTTPS site.

Installation behavior references: [MDN installability](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [Apple home screen web apps](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios).

## Model finder, history and personal prompts

- **Find a model** (`/find`): choose a language-model task, token workload, monthly USD budget, quality/balance/speed preference and optional open-weight restriction. Up to three recommendations include estimated monthly cost, budget remaining, measured task score and speed. The methodology explains the deterministic weights; unknown prices are excluded, and speed priority requires measured speed. Recommendations use the same benchmark cohort selection as the leaderboard. Estimates do not include tax, reasoning overhead, prompt caching or discounts.
- **Model history** (model detail pages): select a published metric and a 7/30/90/365-day window. The existing daily refresher and model endpoint archive one immutable snapshot per UTC collection date in the site-wide Netlify Blobs `model-history` store. Local Vite development stores the same observations under `.cache/mercury/history/`. `/api/model-history?slug=…&days=30` reads these observations without calling Artificial Analysis. A new deployment starts with the first available observation; it does not invent older history or duplicate stale data under today's date. Legacy score backfills and static media price hints are excluded. Different metric fields or published versions/configurations are not joined; unknown versions are explicitly identified, and missing days remain gaps. Storage failures show a retry state without blocking model data.
- **My prompt workspace** (`/workspace`, linked from Prompts): save library/community prompts, create and edit your own templates, add collections, search, fill `{{field}}` or `[field]` placeholders, and copy the completed text. Stored in this browser under `mercury-prompt-workspace-v1`; no account or server upload. JSON export/import provides backups. Imports validate the schema and merge without overwriting existing prompts. Removing a collection keeps its prompts unfiled. Browser storage failures leave the previous saved data intact.

Feature logic checks: `node --test tests/features.test.mjs`.

## Comparable benchmarks and provenance

Home, Bench and Compare automatically combine the available results for each task. There is no source selector or per-row provenance panel. Detailed source metadata remains in the data pipeline and CSV exports.

For tasks with multiple compatible task-level tests, each test is converted to a 0–100 relative standing (midrank for ties). Multiple tests from one source first receive one averaged source vote; available source votes are then averaged with equal weight. These derived values are labeled **Combined score**, never presented as a published raw benchmark score. A task with only one test retains its original score and units. Current results take precedence over archived results; historical-only fields retain a historical-leader heading. Latest snapshots/test releases are selected automatically. Exact model names and configurations are deduplicated, without dropping effort or agent qualifiers. Missing tests are not assigned zero.

- Artificial Analysis remains the main source for its indices, speed and media arenas. When AA omits a test version or evaluation date, the UI says it is unpublished; the retrieval date is not presented as the evaluation date.
- `src/data/archive-models.json` preserves the 18 September 2026 snapshot as a separate, explicitly historical dataset, with separate model identities and prices. It is never written into current model evaluations. Historical-only categories show a historical-leader heading and warning.
- [LiveBench](https://livebench.ai/) supplies its current v2 Coding, Long Agentic and weighted Overall scores. Only complete suites enter Overall, using the official category weights and rounding. The frozen v1 2026-06-25 Mathematics and IF suites remain historical inputs.
- [LiveCodeBench](https://livecodebench.github.io/leaderboard.html) uses the official page's default problem window. Only models evaluated on the identical problem set and released before the window enter this cohort. Old problem windows remain explicitly historical.
- [SWE-bench](https://www.swebench.com/) imports checked Verified results with mini-SWE-agent and one attempt, separating each harness version. Submission dates are shown separately from unknown evaluation dates.
- [Terminal-Bench](https://www.tbench.ai/) imports its public server-rendered results as model **plus agent** configurations, preserving the benchmark version. It does not claim these are model-only scores.
- [OpenRouter](https://openrouter.ai/docs/guides/overview/models) provides token list prices only for unique exact identities with no configuration qualifiers removed. It only fills missing language-model prices and does not replace AA prices. Per-request and conditional-price entries are excluded from this simple token calculator.

Source attribution is retained in the footer; detailed provenance is retained in data and CSV exports. Refer to each source's own license and terms; public access does not imply all datasets have the same license. LiveBench/LiveCodeBench aggregates are derived from the published data, not a new benchmark. Agent results use their published environment, not a common Mercury agent.

### Refresh and failure behavior

`/api/benchmarks` is implemented by the Vite middleware in development and the Netlify function in production. Sources are fetched independently and cached daily (disk in development, Netlify Blobs in production). Failed refreshes retain each source's last successful data and original timestamps, mark it stale, and retry after an hour. The bundled `src/data/benchmark-sources.json` supports static previews and API outages. Build-time refresh uses the same adapters:

```bash
node scripts/refresh-benchmarks.mjs
REFRESH_BENCHMARKS=force node scripts/refresh-benchmarks.mjs
node --test tests/benchmarks.test.mjs
```

The refresh script and tests use Node's native TypeScript support (Node 22.18+; developed with Node 26). The build runs both fallback-refresh scripts automatically.

Media prices omitted by the upstream payload are explicitly labeled manually maintained estimates with an unknown price date. The price source/date remains in CSV exports; the UI only flags estimated prices. Scores, price freshness and evaluation freshness are independent. No current result is invented when a source has not tested a model.
