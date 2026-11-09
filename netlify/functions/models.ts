import type { Context, Config } from '@netlify/functions'
import fallbackModels from './fallback-models.json'

type CacheEntry = {
  body: string
  expiresAt: number
}

const CACHE_TTL_MS = 10 * 60 * 1000
let memoryCache: CacheEntry | null = null

// Legacy /api/v2/data/* routes returned 410 on 4 Nov 2026.
// Pro routes are tried first; a free key falls through to the public routes.
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

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=600',
  }
}

function normalizeList(raw: unknown): {
  data: unknown[]
  tier?: string
  hasMore?: boolean
} {
  if (!raw || typeof raw !== 'object') return { data: [] }
  const obj = raw as Record<string, unknown>
  const data = Array.isArray(obj.data) ? obj.data : Array.isArray(raw) ? raw : []
  const pagination = obj.pagination as { has_more?: boolean } | undefined
  return {
    data,
    tier: typeof obj.tier === 'string' ? obj.tier : undefined,
    hasMore: Boolean(pagination?.has_more),
  }
}

async function fetchJson(url: string, apiKey: string) {
  const res = await fetch(url, {
    headers: { 'x-api-key': apiKey, Accept: 'application/json' },
  })
  if (!res.ok) return null
  return res.json()
}

async function fetchPaged(urls: string[], apiKey: string) {
  for (const url of urls) {
    const all: unknown[] = []
    let page = 1
    let tier: string | undefined
    for (let i = 0; i < 20; i += 1) {
      try {
        const json = await fetchJson(`${url}?page=${page}`, apiKey)
        if (!json) break
        const normalized = normalizeList(json)
        if (!normalized.data.length) break
        all.push(...normalized.data)
        tier = normalized.tier ?? tier
        if (!normalized.hasMore) break
        page += 1
      } catch {
        break
      }
    }
    if (all.length) return { data: all, tier }
  }
  return null
}

async function fetchBundle(apiKey: string) {
  const [language, image, speech] = await Promise.all([
    fetchPaged(LANGUAGE_URLS, apiKey),
    fetchPaged(IMAGE_URLS, apiKey),
    fetchPaged(SPEECH_URLS, apiKey),
  ])
  if (!language?.data.length && !image?.data.length && !speech?.data.length) return null
  return {
    language: language?.data ?? [],
    image: image?.data ?? [],
    speech: speech?.data ?? [],
    tier: language?.tier ?? image?.tier ?? speech?.tier,
  }
}

function fallbackPayload() {
  const fb = fallbackModels as {
    language?: unknown[]
    image?: unknown[]
    speech?: unknown[]
    data?: unknown[]
    fetchedAt?: string
  }
  const language = fb.language ?? fb.data ?? (Array.isArray(fallbackModels) ? fallbackModels : [])
  const image = fb.image ?? []
  const speech = fb.speech ?? []
  return {
    language,
    image,
    speech,
    data: [...language, ...image, ...speech],
    fetchedAt: fb.fetchedAt ?? new Date().toISOString(),
    source: 'fallback' as const,
  }
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders(),
    })
  }

  const now = Date.now()
  if (memoryCache && memoryCache.expiresAt > now) {
    return new Response(
      JSON.stringify({
        ...JSON.parse(memoryCache.body),
        source: 'cache',
      }),
      { status: 200, headers: corsHeaders() },
    )
  }

  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify(fallbackPayload()), {
      status: 200,
      headers: corsHeaders(),
    })
  }

  const upstream = await fetchBundle(apiKey)
  if (!upstream) {
    const cached = memoryCache ? JSON.parse(memoryCache.body) : fallbackPayload()
    return new Response(
      JSON.stringify({
        ...cached,
        source: memoryCache ? 'cache' : 'fallback',
      }),
      { status: 200, headers: corsHeaders() },
    )
  }

  const image = (upstream.image as Record<string, unknown>[]).map((m) => ({
    ...m,
    kind: 'image',
  }))
  const speech = (upstream.speech as Record<string, unknown>[]).map((m) => ({
    ...m,
    kind: 'speech',
  }))
  const payload = {
    language: upstream.language,
    image,
    speech,
    tier: upstream.tier,
    data: [...upstream.language, ...image, ...speech],
    fetchedAt: new Date().toISOString(),
    source: 'live' as const,
  }
  const body = JSON.stringify(payload)
  memoryCache = { body, expiresAt: now + CACHE_TTL_MS }

  return new Response(body, { status: 200, headers: corsHeaders() })
}

export const config: Config = {
  path: '/api/models',
}
