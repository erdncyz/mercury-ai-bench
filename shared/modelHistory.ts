import type { ModelsPayload } from './aaModels.ts'

export interface HistoryMetric {
  key: string
  value: number
  unit: 'score' | 'usd' | 'tokens/s' | 'seconds'
  /** Exact upstream field + declared version/configuration. Unknown versions stay explicit. */
  cohort: string
}
export interface HistoryPoint {
  at: string
  metrics: HistoryMetric[]
}
export interface HistorySnapshot {
  at: string
  models: Record<string, HistoryMetric[]>
}
export interface ModelHistoryResponse {
  points: HistoryPoint[]
  available: boolean
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

/** Only archive published observations, never legacy backfills or static media price hints. */
export function historySnapshot(payload: ModelsPayload): HistorySnapshot | null {
  const timestamp = Date.parse(payload.fetchedAt)
  if (!Number.isFinite(timestamp)) return null
  const models: HistorySnapshot['models'] = {}
  const groups = [payload.language, payload.image, payload.speech]
  if (!groups.some((g) => g.length)) groups[0] = payload.data
  for (const group of groups) for (const item of group) {
    const raw = record(item)
    const slug = String(raw.slug ?? raw.id ?? '')
    if (!slug) continue
    const evaluations = record(raw.evaluations)
    const pricing = record(raw.pricing)
    const performance = record(raw.performance)
    const metrics: HistoryMetric[] = []
    const version = String(raw.benchmark_version ?? evaluations.version ?? 'version-unpublished')
    const configuration = String(raw.configuration ?? raw.reasoning_effort ?? 'configuration-unpublished')
    const add = (key: string, value: unknown, unit: HistoryMetric['unit'], field = key) => {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return
      metrics.push({ key, value, unit, cohort: unit === 'score'
        ? `Artificial Analysis:${field}:${version}:${configuration}` : `Artificial Analysis:${field}` })
    }
    for (const [key, field] of [
      ['intelligence', 'artificial_analysis_intelligence_index'],
      ['coding', 'artificial_analysis_coding_index'],
      ['engineering', 'artificial_analysis_engineering_index'],
      ['math', 'artificial_analysis_math_index'],
      ['agents', 'artificial_analysis_agentic_index'],
      ['tau2', 'tau2'], ['tau2Telecom', 'tau2_telecom'],
      ['longcontext', 'lcr'], ['aaLcr', 'aa_lcr'], ['instruction', 'ifbench'],
    ]) add(key, evaluations[field], 'score', field)
    add('elo', raw.elo, 'score', 'elo')
    add('inputPrice', pricing.price_1m_input_tokens, 'usd')
    add('outputPrice', pricing.price_1m_output_tokens, 'usd')
    add('speed', performance.median_output_tokens_per_second ?? raw.median_output_tokens_per_second, 'tokens/s')
    add('latency', performance.median_time_to_first_token_seconds ?? raw.median_time_to_first_token_seconds, 'seconds')
    if (metrics.length) models[slug] = metrics
  }
  return { at: new Date(timestamp).toISOString(), models }
}

export function historyPoints(snapshots: HistorySnapshot[], slug: string, days: number, now = Date.now()): HistoryPoint[] {
  const cutoff = now - days * 86400000
  return snapshots.filter((s) => Date.parse(s.at) >= cutoff && Date.parse(s.at) <= now && s.models[slug])
    .map((s) => ({ at: s.at, metrics: s.models[slug] }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}

export function historyQuery(url: URL) {
  const slug = url.searchParams.get('slug') ?? ''
  const days = Number(url.searchParams.get('days') ?? 30)
  if (!slug || slug.length > 250 || ![7, 30, 90, 365].includes(days)) return null
  return { slug, days }
}
