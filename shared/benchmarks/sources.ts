import type { AiModel, BenchmarkResult, SourceStatus, SupplementalData, TaskId } from '../../src/types/models.ts'

export const SOURCE_TTL_MS = 24 * 60 * 60 * 1000
const sourceDefinitions = [
  { id: 'livebench', name: 'LiveBench', url: 'https://livebench.ai/' },
  { id: 'livecodebench', name: 'LiveCodeBench', url: 'https://livecodebench.github.io/leaderboard.html' },
  { id: 'swebench', name: 'SWE-bench', url: 'https://www.swebench.com/' },
  { id: 'terminalbench', name: 'Terminal-Bench', url: 'https://www.tbench.ai/' },
  { id: 'presentbench', name: 'PresentBench', url: 'https://presentbench.github.io/' },
  { id: 'openrouter', name: 'OpenRouter', url: 'https://openrouter.ai/models' },
] as const

type Row = Record<string, any>
type Fetcher = typeof fetch

async function read(url: string, fetcher: Fetcher, json = true): Promise<any> {
  const response = await fetcher(url, { signal: AbortSignal.timeout(15000), headers: { Accept: json ? 'application/json' : 'text/html,text/csv,text/javascript', 'User-Agent': 'Mercury-AI-Bench/1.0' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return json ? response.json() : response.text()
}

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = [], value = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++ } else quoted = !quoted
    } else if (char === ',' && !quoted) { row.push(value); value = '' }
    else if (char === '\n' && !quoted) { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = '' }
    else value += char
  }
  if (quoted) throw new Error('Unterminated CSV field')
  if (value || row.length) { row.push(value.replace(/\r$/, '')); rows.push(row) }
  const headers = rows.shift() ?? []
  return rows.filter((r) => r.length === headers.length).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]])))
}

