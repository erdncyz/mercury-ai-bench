import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'
import { parseCsv, liveBenchRows, liveCodeBenchRows, sweBenchRows, terminalBenchRows, refreshSupplemental } from '../shared/benchmarks/sources.ts'

const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, entries: [] }, appType: 'custom' })
after(() => server.close())
const { attachArtificialAnalysis, mergeSupplemental, getBenchmarkOptions } = await server.ssrLoadModule('/src/lib/benchmarks.ts')
const { rankModels, getValueScore } = await server.ssrLoadModule('/src/lib/ranking.ts')
const { normalizeMediaModel } = await server.ssrLoadModule('/src/lib/normalize.ts')
const { rankedToCsv } = await server.ssrLoadModule('/src/lib/export.ts')
const now = new Date().toISOString()
const model = (id, values = {}) => ({ id, slug: id, name: id, kind: 'language', open_weights: false, model_creator: { id: 'x', name: 'X' }, evaluations: { artificial_analysis_intelligence_index: null, artificial_analysis_math_index: null, artificial_analysis_coding_index: null, ...values }, pricing: { price_1m_input_tokens: 1, price_1m_output_tokens: 3, price_1m_blended_3_to_1: 1.5 }, median_output_tokens_per_second: null, median_time_to_first_token_seconds: null })

test('historical scores never fill current evaluations or outrank a current cohort', () => {
  const current = attachArtificialAnalysis([model('A', { artificial_analysis_engineering_index: 70 }), model('B', { artificial_analysis_engineering_index: 65 })], now)
  const archive = attachArtificialAnalysis([model('A-old', { artificial_analysis_coding_index: 10 }), model('B-old', { artificial_analysis_coding_index: 99 })], '2026-09-18T19:41:02.835Z')
  const merged = [...current, ...archive]
  assert.equal(merged[0].evaluations.artificial_analysis_coding_index, null)
  assert.deepEqual(rankModels(merged, 'coding').map((m) => m.id), ['A', 'B'])
  assert.equal(rankModels(merged, 'coding')[0].benchmark.label, 'AA Engineering Index')
  const archivedTest = getBenchmarkOptions(merged, 'coding').find((b) => b.historical)
  assert.deepEqual(rankModels(merged, 'coding', 'score', 4000, 1000, archivedTest.id).map((m) => m.id), ['B-old', 'A-old'])
})

test('incompatible agent tests do not fill gaps in one another', () => {
  const models = attachArtificialAnalysis([model('tau', { tau2: 0.98 }), model('terminal', { terminalbench_v2_1: 0.60 })], now)
  const options = getBenchmarkOptions(models, 'agents')
  assert.equal(options.length, 2)
  for (const option of options) assert.equal(rankModels(models, 'agents', 'score', 1, 1, option.id).length, 1)
})

test('every model configuration remains in the full leaderboard', () => {
  const models = attachArtificialAnalysis([{ ...model('a', { artificial_analysis_coding_index: 70 }), name: 'Test (high)' }, { ...model('b', { artificial_analysis_coding_index: 65 }), name: 'Test (low)' }], now)
  assert.equal(rankModels(models, 'coding').length, 2)
})

test('zero is a score; unknown score and unknown prices do not become scores or value', () => {
  const models = attachArtificialAnalysis([model('zero', { artificial_analysis_coding_index: 0 }), model('unknown')], now)
  assert.equal(rankModels(models, 'coding').length, 1)
  assert.equal(rankModels(models, 'coding')[0].score, 0)
  assert.equal(getValueScore({ ...models[0], pricing: { price_1m_blended_3_to_1: null } }, 'coding'), null)
})

test('LiveBench uses official category weights and excludes incomplete suites', () => {
  const rows = liveBenchRows('model,coding,agents,reasoning\nA,80,60,90\nB,,99,99\n', { Coding: ['coding'], 'Long Agentic': ['agents'], Reasoning: ['reasoning'], _overall_weights: { Coding: 1.5, 'Long Agentic': 2 } }, '20261106', now)
  assert.equal(rows[0].benchmarks.find((b) => b.task === 'intelligence').score, Number(((80 * 1.5 + 60 * 2 + 90) / 4.5).toFixed(2)))
  assert.equal(rows[1].benchmarks.some((b) => b.task === 'intelligence'), false)
})

