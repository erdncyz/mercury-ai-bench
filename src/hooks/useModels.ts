import { useEffect, useState } from 'react'
import fallbackBundle from '../data/fallback-models.json'
import { normalizeIncomingModels, normalizeLanguageModel, normalizeMediaModel } from '../lib/normalize'
import type { AiModel, ModelsResponse } from '../types/models'

function fromFallback(): ModelsResponse {
  const fb = fallbackBundle as {
    language?: Record<string, unknown>[]
    image?: Record<string, unknown>[]
    speech?: Record<string, unknown>[]
  }
  const language = (fb.language ?? []).map(normalizeLanguageModel)
  const image = (fb.image ?? []).map((m) => normalizeMediaModel(m, 'image'))
  const speech = (fb.speech ?? []).map((m) => normalizeMediaModel(m, 'speech'))
  return {
    data: [...language, ...image, ...speech],
    fetchedAt: new Date().toISOString(),
    source: 'fallback',
  }
}

async function loadModels(): Promise<ModelsResponse> {
  const endpoints = ['/api/models', '/.netlify/functions/models']

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint)
      if (!res.ok) continue
      const json = await res.json()
      const data = normalizeIncomingModels(json)
      if (data.length > 0) {
        return {
          data,
          fetchedAt: json.fetchedAt ?? new Date().toISOString(),
          source: json.source ?? 'live',
          tier: json.tier,
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

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const result = await loadModels()
        if (!cancelled) {
          setData(result)
          setError(result.source === 'fallback')
        }
      } catch {
        if (!cancelled) {
          setData(fromFallback())
          setError(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error, models: data?.data ?? ([] as AiModel[]) }
}
