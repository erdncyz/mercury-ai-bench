// Refreshes the bundled fallback datasets from the live Artificial Analysis API.
// Runs automatically before every build; exits 0 (keeping the old files) if the key is missing or the API fails.
// The free tier allows only 100 requests / 24h (each refresh ~6–12), so it skips when the snapshot is recent
// (set REFRESH_FALLBACK=force to override) and stops at the first 429.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const MAX_AGE_MS = 20 * 60 * 60 * 1000
const targets = [
  resolve(root, 'src/data/fallback-models.json'),
  resolve(root, 'netlify/functions/fallback-models.json'),
]

const LANGUAGE_URLS = [
  'https://artificialanalysis.ai/api/v2/language/models',
  'https://artificialanalysis.ai/api/v2/language/models/free',
]
const IMAGE_URLS = [
  'https://artificialanalysis.ai/api/v2/media/text-to-image/models',
  'https://artificialanalysis.ai/api/v2/media/text-to-image/models/free',
]
const SPEECH_URLS = [
  'https://artificialanalysis.ai/api/v2/media/text-to-speech/models',
  'https://artificialanalysis.ai/api/v2/media/text-to-speech/models/free',
]
const VIDEO_URLS = [
  'https://artificialanalysis.ai/api/v2/media/text-to-video/models',
  'https://artificialanalysis.ai/api/v2/media/text-to-video/models/free',
]

function loadKey() {
  if (process.env.ARTIFICIAL_ANALYSIS_API_KEY) return process.env.ARTIFICIAL_ANALYSIS_API_KEY
  try {
    const text = readFileSync(resolve(root, '.env'), 'utf8')
    return text.match(/^ARTIFICIAL_ANALYSIS_API_KEY=(.+)$/m)?.[1]?.trim()
  } catch {
    return undefined
  }
}

function normalizeList(raw) {
  if (!raw || typeof raw !== 'object') return { data: [], hasMore: false }
  const data = Array.isArray(raw.data) ? raw.data : Array.isArray(raw) ? raw : []
  return { data, hasMore: Boolean(raw.pagination?.has_more) }
}

class RateLimited extends Error {}

async function fetchJson(url, apiKey) {
  const res = await fetch(url, { headers: { 'x-api-key': apiKey, Accept: 'application/json' } })
  if (res.status === 429) throw new RateLimited('rate-limited (daily quota reached)')
  if (!res.ok) return null
  return res.json()
}

/** State saved by the Vite dev route; reused to avoid API calls (fresh snapshot or an active 429 cooldown). */
function devCache() {
  for (const path of ['.cache/mercury/aa-models.json', 'node_modules/.cache/mercury/aa-models.json']) {
    try {
      return JSON.parse(readFileSync(resolve(root, path), 'utf8'))
    } catch {
      // try next
    }
  }
  return {}
}

function devSnapshot(cache) {
  const { snapshot } = cache
  if (!snapshot?.payload?.language?.length) return null
  return { ...snapshot, age: Date.now() - snapshot.savedAt }
}

function snapshotAgeMs() {
  try {
    const { fetchedAt } = JSON.parse(readFileSync(targets[0], 'utf8'))
    const age = Date.now() - Date.parse(fetchedAt)
    return Number.isFinite(age) ? age : Infinity
  } catch {
    return Infinity
  }
}

async function fetchPaged(urls, apiKey) {
  for (const url of urls) {
    const all = []
    for (let page = 1; page <= 20; page += 1) {
      const chunk = normalizeList(await fetchJson(`${url}?page=${page}`, apiKey))
      if (!chunk.data.length) break
      all.push(...chunk.data)
      if (!chunk.hasMore) break
    }
    if (all.length) return all
  }
  return []
}

async function main() {
  const apiKey = loadKey()
  if (!apiKey) {
    console.warn('[refresh-fallback] ARTIFICIAL_ANALYSIS_API_KEY not set; keeping existing fallback files.')
    return
  }

  const age = snapshotAgeMs()
  const force = process.env.REFRESH_FALLBACK === 'force'
  if (!force && age < MAX_AGE_MS) {
    console.log(`[refresh-fallback] Snapshot is ${Math.round(age / 3600000)}h old; skipping to save API quota.`)
    return
  }

  const cache = devCache()
  const dev = devSnapshot(cache)
  if (!force && dev && dev.age < MAX_AGE_MS && dev.age < age) {
    const { language, image, speech, video = [], fetchedAt } = dev.payload
    const body = JSON.stringify({ fetchedAt, language, image, speech, video })
    for (const target of targets) writeFileSync(target, body)
    console.log(`[refresh-fallback] Reused the ${Math.round(dev.age / 3600000)}h-old dev snapshot (no API call).`)
    return
  }

  if (!force && cache.cooldownUntil > Date.now()) {
    console.log(`[refresh-fallback] API quota cooldown until ${new Date(cache.cooldownUntil).toLocaleString()}; keeping existing files.`)
    return
  }

  // Sequential so a 429 stops further spending.
  const language = await fetchPaged(LANGUAGE_URLS, apiKey)
  const image = await fetchPaged(IMAGE_URLS, apiKey)
  const speech = await fetchPaged(SPEECH_URLS, apiKey)
  const video = await fetchPaged(VIDEO_URLS, apiKey)

  if (!language.length) {
    console.warn('[refresh-fallback] Upstream returned no language models; keeping existing fallback files.')
    return
  }

  const payload = { fetchedAt: new Date().toISOString(), language, image, speech, video }
  const body = JSON.stringify(payload)
  for (const target of targets) writeFileSync(target, body)
  console.log(
    `[refresh-fallback] Wrote ${language.length} LLM / ${image.length} image / ${speech.length} speech models (${Math.round(body.length / 1024)} KB).`,
  )
}

main().catch((err) => {
  console.warn('[refresh-fallback] Failed, keeping existing fallback files:', err?.message ?? err)
})
