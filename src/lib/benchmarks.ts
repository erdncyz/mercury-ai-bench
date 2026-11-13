import type { AiModel, BenchmarkResult, ModelEvaluations, SupplementalData, TaskId } from '../types/models'

const AA_URL = 'https://artificialanalysis.ai/'
const definitions: { task: TaskId; key: keyof ModelEvaluations; label: string; unit: BenchmarkResult['unit'] }[] = [
  { task: 'coding', key: 'artificial_analysis_coding_index', label: 'AA Coding Index', unit: 'index' },
  { task: 'coding', key: 'artificial_analysis_engineering_index', label: 'AA Engineering Index', unit: 'index' },
  { task: 'agents', key: 'artificial_analysis_agentic_index', label: 'AA Agentic Index', unit: 'index' },
  { task: 'agents', key: 'tau2', label: 'τ²-Bench', unit: 'fraction' },
  { task: 'agents', key: 'terminalbench_v2_1', label: 'Terminal-Bench 2.1', unit: 'fraction' },
  { task: 'math', key: 'artificial_analysis_math_index', label: 'AA Math Index', unit: 'index' },
  { task: 'intelligence', key: 'artificial_analysis_intelligence_index', label: 'AA Intelligence Index', unit: 'index' },
  { task: 'longcontext', key: 'lcr', label: 'AA Long Context Reasoning', unit: 'fraction' },
  { task: 'instruction', key: 'ifbench', label: 'IFBench', unit: 'fraction' },
]

function aaResults(model: AiModel, evaluations: Partial<ModelEvaluations>, collectedAt: string, historical: boolean, archive = false): BenchmarkResult[] {
  const results: BenchmarkResult[] = []
  for (const definition of definitions) {
    const score = evaluations[definition.key]
    if (typeof score !== 'number' || !Number.isFinite(score)) continue
    results.push({
      id: `aa:${archive ? 'archive' : 'snapshot'}:${collectedAt}:${definition.key}`,
      task: definition.task, source: 'Artificial Analysis', sourceUrl: AA_URL,
      label: definition.label, version: null, score, collectedAt, evaluatedAt: null, historical, unit: definition.unit,
    })
  }
  if (!archive) {
    const task = model.kind === 'image' ? 'image' : model.kind === 'speech' ? 'speech' : model.kind === 'video' ? 'video' : 'speed'
    const score = task === 'speed' ? model.median_output_tokens_per_second : model.elo
    if (score != null && Number.isFinite(score)) results.push({
      id: `aa:snapshot:${collectedAt}:${task}`, task, source: 'Artificial Analysis', sourceUrl: AA_URL,
      label: task === 'speed' ? 'AA Output Speed' : task === 'video' ? 'AA-Video-T2V-Silent v2.1' : `AA ${task === 'image' ? 'Text-to-Image' : 'Text-to-Speech'} Arena`,
      version: null, score, collectedAt, evaluatedAt: null, historical, unit: task === 'speed' ? 'tokens/s' : 'elo',
    })
  }
  return results
}

export function attachArtificialAnalysis(models: AiModel[], collectedAt: string): AiModel[] {
  const historical = !Number.isFinite(Date.parse(collectedAt)) || Date.now() - Date.parse(collectedAt) > 48 * 3600000
  return models.map((model) => ({
    ...model, benchmarks: aaResults(model, model.evaluations, collectedAt, historical),
    pricing: {
      ...model.pricing,
      provenance: model.pricing.provenance ?? { source: 'Artificial Analysis', url: AA_URL, collectedAt, estimated: false },
    },
  }))
}

export function mergeSupplemental(models: AiModel[], supplemental: SupplementalData): AiModel[] {
  // Exact identities only. Never remove effort, date, agent or quantization qualifiers to obtain a price.
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
  const creatorKey = (name: string) => {
    const key = normalize(name)
    const aliases: Record<string, string> = { alibaba: 'qwen', googledeepmind: 'google', mistralai: 'mistral', metallama: 'meta', spacexai: 'xai', kimi: 'moonshotai', moonshot: 'moonshotai' }
    return aliases[key] ?? key
  }
  const candidates = new Map<string, SupplementalData['prices']>()
  for (const price of supplemental.prices) {
    for (const key of new Set([normalize(price.id.split('/').slice(1).join('/')), normalize(price.name.replace(/^[^:]+:\s*/, ''))])) {
      candidates.set(key, [...(candidates.get(key) ?? []), price])
    }
  }
  const external = supplemental.models.map((model) => ({ ...model, benchmarks: model.benchmarks?.map((result) => ({
    ...result, historical: result.historical || !Number.isFinite(Date.parse(result.collectedAt)) || Date.now() - Date.parse(result.collectedAt) > 48 * 3600000,
  })) }))
  return [...models, ...external].map((model) => {
    if (model.kind !== 'language' || model.pricing.price_1m_input_tokens != null || model.pricing.price_1m_output_tokens != null) return model
    const matches = (candidates.get(normalize(model.name)) ?? []).filter((price) => creatorKey(price.id.split('/')[0]) === creatorKey(model.model_creator.name))
    if (matches.length !== 1) return model
    const price = matches[0]
    return {
      ...model, pricing: {
        ...model.pricing, price_1m_input_tokens: price.input, price_1m_output_tokens: price.output,
        price_1m_blended_3_to_1: (3 * price.input + price.output) / 4,
        provenance: { source: 'OpenRouter', url: price.url, collectedAt: price.collectedAt, estimated: false },
      },
    }
  })
}

export function getBenchmarkOptions(models: AiModel[], task: TaskId): BenchmarkResult[] {
  const options = new Map<string, BenchmarkResult>()
  for (const model of models) for (const result of model.benchmarks ?? []) {
    if (result.task === task && Number.isFinite(result.score)) {
      const previous = options.get(result.id)
      if (!previous || (previous.historical && !result.historical) || (previous.historical === result.historical && (result.evaluatedAt ?? '') > (previous.evaluatedAt ?? ''))) options.set(result.id, result)
    }
  }
  const priority = (result: BenchmarkResult) => {
    const source = ['Artificial Analysis', 'LiveBench', 'Terminal-Bench', 'SWE-bench', 'LiveCodeBench'].indexOf(result.source)
    return (result.historical ? 100 : 0) + (source < 0 ? 10 : source)
  }
  return [...options.values()].sort((a, b) => priority(a) - priority(b) || b.collectedAt.localeCompare(a.collectedAt) || a.label.localeCompare(b.label) || b.id.localeCompare(a.id))
}

export function selectBenchmark(models: AiModel[], task: TaskId, id?: string | null): BenchmarkResult | undefined {
  const options = getBenchmarkOptions(models, task)
  return options.find((option) => option.id === id) ?? options[0]
}

export function modelPath(model: AiModel & { benchmark?: BenchmarkResult }, task: TaskId): string {
  return `/model/${model.slug}?task=${task}${model.benchmark ? `&benchmark=${encodeURIComponent(model.benchmark.id)}` : ''}`
}

export function benchmarkDigits(result: BenchmarkResult | undefined, fallback = 1) {
  return result?.unit === 'fraction' ? 3 : result?.unit === 'elo' ? 0 : result?.unit === 'percent' ? 2 : fallback
}
