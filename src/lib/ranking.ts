import { selectBenchmark } from './benchmarks'
import type { AiModel, CostScenario, RankedModel, SortKey, TaskId } from '../types/models'

export const COST_SCENARIOS: CostScenario[] = [
  { id: 'chat', inputTokens: 2000, outputTokens: 500 },
  { id: 'code', inputTokens: 4000, outputTokens: 1000 },
  { id: 'analysis', inputTokens: 8000, outputTokens: 2000 },
]

export const TASK_IDS: TaskId[] = [
  'coding',
  'agents',
  'math',
  'intelligence',
  'longcontext',
  'instruction',
  'image',
  'video',
  'presentation',
  'speech',
  'speed',
]

/** Tasks whose score is a 0–1 fraction rather than an index. */
export function isFractionTask(task: TaskId): boolean {
  return task === 'agents' || task === 'longcontext' || task === 'instruction'
}

export function scoreDigits(task: TaskId): number {
  if (task === 'image' || task === 'speech' || task === 'video') return 0
  return isFractionTask(task) ? 2 : 1
}

const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

export function isNewRelease(model: AiModel, now = Date.now()): boolean {
  if (!model.release_date) return false
  const ts = Date.parse(model.release_date)
  return Number.isFinite(ts) && now - ts <= NEW_WINDOW_MS
}

export function modelsForTask(models: AiModel[], task: TaskId): AiModel[] {
  switch (task) {
    case 'video':
    case 'presentation':
      return models.filter((m) => m.kind === task)
    case 'image':
      return models.filter((m) => m.kind === 'image')
    case 'speech':
      return models.filter((m) => m.kind === 'speech')
    default:
      return models.filter((m) => m.kind === 'language')
  }
}

export function codingScore(model: AiModel): number | null {
  const e = model.evaluations
  return e.artificial_analysis_coding_index ?? null
}

export function agentsScore(model: AiModel): number | null {
  const e = model.evaluations
  return e.artificial_analysis_agentic_index ?? null
}

export function getTaskScore(model: AiModel, task: TaskId, benchmarkId?: string): number | null {
  if (model.benchmarks) {
    const active = (model as RankedModel).benchmark
    return model.benchmarks.find((r) => r.task === task && r.id === (benchmarkId ?? (active?.task === task ? active.id : selectBenchmark([model], task)?.id)))?.score ?? null
  }
  const e = model.evaluations
  switch (task) {
    case 'coding':
      return codingScore(model)
    case 'agents':
      return agentsScore(model)
    case 'math':
      return e.artificial_analysis_math_index
    case 'intelligence':
      return e.artificial_analysis_intelligence_index
    case 'longcontext':
      return e.lcr ?? null
    case 'instruction':
      return e.ifbench ?? null
    case 'image':
    case 'video':
    case 'speech':
      return model.elo ?? null
    case 'speed':
      return model.median_output_tokens_per_second
    default:
      return null
  }
}

export function getValueScore(model: AiModel, task: TaskId, benchmarkId?: string): number | null {
  const score = getTaskScore(model, task, benchmarkId)
  if (score == null) return null

  if (isMediaTask(task)) {
    const unit = model.pricing.price_unit ?? model.pricing.price_1m_blended_3_to_1
    if (unit == null || unit <= 0) return null
    return score / unit
  }

  const price = model.pricing.price_1m_blended_3_to_1
  if (price == null || price <= 0) return null

  // Speed ranks by tok/s, but value should still reflect quality per dollar.
  const quality =
    task === 'speed' ? model.evaluations.artificial_analysis_intelligence_index : score

  if (quality == null) return null
  return quality / price
}