test('CSV parser preserves quoted commas, newlines, and zero', () => {
  assert.deepEqual(parseCsv('model,score\r\n"A, ""high""",0\r\n"B\nC",90\n'), [{ model: 'A, "high"', score: '0' }, { model: 'B\nC', score: '90' }])
  assert.throws(() => parseCsv('model,score\n"A,0'))
})

test('LiveCodeBench excludes contaminated models and incomplete problem coverage', () => {
  const start = Date.parse('2024-08-01'), end = Date.parse('2025-05-01')
  const marks = Array(25).fill(start); marks[24] = end
  const rows = liveCodeBenchRows({ date_marks: marks, models: [{ model_repr: 'old', release_date: start - 1 }, { model_repr: 'new', release_date: start + 1 }, { model_repr: 'partial', release_date: start - 1 }], performances: [
    { model: 'old', date: start, question_id: 'a', 'pass@1': 50 }, { model: 'old', date: start, question_id: 'b', 'pass@1': 100 },
    { model: 'new', date: start, question_id: 'a', 'pass@1': 100 }, { model: 'new', date: start, question_id: 'b', 'pass@1': 100 },
    { model: 'partial', date: start, question_id: 'a', 'pass@1': 100 },
  ] }, now)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].benchmarks[0].score, 75)
  assert.equal(rows[0].benchmarks[0].historical, true)
})

test('SWE-bench requires checked results, a fixed harness and one attempt', () => {
  const good = { name: 'A', folder: 'a', checked: true, agent: 'mini-SWE-agent', 'mini-swe-agent_version': '2.0', tags: ['System: Attempts - 1'], resolved: 80, date: now.slice(0, 10) }
  const rows = sweBenchRows({ leaderboards: [{ name: 'Verified', results: [good, { ...good, folder: 'b', checked: false }, { ...good, folder: 'c', agent: 'Other' }, { ...good, folder: 'd', tags: ['System: Attempts - 2+'] }] }] }, now)
  assert.equal(rows.length, 1)
  assert.match(rows[0].benchmarks[0].id, /mini-SWE-agent 2.0/)
})

test('Terminal-Bench parses public JSON without executing scripts', () => {
  const data = { leaderboard: { package: 'terminal-bench/terminal-bench', id: 'test-id', name: '4-1-0', title: 'Terminal-Bench 4.1' }, rows: [{ id: 'a', status: 'display', metadata: { model_display: { label: 'A' }, agent_display: { label: 'Agent' }, reasoning_effort: 'high' }, metrics: { accuracy: 70 } }] }
  const html = `<script>self.__next_f.push([1,${JSON.stringify('1d:' + JSON.stringify(['$', 'x', null, { state: data }]) + '\n')}])</script>`
  const rows = terminalBenchRows(html, now)
  assert.equal(rows[0].name, 'A · Agent (high)')
  assert.equal(rows[0].benchmarks[0].evaluatedAt, null)
  assert.throws(() => terminalBenchRows('<script>doSomething()</script>', now))
})

test('failed sources retain original timestamps and are marked stale', async () => {
  const previous = { models: [{ ...model('livebench:a'), benchmarks: [] }], prices: [], checkedAt: '2026-01-01', sources: [{ id: 'livebench', name: 'LiveBench', url: 'https://livebench.ai/', status: 'ok', fetchedAt: '2026-01-01' }] }
  const updated = await refreshSupplemental(previous, async () => { throw new Error('offline') }, now)
  assert.equal(updated.models[0].id, 'livebench:a')
  assert.equal(updated.sources[0].status, 'stale')
  assert.equal(updated.sources[0].fetchedAt, '2026-01-01')
  assert.equal(updated.sources[1].status, 'unavailable')
})

test('OpenRouter prices require unique exact model identity and preserve qualifiers', () => {
  const nullPrice = { price_1m_input_tokens: null, price_1m_output_tokens: null, price_1m_blended_3_to_1: null }
  const data = { models: [], sources: [], checkedAt: now, prices: [{ id: 'x/model-a', name: 'X: Model A', input: 2, output: 8, collectedAt: now, url: 'https://openrouter.ai/x/model-a' }] }
  const rows = mergeSupplemental([{ ...model('a'), name: 'Model A', pricing: nullPrice }, { ...model('b'), name: 'Model A (high)', pricing: nullPrice }, { ...model('c'), name: 'Model A', model_creator: { id: 'other', name: 'Other' }, pricing: nullPrice }], data)
  assert.equal(rows[0].pricing.price_1m_blended_3_to_1, 3.5)
  assert.equal(rows[0].pricing.provenance.source, 'OpenRouter')
  assert.equal(rows[1].pricing.price_1m_blended_3_to_1, null)
  assert.equal(rows[2].pricing.price_1m_blended_3_to_1, null)
})

