export type TaskId =
  | 'coding'
  | 'agents'
  | 'vision'
  | 'math'
  | 'intelligence'
  | 'longcontext'
  | 'instruction'
  | 'image'
  | 'video'
  | 'presentation'
  | 'speech'
  | 'speed'

export type SortKey = 'score' | 'price' | 'speed' | 'value'

export type ModelKind = 'language' | 'image' | 'speech' | 'video' | 'presentation'

export interface BenchmarkResult {
  /** A comparable cohort: source, benchmark, version and evaluation configuration. */
  id: string
  task: TaskId
  label: string
  source: string
  sourceUrl: string
  version: string | null
  score: number
  collectedAt: string
  evaluatedAt: string | null
  publishedAt?: string
  historical: boolean
  configuration?: string
  unit: 'index' | 'percent' | 'fraction' | 'elo' | 'tokens/s'
}

export interface SourceStatus {
  id: string
  name: string
  url: string
  status: 'ok' | 'stale' | 'unavailable'
  fetchedAt: string | null
}

export interface SupplementalData {
  models: AiModel[]
  sources: SourceStatus[]
  prices: { id: string; name: string; input: number; output: number; collectedAt: string; url: string }[]
  checkedAt: string
}

export interface ModelCreator {
  id: string
  name: string
  slug?: string
}

export interface ModelEvaluations {
  artificial_analysis_intelligence_index: number | null
  artificial_analysis_coding_index: number | null
  artificial_analysis_math_index: number | null
  /** Headline agentic index. No longer published by AA; only present in legacy snapshots. */
  artificial_analysis_agentic_index?: number | null
  /** Public capability index used when the coding index is unpublished. */
  artificial_analysis_engineering_index?: number | null
  terminalbench_v2_1?: number | null
  tau2?: number | null
  livecodebench?: number | null
  scicode?: number | null
  aime?: number | null
  aime_25?: number | null
  mmlu_pro?: number | null
  gpqa?: number | null
  hle?: number | null
  /** Long context reasoning, 0–1 */
  lcr?: number | null
  /** Instruction following, 0–1 */
  ifbench?: number | null
  terminalbench_hard?: number | null
  math_500?: number | null
}

export interface ModelPricing {
  provenance?: {
    source: string
    url: string
    collectedAt: string | null
    estimated: boolean
  }
  price_1m_blended_3_to_1: number | null
  price_1m_input_tokens: number | null
  price_1m_output_tokens: number | null
  /** Media: USD per 1k images or per 1M characters */
  price_unit?: number | null
  price_unit_label?: 'per_1k_images' | 'per_1m_chars' | 'per_minute' | null
}

export interface AiModel {
  benchmarks?: BenchmarkResult[]
  id: string
  name: string
  slug: string
  kind: ModelKind
  release_date?: string | null
  model_creator: ModelCreator
  evaluations: ModelEvaluations
  pricing: ModelPricing
  median_output_tokens_per_second: number | null
  median_time_to_first_token_seconds: number | null
  median_time_to_first_answer_token?: number | null
  elo?: number | null
  arena_rank?: number | null
  appearances?: number | null
  /** Weights are publicly released. Explicit API flags win; otherwise this is inferred. */
  open_weights: boolean
}

export interface ModelsResponse {
  sources?: SourceStatus[]
  status?: number
  data: AiModel[]
  fetchedAt: string
  source: 'live' | 'cache' | 'fallback'
  tier?: string
  /** Why live data could not be refreshed, when it couldn't. */
  reason?: 'missing-key' | 'rate-limited' | 'upstream-error'
  /** True when `cache` data is older than the refresh window because upstream failed. */
  stale?: boolean
}

export interface CostScenario {
  id: string
  inputTokens: number
  outputTokens: number
}

export interface RankedModel extends AiModel {
  benchmark?: BenchmarkResult
  rank: number
  score: number
  valueScore: number
  requestCost: number
}
