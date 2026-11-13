import { useCallback, useEffect, useState } from 'react'
import {
  normalizeIncomingModels,
  normalizeLanguageModel,
  normalizeMediaModel,
} from '../lib/normalize'
import type { MessageKey } from '../i18n/messages'
import type { AiModel, ModelsResponse, SupplementalData } from '../types/models'

import { attachArtificialAnalysis, mergeSupplemental } from '../lib/benchmarks'

const REFRESH_MS = 10 * 60 * 1000

let archivePromise: Promise<AiModel[]> | null = null
function loadArchive(): Promise<AiModel[]> {
  archivePromise ??= import('../data/archive-models.json').then((mod) => {
    const snapshot = mod.default
    return attachArtificialAnalysis(normalizeIncomingModels(snapshot), snapshot.fetchedAt).map((model) => ({
      ...model, id: `aa-archive:${model.id}`, slug: `aa-archive--${model.slug}`,
      benchmarks: model.benchmarks?.map((result) => ({ ...result, historical: true })),
    }))
  })
  return archivePromise
}

async function loadSupplemental(): Promise<SupplementalData> {
  try {
    const response = await fetch('/api/benchmarks', { cache: 'no-store', signal: AbortSignal.timeout(20000) })
    if (response.ok) {
      const json = await response.json()
      if (Array.isArray(json.models) && Array.isArray(json.prices) && Array.isArray(json.sources)) return json
    }
  } catch { /* use the last successful bundled observations */ }
  const bundled = (await import('../data/benchmark-sources.json')).default as SupplementalData
  return { ...bundled, sources: bundled.sources.map((source) => ({ ...source, status: !source.fetchedAt ? 'unavailable' : Date.now() - Date.parse(source.fetchedAt) > 24 * 3600000 ? 'stale' : source.status })) }
}

async function loadDataset(): Promise<ModelsResponse> {
  const [result, archive, supplemental] = await Promise.all([loadModels(), loadArchive(), loadSupplemental()])
  const current = attachArtificialAnalysis(result.data, result.fetchedAt)
  return { ...result, data: mergeSupplemental([...current, ...archive], supplemental), sources: supplemental.sources }
}

// Lazy-loaded so the full fallback dataset stays out of the main bundle.
async function fromFallback(): Promise<ModelsResponse> {
  const fb = (await import('../data/fallback-models.json')).default as {
    language?: Record<string, unknown>[]
    image?: Record<string, unknown>[]
    speech?: Record<string, unknown>[]
    video?: Record<string, unknown>[]
    fetchedAt?: string
  }
  const language = (fb.language ?? []).map(normalizeLanguageModel)
  const image = (fb.image ?? []).map((m) => normalizeMediaModel(m, 'image'))
  const speech = (fb.speech ?? []).map((m) => normalizeMediaModel(m, 'speech'))
  const video = (fb.video ?? []).map((m) => normalizeMediaModel(m, 'video'))
  return {
    data: [...language, ...image, ...speech, ...video],
    fetchedAt: fb.fetchedAt ?? new Date().toISOString(),
    source: 'fallback',
  }
}

async function loadModels(): Promise<ModelsResponse> {
  const endpoints = ['/api/models', '/.netlify/functions/models']
  const bust = `t=${Date.now()}`

  for (const endpoint of endpoints) {
    try {
      const sep = endpoint.includes('?') ? '&' : '?'
      const res = await fetch(`${endpoint}${sep}${bust}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) continue
      const json = await res.json()
      const data = normalizeIncomingModels(json)
      if (data.length > 0) {
        return {
          data,
          fetchedAt: json.fetchedAt ?? new Date().toISOString(),
          source: json.source ?? 'live',
          tier: json.tier,
          reason: json.reason,
          stale: Boolean(json.stale),
        }
      }
    } catch {
      // try next
    }
  }

  return fromFallback()
}

export function useModels() {
  const [data, setData] = useState<ModelsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const result = await loadDataset()
      setData(result)
      setError(result.source === 'fallback' || Boolean(result.stale))
    } catch {
      const fallback = await fromFallback()
      setData({ ...fallback, data: attachArtificialAnalysis(fallback.data, fallback.fetchedAt) })
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh(false)
    const id = window.setInterval(() => void refresh(true), REFRESH_MS)
    const onFocus = () => void refresh(true)
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  return {
    data,
    loading,
    error,
    notice: error ? noticeFor(data?.reason) : null,
    models: data?.data ?? ([] as AiModel[]),
    refresh,
  }
}

function noticeFor(reason: ModelsResponse['reason']): MessageKey {
  if (reason === 'missing-key') return 'error'
  if (reason === 'rate-limited') return 'errorRateLimited'
  return 'errorUpstream'
}