function number(value: unknown): number | null {
  if (value == null || value === '' || typeof value === 'boolean') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function old(date: string | null, now: string) {
  return date != null && Date.parse(now) - Date.parse(date) > 180 * 86400000
}

function entry(source: string, key: string, name: string, creator: string, results: BenchmarkResult[], open = false): AiModel {
  return {
    id: `${source}:${key}`, slug: `${source}--${encodeURIComponent(key).replace(/%/g, '_')}`,
    name, kind: 'language', model_creator: { id: creator, name: creator },
    evaluations: { artificial_analysis_intelligence_index: null, artificial_analysis_coding_index: null, artificial_analysis_math_index: null },
    pricing: { price_1m_input_tokens: null, price_1m_output_tokens: null, price_1m_blended_3_to_1: null },
    median_output_tokens_per_second: null, median_time_to_first_token_seconds: null,
    open_weights: open, benchmarks: results,
  }
}

function result(source: string, sourceUrl: string, task: TaskId, label: string, version: string, score: number, collectedAt: string, extras: Partial<BenchmarkResult> = {}): BenchmarkResult {
  return { id: `${source}:${version}:${task}`, source, sourceUrl, task, label, version, score, collectedAt, evaluatedAt: null, historical: false, unit: 'percent', ...extras }
}

const organizations: Record<string, string> = {
  claude: 'Anthropic', gpt: 'OpenAI', gemini: 'Google', gemma: 'Google', deepseek: 'DeepSeek',
  qwen: 'Alibaba', grok: 'xAI', kimi: 'Moonshot AI', glm: 'Z AI', minimax: 'MiniMax',
  mistral: 'Mistral', muse: 'Meta', inkling: 'Thinking Machines', mimo: 'Xiaomi', nemotron: 'NVIDIA',
}
function organization(name: string) {
  return Object.entries(organizations).find(([prefix]) => name.toLowerCase().startsWith(prefix))?.[1] ?? 'Unknown'
}

export function liveBenchRows(csv: string, categories: Record<string, string[] | Record<string, number>>, release: string, now: string, legacy = false): AiModel[] {
  const suites = Object.entries(categories).filter(([, columns]) => Array.isArray(columns)) as [string, string[]][]
  const weights = (categories._overall_weights ?? {}) as Record<string, number>
  const date = release.length === 8 ? `${release.slice(0, 4)}-${release.slice(4, 6)}-${release.slice(6, 8)}` : release
  return parseCsv(csv).flatMap((row) => {
    if (!row.model) return []
    const averages = new Map(suites.map(([name, columns]) => {
      // A partial suite must not be compared to a complete suite.
      const scores = columns.map((column) => number(row[column]))
      return [name, scores.every((score) => score != null && score >= 0 && score <= 100) ? scores.reduce((a, b) => a! + b!, 0)! / scores.length : null]
    }))
    const version = `${legacy ? 'v1' : 'v2'} / ${date}`
    const scores: BenchmarkResult[] = []
    const mapping: [string, TaskId][] = legacy
      ? [['Mathematics', 'math'], ['IF', 'instruction']]
      : [['Coding', 'coding'], ['Long Agentic', 'agents']]
    for (const [category, task] of mapping) {
      const score = averages.get(category)
      if (score != null) scores.push(result('LiveBench', 'https://livebench.ai/', task, `LiveBench ${category}`, version, score, now, { historical: legacy, configuration: `Release ${date}; published model configuration` }))
    }
    if (!legacy && suites.length && [...averages.values()].every((v) => v != null)) {
      const totalWeight = suites.reduce((sum, [name]) => sum + (number(weights[name]) ?? 1), 0)
      const overall = suites.reduce((sum, [name]) => sum + averages.get(name)! * (number(weights[name]) ?? 1), 0) / totalWeight
      scores.push(result('LiveBench', 'https://livebench.ai/', 'intelligence', 'LiveBench Overall', version, Number(overall.toFixed(2)), now, { configuration: 'Official category weights; complete suites only' }))
    }
    return scores.length ? [entry('livebench', `${release}-${row.model}`, row.model, organization(row.model), scores)] : []
  })
}

async function livebench(fetcher: Fetcher, now: string) {
  const html = await read('https://livebench.ai/', fetcher, false)
  const script = html.match(/src="([^"]*\/main\.[^"]+\.js)"/)?.[1]
  if (!script) throw new Error('LiveBench script not found')
  const js = await read(new URL(script, 'https://livebench.ai/').href, fetcher, false)
  const releases = [...js.matchAll(/\["(20\d{6})"(?:,"20\d{6}")*\]/g)].flatMap((m: RegExpMatchArray) => m[0].match(/20\d{6}/g) ?? []).sort()
  const release = releases.at(-1)
  if (!release) throw new Error('LiveBench release not found')
  const [csv, categories, legacyCsv, legacyCategories] = await Promise.all([
    read(`https://livebench.ai/data/${release}/table.csv`, fetcher, false),
    read(`https://livebench.ai/data/${release}/categories.json`, fetcher),
    read('https://livebench.ai/v1/table_2026_06_25.csv', fetcher, false),
    read('https://livebench.ai/v1/categories_2026_06_25.json', fetcher),
  ])
  return [...liveBenchRows(csv, categories, release, now), ...liveBenchRows(legacyCsv, legacyCategories, '2026-06-25', now, true)]
}

export function liveCodeBenchRows(data: Row, now: string): AiModel[] {
  if (!Array.isArray(data.date_marks) || !Array.isArray(data.models) || !Array.isArray(data.performances)) throw new Error('Invalid LiveCodeBench schema')
  const marks = [...data.date_marks].sort((a, b) => a - b)
  const start = marks[marks.length > 12 ? 15 : 4], end = marks.at(-1)
  if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error('Invalid LiveCodeBench window')
  const startDate = new Date(start).toISOString().slice(0, 10), endDate = new Date(end).toISOString().slice(0, 10)
  const records = data.performances.filter((p: Row) => p.date >= start && p.date <= end && number(p['pass@1']) != null)
  const byModel = new Map<string, Row[]>()
  for (const record of records) byModel.set(record.model, [...(byModel.get(record.model) ?? []), record])
  // Every ranked model must be evaluated on the same problems in this window.
  const questions = new Set(records.map((p: Row) => p.question_id))
  return data.models.flatMap((model: Row) => {
    const rows = byModel.get(model.model_repr) ?? []
    if (!Number.isFinite(model.release_date) || model.release_date >= start || rows.length !== questions.size || new Set(rows.map((r) => r.question_id)).size !== questions.size) return []
    const score = rows.reduce((sum, r) => sum + Number(r['pass@1']), 0) / rows.length
    if (score < 0 || score > 100) return []
    const r = result('LiveCodeBench', 'https://livecodebench.github.io/leaderboard.html', 'coding', 'LiveCodeBench Pass@1', `${startDate} → ${endDate}`, score, now, { historical: old(endDate, now), configuration: `${questions.size} identical problems; releases before window only` })
    return [entry('livecodebench', model.model_repr, model.model_repr, organization(model.model_repr), [r])]
  })
}

export function sweBenchRows(data: Row, now: string): AiModel[] {
  const rows = data.leaderboards?.find((board: Row) => board.name === 'Verified')?.results
  if (!Array.isArray(rows)) throw new Error('Missing SWE-bench Verified results')
  return rows.flatMap((row: Row) => {
    const version = row['mini-swe-agent_version']
    const score = number(row.resolved)
    if (row.checked !== true || row.agent !== 'mini-SWE-agent' || !version || !row.tags?.includes('System: Attempts - 1') || score == null || score < 0 || score > 100) return []
    const r = result('SWE-bench', 'https://www.swebench.com/', 'coding', 'SWE-bench Verified', `Verified / mini-SWE-agent ${version} / 1 attempt`, score, now, { evaluatedAt: null, publishedAt: row.date ?? undefined, historical: old(row.date, now), configuration: `mini-SWE-agent ${version}; 1 attempt; checked by SWE-bench` })
    return [entry('swebench', row.folder, row.name, row.model_org ?? organization(row.name), [r], row.os_model === true)]
  })
}

export function terminalBenchRows(html: string, now: string): AiModel[] {
  let payload: Row | undefined
  function visit(value: any) {
    if (!value || typeof value !== 'object') return
    if (value.leaderboard?.package === 'terminal-bench/terminal-bench' && Array.isArray(value.rows)) payload = value
    else for (const child of Object.values(value)) visit(child)
  }
  // Decode the public server-rendered JSON; never execute page scripts.
  for (const match of html.matchAll(/self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)/g)) {
    for (const line of JSON.parse(match[1]).split('\n')) {
      try { visit(JSON.parse(line.slice(line.indexOf(':') + 1))) } catch { /* non-JSON RSC record */ }
    }
  }
  if (!payload) throw new Error('Terminal-Bench public results not found')
  const { leaderboard, rows } = payload
  return rows.flatMap((row: Row) => {
    const score = number(row.metrics?.accuracy)
    if (row.status !== 'display' || score == null || score < 0 || score > 100) return []
    const model = row.metadata?.model_display?.label, agent = row.metadata?.agent_display?.label
    if (!model || !agent) return []
    const effort = row.metadata.reasoning_effort
    const r = result('Terminal-Bench', 'https://www.tbench.ai/', 'agents', leaderboard.title, `${leaderboard.name} / ${leaderboard.id}`, score, now, { evaluatedAt: null, configuration: `${agent}${effort ? ` / ${effort}` : ''}; model + agent result` })
    return [entry('terminalbench', row.id, `${model} · ${agent}${effort ? ` (${effort})` : ''}`, row.metadata.model_org?.label ?? 'Unknown', [r])]
  })
}

