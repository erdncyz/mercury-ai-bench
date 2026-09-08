# Mercury AI Bench

Premium AI model benchmark site powered by [Artificial Analysis](https://artificialanalysis.ai/) live data. Rank models by coding, intelligence, math, speed, or price-performance — with request cost estimates.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Netlify Functions (API key proxy + 6h cache)
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

## Attribution

Model scores, pricing, and latency metrics are provided by Artificial Analysis and must be credited. The footer links to https://artificialanalysis.ai/.
