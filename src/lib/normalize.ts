import type { AiModel, ModelEvaluations, ModelKind } from '../types/models'
import { lookupMediaPrice } from '../data/media-prices'
import { resolveOpenWeights } from './openWeights'

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function creator(raw: Record<string, unknown> | undefined) {
  return {
    id: String(raw?.id ?? 'unknown'),
    name: String(raw?.name ?? 'Unknown'),
    slug: raw?.slug ? String(raw.slug) : undefined,
  }
}

/** AA blended 3:1 is (3 × input + output) / 4. Free responses omit the precomputed field. */
function blendedPrice(pricing: Record<string, unknown>): number | null {
  const published = asNumber(pricing.price_1m_blended_3_to_1)
  if (published != null) return published
  const input = asNumber(pricing.price_1m_input_tokens)
  const output = asNumber(pricing.price_1m_output_tokens)
  if (input == null || output == null) return null
  return (3 * input + output) / 4
}

function performanceOf(raw: Record<string, unknown>) {
  const perf = (raw.performance ?? {}) as Record<string, unknown>
  return {
    median_output_tokens_per_second:
      asNumber(perf.median_output_tokens_per_second) ??
      asNumber(raw.median_output_tokens_per_second),
    median_time_to_first_token_seconds:
      asNumber(perf.median_time_to_first_token_seconds) ??
      asNumber(raw.median_time_to_first_token_seconds),
    median_time_to_first_answer_token:
      asNumber(perf.median_time_to_first_answer_token_seconds) ??
      asNumber(perf.median_time_to_first_answer_token) ??
      asNumber(raw.median_time_to_first_answer_token),
  }
}

export function normalizeLanguageModel(raw: Record<string, unknown>): AiModel {
  const evaluations = (raw.evaluations ?? {}) as Record<string, unknown>
  const pricing = (raw.pricing ?? {}) as Record<string, unknown>
  const name = String(raw.name)
  const modelCreator = creator(raw.model_creator as Record<string, unknown>)
  return {
    id: String(raw.id),
    name,
    slug: String(raw.slug ?? raw.id),
    kind: 'language',
    release_date: raw.release_date ? String(raw.release_date) : null,
    model_creator: modelCreator,
    open_weights: resolveOpenWeights(raw, name, modelCreator.name),
    evaluations: {
      artificial_analysis_intelligence_index: asNumber(
        evaluations.artificial_analysis_intelligence_index,
      ),
      artificial_analysis_coding_index: asNumber(
        evaluations.artificial_analysis_coding_index,
      ),
      artificial_analysis_math_index: asNumber(
        evaluations.artificial_analysis_math_index,
      ),
      artificial_analysis_agentic_index: asNumber(
        evaluations.artificial_analysis_agentic_index,
      ),
      artificial_analysis_engineering_index: asNumber(
        evaluations.artificial_analysis_engineering_index,
      ),
      terminalbench_v2_1: asNumber(evaluations.terminalbench_v2_1),
      // The Nov 2026 v2 API renamed several benchmark fields.
      tau2: asNumber(evaluations.tau2) ?? asNumber(evaluations.tau2_telecom),
      livecodebench: asNumber(evaluations.livecodebench),
      scicode: asNumber(evaluations.scicode),
      aime: asNumber(evaluations.aime),
      aime_25: asNumber(evaluations.aime_25),
      mmlu_pro: asNumber(evaluations.mmlu_pro),
      gpqa: asNumber(evaluations.gpqa) ?? asNumber(evaluations.gpqa_diamond),
      hle: asNumber(evaluations.hle),
      lcr: asNumber(evaluations.lcr) ?? asNumber(evaluations.aa_lcr),
      ifbench: asNumber(evaluations.ifbench),
      terminalbench_hard: asNumber(evaluations.terminalbench_hard),
      math_500: asNumber(evaluations.math_500),
    },
    pricing: {
      price_1m_blended_3_to_1: blendedPrice(pricing),
      price_1m_input_tokens: asNumber(pricing.price_1m_input_tokens),
      price_1m_output_tokens: asNumber(pricing.price_1m_output_tokens),
    },
    ...performanceOf(raw),
  }
}

export function normalizeMediaModel(
  raw: Record<string, unknown>,
  kind: Extract<ModelKind, 'image' | 'speech'>,
): AiModel {
  const name = String(raw.name)
  const slug = String(raw.slug ?? raw.id)
  const hint = lookupMediaPrice(name, slug, kind)
  const elo = asNumber(raw.elo)

  const modelCreator = creator(raw.model_creator as Record<string, unknown>)
  return {
    id: String(raw.id),
    name,
    slug,
    kind,
    release_date: raw.release_date ? String(raw.release_date) : null,
    model_creator: modelCreator,
    open_weights: resolveOpenWeights(raw, name, modelCreator.name),
    evaluations: {
      artificial_analysis_intelligence_index: null,
      artificial_analysis_coding_index: null,
      artificial_analysis_math_index: null,
    },
    pricing: {
      price_1m_blended_3_to_1: hint?.price ?? null,
      price_1m_input_tokens: null,
      price_1m_output_tokens: null,
      price_unit: hint?.price ?? null,
      price_unit_label: hint?.label ?? null,
    },
    median_output_tokens_per_second: null,
    median_time_to_first_token_seconds: null,
    elo,
    arena_rank: asNumber(raw.rank),
    appearances: asNumber(raw.appearances),
  }
}

export type LegacyEvaluations = Record<string, Partial<Record<keyof ModelEvaluations, number>>>

/**
 * Artificial Analysis stopped publishing the Math and Agentic indices (and per-benchmark
 * scores on the free tier). Fill those gaps from the last snapshot that had them, keyed by
 * the stable model id; live values always win.
 */
export function applyLegacyEvaluations(models: AiModel[], legacy: LegacyEvaluations): AiModel[] {
  return models.map((model) => {
    const old = model.kind === 'language' ? legacy[model.id] : undefined
    if (!old) return model
    const evaluations = { ...model.evaluations }
    for (const [key, value] of Object.entries(old) as [keyof ModelEvaluations, number][]) {
      if (evaluations[key] == null) evaluations[key] = value
    }
    return { ...model, evaluations }
  })
}

export function normalizeIncomingModels(payload: unknown): AiModel[] {
  if (!payload || typeof payload !== 'object') return []
  const obj = payload as Record<string, unknown>

  if (Array.isArray(obj.language) || Array.isArray(obj.image) || Array.isArray(obj.speech)) {
    const language = Array.isArray(obj.language)
      ? obj.language.map((m) => normalizeLanguageModel(m as Record<string, unknown>))
      : []
    const image = Array.isArray(obj.image)
      ? obj.image.map((m) =>
          normalizeMediaModel(m as Record<string, unknown>, 'image'),
        )
      : []
    const speech = Array.isArray(obj.speech)
      ? obj.speech.map((m) =>
          normalizeMediaModel(m as Record<string, unknown>, 'speech'),
        )
      : []
    return [...language, ...image, ...speech]
  }

  if (Array.isArray(obj.data)) {
    return obj.data.map((m) => {
      const row = m as Record<string, unknown>
      if (row.kind === 'image') return normalizeMediaModel(row, 'image')
      if (row.kind === 'speech') return normalizeMediaModel(row, 'speech')
      if (row.evaluations) return normalizeLanguageModel(row)
      if (typeof row.elo === 'number') {
        return normalizeMediaModel(row, 'image')
      }
      return normalizeLanguageModel(row)
    })
  }

  return []
}