test('media price estimates are explicit and published prices take precedence', () => {
  const estimated = normalizeMediaModel({ id: 'i', name: 'Flux 1.1 Pro', elo: 1100 }, 'image')
  assert.equal(estimated.pricing.provenance.estimated, true)
  const actual = normalizeMediaModel({ id: 'i', name: 'Flux 1.1 Pro', pricing: { price_unit: 99, price_unit_label: 'per_1k_images' } }, 'image')
  assert.equal(actual.pricing.price_unit, 99)
  assert.equal(actual.pricing.provenance.estimated, false)
})

test('CSV exports include test identity, timestamps and estimated-price flags', () => {
  const ranked = rankModels(attachArtificialAnalysis([model('A', { artificial_analysis_coding_index: 80 })], now), 'coding')
  const csv = rankedToCsv(ranked)
  assert.match(csv, /benchmark_cohort/)
  assert.match(csv, /price_estimated/)
  assert.match(csv, /AA Coding Index/)
  assert.equal(parseCsv(csv).length, 1)
  assert.equal(parseCsv(csv)[0].score_unit, 'index')
})


test('old supplemental snapshots become historical without changing their retrieval date', () => {
  const previousDate = '2025-01-01T00:00:00.000Z'
  const rows = liveBenchRows('model,coding\nA,80\n', { Coding: ['coding'] }, '20261106', previousDate)
  const merged = mergeSupplemental([], { models: rows, prices: [], sources: [], checkedAt: previousDate })
  assert.equal(merged[0].benchmarks[0].historical, true)
  assert.equal(merged[0].benchmarks[0].collectedAt, previousDate)
})

test('automatic ranking combines different score scales as relative standings', () => {
  const aa = attachArtificialAnalysis([model('A', { artificial_analysis_engineering_index: 80 }), model('B', { artificial_analysis_engineering_index: 40 })], now)
  const external = liveBenchRows('model,coding\nC,10\nD,5\n', { Coding: ['coding'] }, '20261106', now)
  const ranked = rankModels([...aa, ...external], 'coding')
  assert.equal(ranked.length, 4)
  assert.equal(ranked.find((m) => m.id === 'A').score, ranked.find((m) => m.name === 'C').score)
  assert.equal(ranked.find((m) => m.id === 'B').score, ranked.find((m) => m.name === 'D').score)
  assert.ok(ranked.every((m) => m.score >= 0 && m.score <= 100 && m.benchmark.id === 'combined:coding'))
  assert.equal(ranked[0].valueScore, ranked[0].score / ranked[0].pricing.price_1m_blended_3_to_1)
})

test('combined rankings count identical configurations once and keep effort variants', () => {
  const aa = attachArtificialAnalysis([model('a', { artificial_analysis_coding_index: 80 }), model('b', { artificial_analysis_coding_index: 40 }), { ...model('high', { artificial_analysis_coding_index: 70 }), name: 'a (high)' }], now)
  const other = aa.slice(0, 2).map((m) => ({ ...m, id: `other:${m.id}`, benchmarks: m.benchmarks.map((r) => ({ ...r, id: `other:${r.task}`, source: 'Other', label: 'Other test', score: r.score * 10 })) }))
  const ranked = rankModels([...aa, ...other], 'coding')
  assert.equal(ranked.length, 3)
  assert.ok(ranked.some((m) => m.name === 'a (high)'))
})

test('automatic ranking keeps published values for a task with a single test', () => {
  const rows = rankModels(attachArtificialAnalysis([model('A', { artificial_analysis_coding_index: 81.6 }), model('B', { artificial_analysis_coding_index: 70.5 })], now), 'coding')
  assert.equal(rows[0].score, 81.6)
  assert.equal(rows[0].benchmark.label, 'AA Coding Index')
})
