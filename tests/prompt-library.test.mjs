import assert from 'node:assert/strict'
import { test } from 'node:test'
import { classifyLibraryPrompt } from '../shared/promptLibrary.ts'
import { createPromptsCache, fetchPrompts, handlePromptsRequest, parsePromptsQuery } from '../shared/prompts.ts'

const item = (title, rest = {}) => ({ title, description: null, category: null, tags: [], type: 'TEXT', ...rest })
const query = { section: 'library', sort: 'new', q: '', lang: 'en', page: 1 }
const raw = (id, title, createdAt, rest = {}) => ({ id, title, createdAt, content: `Prompt for ${title}`, ...rest })

test('assigns the twelve fields and distinguishes software architecture from buildings', () => {
  const examples = [
    ['Cinematic street portrait', 'photography'], ['Product photography', 'products'],
    ['Architectural courtyard design', 'architecture'], ['Isometric 3D illustration', 'illustration'],
    ['Video storyboard', 'video'], ['Logo design', 'branding'],
    ['Software architecture review', 'software'], ['UX dashboard design', 'ux'],
    ['SEO content calendar', 'marketing'], ['Startup business plan', 'business'],
    ['Socratic learning tutor', 'learning'], ['Short story writing', 'writing'],
  ]
  for (const [title, category] of examples) assert.equal(classifyLibraryPrompt(item(title)), category, title)
  assert.equal(classifyLibraryPrompt(item('A new entry', { tags: ['photography'] })), 'photography')
  assert.equal(classifyLibraryPrompt(item('A new entry', { category: 'Web Development' })), 'software')
  assert.equal(classifyLibraryPrompt(item('A new entry', { type: 'VIDEO' })), 'video')
  assert.equal(classifyLibraryPrompt(item('Unrelated mystery')), null)
})

test('recognizes the library route without changing the community fallback', () => {
  assert.equal(parsePromptsQuery(new URLSearchParams('section=library')).section, 'library')
  assert.equal(parsePromptsQuery(new URLSearchParams('section=unknown')).section, 'all')
})

test('imports three recent pages, deduplicates and classifies before sorting newest first', async t => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async url => {
    const params = new URL(url).searchParams
    calls.push({ page: params.get('page'), perPage: params.get('perPage') })
    const page = params.get('page')
    const prompts = page === '1'
      ? [raw('new', 'Studio portrait', '2026-11-13'), raw('unknown', 'Unrelated mystery', '2026-11-12')]
      : [raw('old', 'Code review', '2026-11-11'), raw('new', 'Studio portrait', '2026-11-13')]
    return Response.json({ prompts, page: Number(page), total: 4, totalPages: 3 })
  })
  const data = await fetchPrompts(query)
  assert.deepEqual(calls.map(c => c.page).sort(), ['1', '2', '3'])
  assert.ok(calls.every(c => c.perPage === '100'))
  assert.deepEqual(data.items.map(i => i.id), ['new', 'old'])
  assert.deepEqual(data.items.map(i => i.libraryCategory), ['photography', 'software'])
  assert.equal(data.items[0].url, 'https://prompts.chat/prompts/new')
  assert.equal(data.total, 2)
})

test('translation keeps the assigned category and the original prompt text', async t => {
  t.mock.method(globalThis, 'fetch', async url => {
    if (String(url).includes('translate_a')) return Response.json(['Stüdyo portresi'])
    return Response.json({ prompts: [raw('portrait', 'Studio portrait', '2026-11-13')], page: 1 })
  })
  const data = await fetchPrompts({ ...query, lang: 'tr' })
  assert.equal(data.items[0].libraryCategory, 'photography')
  assert.equal(data.items[0].title, 'Stüdyo portresi')
  assert.equal(data.items[0].content, 'Prompt for Studio portrait')
})

test('expired cache refreshes with new entries and falls back to a marked stale snapshot on failure', async t => {
  let generation = 1
  let fail = false
  t.mock.method(globalThis, 'fetch', async () => {
    if (fail) throw new Error('source unavailable')
    return Response.json({ prompts: [raw(`entry-${generation}`, 'Portrait photo', '2026-11-13')], page: 1 })
  })
  const cache = createPromptsCache(-1)
  const params = new URLSearchParams('section=library&lang=en')
  const first = await handlePromptsRequest(params, cache)
  assert.equal(first.body.items[0].id, 'entry-1')
  generation = 2
  const next = await handlePromptsRequest(params, cache)
  assert.equal(next.body.items[0].id, 'entry-2')
  fail = true
  const stale = await handlePromptsRequest(params, cache)
  assert.equal(stale.status, 200)
  assert.equal(stale.body.items[0].id, 'entry-2')
  assert.equal(stale.body.fetchedAt, next.body.fetchedAt)
  assert.equal(stale.body.stale, true)
  const empty = await handlePromptsRequest(params, createPromptsCache(-1))
  assert.equal(empty.status, 502)
})