export function presentBenchRows(html: string, now: string): AiModel[] {
  const table = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)]
    .find((match) => /Academia/.test(match[1]) && /Total/.test(match[1]))?.[1]
  if (!table) throw new Error('PresentBench leaderboard not found')
  const creators: Record<string, string> = {
    'hwc-mmi-aippt': 'Huawei', NotebookLM: 'Google', 'Manus 1.6': 'Manus',
    Tiangong: 'Kunlun', Zhipu: 'Z AI', 'PPTAgent v2': 'PPTAgent', Gamma: 'Gamma', Doubao: 'ByteDance', Qwen: 'Alibaba',
  }
  return [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].flatMap((row) => {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)]
      .map((cell) => cell[1].replace(/<[^>]*>/g, '').trim())
    const score = number(cells[1]), testedAt = cells[8]
    if (cells.length !== 9 || !cells[0] || score == null || score < 0 || score > 100 || !/^20\d{2}-\d{2}$/.test(testedAt)) return []
    const benchmark = result('PresentBench', 'https://presentbench.github.io/', 'presentation', 'PresentBench Total', '238 instances / published leaderboard', score, now, {
      evaluatedAt: testedAt, historical: true,
      configuration: 'End-to-end slide generation systems; 238 instances; mean of five evaluation dimensions; published 2026 evaluations',
    })
    return [{ ...entry('presentbench', cells[0], cells[0], creators[cells[0]] ?? organization(cells[0]), [benchmark]), kind: 'presentation' as const }]
  })
}

