// Fetches the Artificial Analysis model lists. Shared by the Netlify function and the Vite dev route.
// The free tier allows 100 requests / 24h and each refresh needs ~6 (200 models per page),
// so callers must cache aggressively and honour the cooldown returned on 429.

/** Model data is refreshed from upstream at most once a day; everything else reads the cached snapshot. */
export const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000

/** Age of a payload in ms based on its fetchedAt (Infinity when unknown). */
export function payloadAgeMs(payload: { fetchedAt?: string } | null | undefined, now = Date.now()) {
  const at = payload?.fetchedAt ? Date.parse(payload.fetchedAt) : NaN
  return Number.isFinite(at) ? now - at : Infinity
}

// Pro routes are tried first; a 403 marks the key as free so later refreshes skip them.
const ENDPOINTS = {
  language: [
    'https://artificialanalysis.ai/api/v2/language/models',
    'https://artificialanalysis.ai/api/v2/language/models/free',
  ],
  image: [
    'https://artificialanalysis.ai/api/v2/media/text-to-image/models',
    'https://artificialanalysis.ai/api/v2/media/text-to-image/models/free',
  ],
  speech: [
    'https://artificialanalysis.ai/api/v2/media/text-to-speech/models',
    'https://artificialanalysis.ai/api/v2/media/text-to-speech/models/free',
  ],
  video: [
    'https://artificialanalysis.ai/api/v2/media/text-to-video/models',
    'https://artificialanalysis.ai/api/v2/media/text-to-video/models/free',
  ],
} as const

export type FailureReason = 'missing-key' | 'rate-limited' | 'upstream-error'

export interface ModelsPayload {
  language: unknown[]
  image: unknown[]
  speech: unknown[]
  video?: unknown[]
  data: unknown[]
  tier?: string
  fetchedAt: string
}

export type FetchResult =
  | { ok: true; payload: ModelsPayload; freeOnly: boolean }
  | { ok: false; reason: FailureReason; retryAt?: number; freeOnly: boolean }

class RateLimited extends Error {
  readonly retryAt: number
  constructor(retryAt: number) {
    super('rate-limited')
    this.retryAt = retryAt
  }
}

function listOf(raw: unknown) {
  if (!raw || typeof raw !== 'object') return { data: [] as unknown[], hasMore: false }
  const obj = raw as Record<string, unknown>
  const data = Array.isArray(obj.data) ? obj.data : Array.isArray(raw) ? (raw as unknown[]) : []
  const pagination = obj.pagination as { has_more?: boolean } | undefined
  return {
    data,
    tier: typeof obj.tier === 'string' ? obj.tier : undefined,
    hasMore: Boolean(pagination?.has_more),
  }
}

async function fetchPaged(urls: readonly string[], apiKey: string, state: { freeOnly: boolean }) {
  const candidates = state.freeOnly ? urls.filter((u) => u.endsWith('/free')) : urls
  for (const url of candidates) {
    const all: unknown[] = []
    let tier: string | undefined
    for (let page = 1; page <= 20; page += 1) {
      const res = await fetch(`${url}?page=${page}`, {
        headers: { 'x-api-key': apiKey, Accept: 'application/json' },
      })
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after'))
        const reset = Number(res.headers.get('x-ratelimit-reset'))
        const retryAt = Number.isFinite(retryAfter) && retryAfter > 0
          ? Date.now() + retryAfter * 1000
          : Number.isFinite(reset) && reset > 0
            ? reset * 1000
            : Date.now() + 60 * 60 * 1000
        throw new RateLimited(retryAt)
      }
      if (res.status === 403 && url === ENDPOINTS.language[0]) state.freeOnly = true
      if (!res.ok) break
      const chunk = listOf(await res.json())
      if (!chunk.data.length) break
      all.push(...chunk.data)
      tier = chunk.tier ?? tier
      if (!chunk.hasMore) break
    }
    if (all.length) return { data: all, tier }
  }
  return null
}

export async function fetchModels(apiKey: string | undefined, freeOnly = false): Promise<FetchResult> {
  if (!apiKey) return { ok: false, reason: 'missing-key', freeOnly }
  const state = { freeOnly }
  try {
    // Sequential so a 429 stops further spending instead of firing every request in parallel.
    const language = await fetchPaged(ENDPOINTS.language, apiKey, state)
    const image = await fetchPaged(ENDPOINTS.image, apiKey, state)
    const speech = await fetchPaged(ENDPOINTS.speech, apiKey, state)
    const video = await fetchPaged(ENDPOINTS.video, apiKey, state)
    if (!language?.data.length) return { ok: false, reason: 'upstream-error', freeOnly: state.freeOnly }

    const imageRows = (image?.data ?? []).map((m) => ({ ...(m as object), kind: 'image' }))
    const speechRows = (speech?.data ?? []).map((m) => ({ ...(m as object), kind: 'speech' }))
    const videoRows = (video?.data ?? []).map((m) => ({ ...(m as object), kind: 'video' }))
    return {
      ok: true,
      freeOnly: state.freeOnly,
      payload: {
        language: language.data,
        image: imageRows,
        speech: speechRows,
        video: videoRows,
        data: [...language.data, ...imageRows, ...speechRows, ...videoRows],
        tier: language.tier ?? image?.tier ?? speech?.tier,
        fetchedAt: new Date().toISOString(),
      },
    }
  } catch (err) {
    if (err instanceof RateLimited) {
      return { ok: false, reason: 'rate-limited', retryAt: err.retryAt, freeOnly: state.freeOnly }
    }
    return { ok: false, reason: 'upstream-error', freeOnly: state.freeOnly }
  }
}

export function fallbackPayload(raw: unknown): ModelsPayload {
  const fb = (raw ?? {}) as {
    language?: unknown[]
    image?: unknown[]
    speech?: unknown[]
    video?: unknown[]
    data?: unknown[]
    fetchedAt?: string
  }
  const language = fb.language ?? fb.data ?? (Array.isArray(raw) ? raw : [])
  const image = fb.image ?? []
  const speech = fb.speech ?? []
  const video = fb.video ?? []
  return {
    language,
    image,
    speech,
    video,
    data: [...language, ...image, ...speech, ...video],
    fetchedAt: fb.fetchedAt ?? new Date().toISOString(),
  }
}
