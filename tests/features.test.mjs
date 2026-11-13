import assert from 'node:assert/strict'
import { test } from 'node:test'
import { build } from 'esbuild'

async function load(path) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent' })
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
}
const { recommendModels } = await load('src/lib/recommend.ts')
const { historySnapshot, historyPoints, historyQuery } = await load('shared/modelHistory.ts')
const { parseWorkspace, emptyWorkspace, mergeWorkspace, templateFields, fillTemplate } = await load('src/lib/promptWorkspace.ts')
const model = (id, score, price, speed = 100, open = false) => ({
  id, slug: id, name: id, kind: 'language', open_weights: open,
  model_creator: { id: 'test', name: 'Test' },
  evaluations: { artificial_analysis_coding_index: score, artificial_analysis_intelligence_index: score, artificial_analysis_math_index: null },
  pricing: { price_1m_input_tokens: price, price_1m_output_tokens: price, price_1m_blended_3_to_1: price },
  median_output_tokens_per_second: speed, median_time_to_first_token_seconds: 1,
})
const settings = { task: 'coding', budget: 10, monthlyRequests: 1000, inputTokens: 1000, outputTokens: 1000, priority: 'quality', openOnly: false }

test('recommendations enforce monthly budget, known price, score and open weights', () => {
  const models = [model('expensive', 100, 100), model('eligible', 50, 1, 100, true), model('closed', 80, 2), model('unknown-price', 99, null), model('unknown-score', null, 1)]
  const result = recommendModels(models, { ...settings, openOnly: true })
  assert.deepEqual(result.map((r) => r.model.id), ['eligible'])
  assert.equal(result[0].monthlyCost, 2)
  assert.ok(result.every((r) => r.monthlyCost <= settings.budget))
})
test('speed preference changes recommendations and excludes unmeasured speed', () => {
  const models = [model('quality', 100, 1, 10), model('fast', 70, 1, 1000), model('unknown', 100, 1, null)]
  assert.equal(recommendModels(models, settings)[0].model.id, 'quality')
  assert.equal(recommendModels(models, { ...settings, priority: 'speed' })[0].model.id, 'fast')
  assert.ok(!recommendModels(models, { ...settings, priority: 'speed' }).some((r) => r.model.id === 'unknown'))
})
test('zero-price models are eligible with zero budget and empty results are explicit', () => {
  assert.equal(recommendModels([model('free', 40, 0)], { ...settings, budget: 0 })[0].monthlyCost, 0)
  assert.deepEqual(recommendModels([model('paid', 40, 1)], { ...settings, budget: 0 }), [])
})
test('archive uses actual upstream timestamp and only published metrics', () => {
  const payload = { fetchedAt: '2026-11-12T04:00:00Z', language: [{ slug: 'a', name: 'A', evaluations: { artificial_analysis_engineering_index: 0 }, pricing: { price_1m_input_tokens: 0 } }], image: [{ slug: 'image', name: 'Image', elo: 1200 }], speech: [], data: [] }
  const snapshot = historySnapshot(payload)
  assert.equal(snapshot.at, '2026-11-12T04:00:00.000Z')
  assert.equal(snapshot.models.a.find((m) => m.key === 'engineering').value, 0)
  assert.ok(!snapshot.models.a.some((m) => m.key === 'coding'))
  assert.ok(!snapshot.models.image.some((m) => m.unit === 'usd'))
  assert.equal(historySnapshot({ ...payload, fetchedAt: 'bad' }), null)
})
test('archive separates metric fields and declared versions', () => {
  const payload = { fetchedAt: '2026-11-12T04:00:00Z', language: [{ slug: 'a', benchmark_version: 'v1', evaluations: { artificial_analysis_coding_index: 10, artificial_analysis_engineering_index: 50 } }], image: [], speech: [], data: [] }
  const first = historySnapshot(payload)
  const second = historySnapshot({ ...payload, language: [{ ...payload.language[0], benchmark_version: 'v2' }] })
  assert.notEqual(first.models.a[0].cohort, first.models.a[1].cohort)
  assert.notEqual(first.models.a[0].cohort, second.models.a[0].cohort)
})
test('history filters stale, missing and future points without creating dates', () => {
  const now = Date.parse('2026-11-13T12:00:00Z')
  const snapshots = ['2026-10-01', '2026-11-12', '2026-11-14'].map((day) => ({ at: `${day}T04:00:00Z`, models: { a: [{ key: 'speed', value: 10, unit: 'tokens/s', cohort: 'speed' }] } }))
  assert.equal(historyPoints(snapshots, 'a', 7, now).length, 1)
  assert.deepEqual(historyPoints(snapshots, 'missing', 365, now), [])
  assert.equal(historyQuery(new URL('http://localhost?slug=a&days=999')), null)
  assert.equal(historyQuery(new URL('http://localhost?days=30')), null)
})
test('template fields deduplicate and values are literal, including replacement syntax', () => {
  const content = '{{ project }} [audience] {{project}} [constructor]'
  assert.deepEqual(templateFields(content), ['project', 'audience', 'constructor'])
  assert.equal(fillTemplate(content, { project: '$&', audience: '' }), '$& [audience] $& [constructor]')
})
test('workspace validation rejects malformed imports and unsafe source links', () => {
  const prompt = { id: 'a', title: 'Title', content: 'Hello', values: {}, collectionId: null }
  assert.equal(parseWorkspace({ version: 1, collections: [], prompts: [prompt] }).prompts.length, 1)
  for (const change of [{ collectionId: 'missing' }, { sourceUrl: 'javascript:alert(1)' }, { values: null }, { title: ' ' }]) {
    assert.throws(() => parseWorkspace({ version: 1, collections: [], prompts: [{ ...prompt, ...change }] }))
  }
  assert.throws(() => parseWorkspace({ version: 1, collections: [], prompts: [prompt, prompt] }))
})
test('backup merge preserves current entries and remaps collection conflicts', () => {
  const current = { version: 1, collections: [{ id: 'c', name: 'Work' }], prompts: [{ id: 'a', title: 'Original', content: 'Keep', values: {}, collectionId: 'c' }] }
  const incoming = { version: 1, collections: [{ id: 'c', name: 'Other' }], prompts: [{ id: 'a', title: 'Incoming', content: 'Add', values: {}, collectionId: 'c' }] }
  const merged = mergeWorkspace(current, incoming)
  assert.equal(merged.prompts.length, 2)
  assert.deepEqual(merged.prompts[0], current.prompts[0])
  assert.notEqual(merged.prompts[1].id, 'a')
  assert.notEqual(merged.prompts[1].collectionId, 'c')
  assert.equal(mergeWorkspace(merged, incoming).prompts.length, 2)
  assert.deepEqual(parseWorkspace(emptyWorkspace()), emptyWorkspace())
})

test('fractional task scores are normalized just like index scores', () => {
  const a = { ...model('fractional', 0.8, 1, 100), evaluations: { artificial_analysis_coding_index: 0.8, artificial_analysis_intelligence_index: null, artificial_analysis_math_index: null } }
  const b = { ...model('index', 80, 1, 100), evaluations: { artificial_analysis_coding_index: 80, artificial_analysis_intelligence_index: null, artificial_analysis_math_index: null } }
  assert.equal(recommendModels([a], settings)[0].fit, recommendModels([b], settings)[0].fit)
})
