// Refreshes the bundled fallback datasets from the live Artificial Analysis API.
// Runs automatically before every build; exits 0 (keeping the old files) if the key is missing or the API fails.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
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

async function fetchJson(url, apiKey) {
  const res = await fetch(url, { headers: { 'x-api-key': apiKey, Accept: 'application/json' } })
  if (!res.ok) return null
  return res.json()
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

  const [language, image, speech] = await Promise.all([
    fetchPaged(LANGUAGE_URLS, apiKey),
    fetchPaged(IMAGE_URLS, apiKey),
    fetchPaged(SPEECH_URLS, apiKey),
  ])

  if (!language.length) {
    console.warn('[refresh-fallback] Upstream returned no language models; keeping existing fallback files.')
    return
  }

  const payload = { fetchedAt: new Date().toISOString(), language, image, speech }
  const body = JSON.stringify(payload)
  for (const target of targets) writeFileSync(target, body)
  console.log(
    `[refresh-fallback] Wrote ${language.length} LLM / ${image.length} image / ${speech.length} speech models (${Math.round(body.length / 1024)} KB).`,
  )
}

main().catch((err) => {
  console.warn('[refresh-fallback] Failed, keeping existing fallback files:', err?.message ?? err)
})