export async function refreshSupplemental(previous?: SupplementalData, fetcher: Fetcher = fetch, now = new Date().toISOString()): Promise<SupplementalData> {
  const loaders = [
    () => livebench(fetcher, now),
    async () => liveCodeBenchRows(await read('https://livecodebench.github.io/performances_generation.json', fetcher), now),
    async () => sweBenchRows(await read('https://raw.githubusercontent.com/SWE-bench/swe-bench.github.io/master/data/leaderboards.json', fetcher), now),
    async () => terminalBenchRows(await read('https://www.tbench.ai/', fetcher, false), now),
    async () => presentBenchRows(await read('https://presentbench.github.io/', fetcher, false), now),
  ]
  const models: AiModel[] = [], sources: SourceStatus[] = []
  let prices: SupplementalData['prices'] = previous?.prices ?? []
  const outcomes = await Promise.allSettled([...loaders.map((load) => load()), read('https://openrouter.ai/api/v1/models', fetcher)])
  outcomes.forEach((outcome, index) => {
    const definition = sourceDefinitions[index]
    const oldSource = previous?.sources.find((s) => s.id === definition.id)
    let valid = false
    if (outcome.status === 'fulfilled') {
      if (index === loaders.length) {
        const rows = outcome.value.data
        if (Array.isArray(rows)) {
          const parsed = rows.flatMap((row: Row) => {
            const input = number(row.pricing?.prompt), output = number(row.pricing?.completion)
            if (typeof row.id !== 'string' || !row.name || input == null || output == null || input < 0 || output < 0) return []
            // Per-request or conditional prices cannot be represented by the simple token calculator.
            if ((number(row.pricing.request) ?? 0) !== 0 || row.pricing.overrides?.length) return []
            return [{ id: row.id, name: row.name, input: input * 1e6, output: output * 1e6, collectedAt: now, url: `https://openrouter.ai/${row.id}` }]
          })
          if (parsed.length) { prices = parsed; valid = true }
        }
      } else if (Array.isArray(outcome.value) && outcome.value.length) { models.push(...outcome.value); valid = true }
    }
    if (!valid && index < loaders.length) models.push(...(previous?.models.filter((m) => m.id.startsWith(`${definition.id}:`)) ?? []))
    sources.push({ ...definition, status: valid ? 'ok' : oldSource?.fetchedAt ? 'stale' : 'unavailable', fetchedAt: valid ? now : oldSource?.fetchedAt ?? null })
  })
  return { models, prices, sources, checkedAt: now }
}