export function estimateRequestCost(
  model: AiModel,
  inputTokens: number,
  outputTokens: number,
): number | null {
  if (model.kind === 'video' || model.kind === 'presentation') return null
  if (model.kind === 'image') {
    const unit = model.pricing.price_unit
    if (unit == null) return null
    return unit / 1000
  }
  if (model.kind === 'speech') {
    const unit = model.pricing.price_unit
    if (unit == null) return null
    return (1000 / 1_000_000) * unit
  }
  const input = model.pricing.price_1m_input_tokens
  const output = model.pricing.price_1m_output_tokens
  if (input == null || output == null) return null
  return (inputTokens / 1_000_000) * input + (outputTokens / 1_000_000) * output
}

export function rankModels(
  models: AiModel[],
  task: TaskId,
  sort: SortKey = 'score',
  inputTokens = 4000,
  outputTokens = 1000,
  benchmarkId?: string | null,
): RankedModel[] {
  const selectedBenchmark = selectBenchmark(models, task, benchmarkId)
  const pool = modelsForTask(models, task)
  const enriched = pool
    .map((model): RankedModel | null => {
      const score = getTaskScore(model, task, selectedBenchmark?.id)
      const valueScore = getValueScore(model, task, selectedBenchmark?.id)
      const requestCost = estimateRequestCost(model, inputTokens, outputTokens)
      if (score == null) return null
      return {
        ...model,
        rank: 0,
        benchmark: model.benchmarks?.find((r) => r.id === selectedBenchmark?.id),
        score,
        valueScore: valueScore ?? 0,
        requestCost: requestCost ?? Number.POSITIVE_INFINITY,
      } satisfies RankedModel
    })
    .filter((m): m is RankedModel => m != null)

  const byPrimary = [...enriched].sort((a, b) => b.score - a.score)
  byPrimary.forEach((m, i) => {
    m.rank = i + 1
  })

  const sorted = [...byPrimary].sort((a, b) => {
    switch (sort) {
      case 'price': {
        const ap =
          a.pricing.price_unit ??
          a.pricing.price_1m_blended_3_to_1 ??
          Number.POSITIVE_INFINITY
        const bp =
          b.pricing.price_unit ??
          b.pricing.price_1m_blended_3_to_1 ??
          Number.POSITIVE_INFINITY
        return ap - bp
      }
      case 'speed':
        return (
          (b.median_output_tokens_per_second ?? 0) -
          (a.median_output_tokens_per_second ?? 0)
        )
      case 'value':
        return b.valueScore - a.valueScore
      case 'score':
      default:
        return b.score - a.score
    }
  })

  return sorted
}

export function bestValueModels(models: RankedModel[], limit = 3): RankedModel[] {
  return [...models]
    .filter((m) => m.valueScore > 0)
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, limit)
}

/** @deprecated use bestValueModels */
export function bestValueModel(models: RankedModel[]): RankedModel | null {
  return bestValueModels(models, 1)[0] ?? null
}

export function formatUsd(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) return '—'
  if (value === 0) return '$0'
  if (value < 0.0001) return `$${value.toExponential(1)}`
  if (value < 0.01) return `$${value.toFixed(4)}`
  if (value < 1) return `$${value.toFixed(3)}`
  return `$${value.toFixed(digits)}`
}

export function formatScore(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return '—'
  return value.toFixed(digits)
}

/** Strip effort/variant parentheticals for compact card titles. */
export function shortModelName(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()
}

export function formatSpeed(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Math.round(value)} t/s`
}

export function formatMediaPrice(model: AiModel): string {
  const unit = model.pricing.price_unit
  if (unit == null) return '—'
  if (model.pricing.price_unit_label === 'per_1k_images') {
    return `${formatUsd(unit)} / 1k img`
  }
  if (model.pricing.price_unit_label === 'per_1m_chars') {
    return `${formatUsd(unit)} / 1M chars`
  }
  if (model.pricing.price_unit_label === 'per_minute') return `${formatUsd(unit)} / min`
  return formatUsd(unit)
}

export function isMediaTask(task: TaskId): boolean {
  return task === 'image' || task === 'speech' || task === 'video' || task === 'presentation'
}

export function percentile(rank: number, total: number): number {
  if (total <= 1) return 100
  return Math.round(((total - rank) / (total - 1)) * 100)
}
