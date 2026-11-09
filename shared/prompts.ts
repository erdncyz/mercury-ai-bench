// Role-based sections over the public prompts.chat API (CC0). Shared by the Netlify function and the Vite dev route.

import { ARCH_TEMPLATES, type ArchTopic, type CuratedPrompt } from './architect/index.ts'
import { IMAGE_EDIT_PROMPTS, type EditStyle } from './imageEditPrompts.ts'

const API = 'https://prompts.chat/api/prompts'
const SITE = 'https://prompts.chat'
const UA = 'mercury-ai-bench/1.0 (+https://github.com)'
const TIMEOUT_MS = 10000
const PER_PAGE = 24
const MAX_CONTENT = 20000

export type PromptSort = 'new' | 'top'
export type PromptGroup = 'featured' | 'software' | 'architecture' | 'design' | 'editing' | 'business' | 'knowledge'

interface SectionFilter {
  /** prompts.chat category id (exact match; parents do not include children). */
  category?: string
  /** Tag slug(s), comma-separated = AND. */
  tag?: string
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SKILL' | 'TASTE'
  /** Default keyword; a user search replaces it but keeps the other filters. */
  q?: string
  trending?: boolean
}

/**
 * Niche sections that one prompts.chat filter can't express: several keyword searches are merged,
 * kept only when the title/description passes `match` (and not `exclude`), then paginated locally.
 */
interface MergedSource {
  queries: string[]
  match: RegExp
  /** Matches that rank above the rest (e.g. drawing-specific terms). */
  strong?: RegExp
  exclude?: RegExp
  /** Keep only these prompt types from the live results (e.g. drop VIDEO). */
  types?: string[]
  /** Mercury-authored prompts pinned above the live results. */
  curated?: CuratedPrompt[]
}

export interface PromptSection {
  id: string
  group: PromptGroup
  label: { en: string; tr: string }
  filter: SectionFilter
  merged?: MergedSource
}

/** One shared prompts.chat pool for every architecture section; each topic filters it with its own pattern. */
const ARCH_POOL_QUERIES = [
  'floor plan',
  'architectural',
  'architect',
  'elevation',
  'facade',
  'site plan',
  'blueprint',
  'technical drawing',
  'interior design',
  'interior',
  'staging',
  'concept brief',
  'building design',
  'house design',
  'building code',
  'renovation',
  'remodel',
  'civil engineer',
  'home inspection',
  'garden design',
  'landscape design',
  'urban design',
  'BIM',
  'autocad',
  'dxf',
  'revit',
  'archicad',
  'sketchup',
  'grasshopper',
]

const ARCH_LIVE: Record<ArchTopic, { match?: RegExp; exclude?: RegExp }> = {
  visual: {
    match:
      /\b(floor ?plans?|architectural (sketch|study|render\w*|visuali[sz]ation|drawings?)|site plans?|elevation design|fa[cç]ade design|(house|building|architectural) blueprints?)\b/i,
  },
  autocad: { match: /\b(autocad|autolisp|dwg|dxf|cad (drawing|file|plan)s?|technical drawings?)\b/i, exclude: /logo/i },
  bim: { match: /\b(bim|revit|archicad|ifc|grasshopper|rhino ?\d*)\b/i, exclude: /subscription/i },
  design: {
    match:
      /\b(architectural (expert|design|concept)|concept (design )?brief builder|building design|house design|architecture (student|tutor|mentor))\b/i,
  },
  technical: {
    match:
      /\b(building codes?|renovation|remodel\w*|civil engineer\w*|contractor quotes?|home inspection|construction (plan|schedule|budget|management)|elevation design)\b/i,
    exclude: /ollama|claude code/i,
  },
  presentation: { match: /\b(architectural study sheet|architecture (portfolio|presentation|competition))\b/i },
  interior: {
    match: /\b(interior design\w*|room makeover|virtual staging|real estate staging|home staging|kitchen remodel\w*)\b/i,
    exclude: /signage/i,
  },
  landscape: {
    match: /\b(landscape (architect\w*|design|plan)|garden (design|plan)|urban (design|planning)|streetscape|planting plan)\b/i,
    exclude: /vegetable/i,
  },
}

const ARCH_EXCLUDE = 'scene concept brief|software|system architect|architectural planning|agent\\b|unity'
const ARCH_STRONG = /\b(floor ?plans?|architectural|elevation|fa[cç]ade|site plans?|autocad|revit|sketchup|archicad|bim)\b/i

function archSource(topics: ArchTopic[]): MergedSource {
  const parts = topics.map((topic) => ARCH_LIVE[topic])
  const matches = parts.flatMap((p) => (p.match ? [p.match.source] : []))
  const excludes = [ARCH_EXCLUDE, ...parts.flatMap((p) => (p.exclude ? [p.exclude.source] : []))]
  // Mechanical part → drawing converters belong to the AutoCAD topic only.
  if (!topics.includes('autocad')) excludes.push('mechanical')
  return {
    queries: ARCH_POOL_QUERIES,
    match: matches.length ? new RegExp(matches.join('|'), 'i') : /$^/,
    strong: ARCH_STRONG,
    exclude: new RegExp(excludes.join('|'), 'i'),
    curated: topics.flatMap((topic) => ARCH_TEMPLATES[topic]),
  }
}

const ARCH_TOPICS: { topic: ArchTopic; label: { en: string; tr: string } }[] = [
  { topic: 'visual', label: { en: '2D → 3D visualization', tr: '2D → 3D görselleştirme' } },
  { topic: 'autocad', label: { en: 'AutoCAD & automation', tr: 'AutoCAD & otomasyon' } },
  { topic: 'bim', label: { en: 'BIM · Revit · parametric', tr: 'BIM · Revit · parametrik' } },
  { topic: 'design', label: { en: 'Concept & design', tr: 'Konsept & tasarım' } },
  { topic: 'technical', label: { en: 'Codes, specs & site', tr: 'Yönetmelik, şartname & şantiye' } },
  { topic: 'presentation', label: { en: 'Presentation & portfolio', tr: 'Sunum & portfolyo' } },
  { topic: 'interior', label: { en: 'Interior design', tr: 'İç mimari' } },
  { topic: 'landscape', label: { en: 'Landscape & urban', tr: 'Peyzaj & kentsel' } },
]

/** Live prompts that edit an uploaded photo rank above plain text-to-image prompts. */
const EDIT_STRONG =
  /\b(edit\w*|transform\w*|photo[- ]to|turn (any|your|this|a|the) (photo|image|picture)|convert\w*|enhanc\w*|restor\w*|retouch\w*|re-?shoots?|regrad\w*|relight\w*|uploaded|reference (image|photo))\b/i

const EDIT_LIVE: Record<EditStyle, { queries: string[]; match: RegExp; exclude?: RegExp; types?: string[] }> = {
  cinematic: {
    queries: ['cinematic portrait', 'cinematic photo', 'film still', 'color grading', 'movie poster', 'anamorphic', 'neo noir'],
    match: /\b(cinematic|film still|movie (still|poster|scene)|colou?r grad\w*|anamorphic|teal (and|&) orange|neo[- ]?noir|director)\b/i,
  },
  bw: {
    queries: ['black and white', 'black-and-white', 'monochrome', 'noir', 'chiaroscuro', 'grayscale', 'sepia'],
    match: /\b(black[- ](and|&)[- ]white|b&w|monochrome|noir|chiaroscuro|gr[ae]yscale|sepia)\b/i,
    exclude: /manga|anime|mosaic|cartoon|sticker/i,
  },
  film: {
    queries: ['film photography', 'analog film', 'vintage photo', 'polaroid', 'kodak', '35mm', 'disposable camera', 'retro photo', 'film look'],
    match:
      /\b(film (photo\w*|look|grain|camera|stock)|analog|35 ?mm|kodak|portra|fuji\w*|polaroid|instant (film|photo)|disposable camera|vintage (photo\w*|film|monochrome|selfie)|retro photo\w*|cinestill|kodachrome|aerochrome|vhs|super ?8|1950s|1960s|1970s|1980s|1990s)\b/i,
  },
  light: {
    queries: ['relight', 'lighting', 'golden hour', 'day to night', 'rain', 'fog', 'season'],
    match:
      /\b(relight\w*|day[- ]to[- ]night|lighting (edit|change|transfer|setup)|(add|change) (the )?(lighting|weather|season|sky)|rembrandt lighting|rim light|volumetric|god rays|photo .{0,30}(golden hour|night|rain|snow|fog))\b/i,
  },
  retouch: {
    queries: ['photo editor', 'photo edit', 'photo restoration', 'retouch', 'enhance photo', 'upscale', 'colorize', 'remove background', 'headshot', 'photo transformation'],
    match:
      /\b(photo (editor|edit\w*|restor\w*|enhanc\w*|transformation|retouch\w*)|retouch\w*|restor(e|ation)|enhance\w*|upscal\w*|colori[sz]\w*|background remov\w*|remove (the )?background|headshot|beautify|skin texture|face identity)\b/i,
    types: ['IMAGE', 'TEXT'],
  },
}

function editSource(styles: EditStyle[]): MergedSource {
  const parts = styles.map((style) => EDIT_LIVE[style])
  const excludes = parts.flatMap((p) => (p.exclude ? [p.exclude.source] : []))
  return {
    queries: [...new Set(parts.flatMap((p) => p.queries))],
    match: new RegExp(parts.map((p) => p.match.source).join('|'), 'i'),
    strong: EDIT_STRONG,
    exclude: excludes.length ? new RegExp(excludes.join('|'), 'i') : undefined,
    types: [...new Set(parts.flatMap((p) => p.types ?? ['IMAGE']))],
    curated: IMAGE_EDIT_PROMPTS.filter((p) => styles.includes(p.style)),
  }
}

const EDIT_STYLES: EditStyle[] = ['cinematic', 'bw', 'film', 'light', 'retouch']

export const PROMPT_GROUPS: { id: PromptGroup; label: { en: string; tr: string } }[] = [
  { id: 'featured', label: { en: 'Featured', tr: 'Öne çıkan' } },
  { id: 'software', label: { en: 'Software', tr: 'Yazılım' } },
  { id: 'architecture', label: { en: 'Architecture', tr: 'Mimarlık' } },
  { id: 'design', label: { en: 'Design', tr: 'Tasarım' } },
  { id: 'editing', label: { en: 'Photo editing', tr: 'Görsel düzenleme' } },
  { id: 'business', label: { en: 'Business', tr: 'İş' } },
  { id: 'knowledge', label: { en: 'Writing & Learning', tr: 'Yazı & Öğrenme' } },
]

export const PROMPT_SECTIONS: PromptSection[] = [
  { id: 'all', group: 'featured', label: { en: 'All', tr: 'Tümü' }, filter: {} },
  { id: 'trending', group: 'featured', label: { en: 'Trending', tr: 'Trend' }, filter: { trending: true } },
  { id: 'skills', group: 'featured', label: { en: 'Agent skills', tr: 'Agent skill’leri' }, filter: { type: 'SKILL' } },
  { id: 'prompt-engineering', group: 'featured', label: { en: 'Prompt engineering', tr: 'Prompt mühendisliği' }, filter: { tag: 'prompt-engineering' } },

  { id: 'software-architect', group: 'software', label: { en: 'Software architect', tr: 'Yazılım mimarı' }, filter: { category: 'cmj1yryoz0005t5albvxi3aw8', q: 'architect' } },
  { id: 'backend', group: 'software', label: { en: 'Backend', tr: 'Backend' }, filter: { tag: 'backend' } },
  { id: 'frontend', group: 'software', label: { en: 'Frontend', tr: 'Frontend' }, filter: { tag: 'frontend' } },
  { id: 'web', group: 'software', label: { en: 'Web development', tr: 'Web geliştirme' }, filter: { category: 'cmj1yryq3000bt5altl8p7ale' } },
  { id: 'mobile', group: 'software', label: { en: 'Mobile', tr: 'Mobil' }, filter: { category: 'cmj1yryq9000dt5alqivduqdl' } },
  { id: 'devops', group: 'software', label: { en: 'DevOps', tr: 'DevOps' }, filter: { tag: 'devops' } },
  { id: 'data', group: 'software', label: { en: 'Data science', tr: 'Veri bilimi' }, filter: { category: 'cmj1yryql000ht5alr7f01abm' } },
  { id: 'database', group: 'software', label: { en: 'Database', tr: 'Veritabanı' }, filter: { tag: 'database' } },
  { id: 'security', group: 'software', label: { en: 'Security', tr: 'Güvenlik' }, filter: { tag: 'security' } },
  { id: 'testing', group: 'software', label: { en: 'QA & testing', tr: 'QA & test' }, filter: { tag: 'testing' } },
  { id: 'code-review', group: 'software', label: { en: 'Code review', tr: 'Kod inceleme' }, filter: { tag: 'code-review' } },
  { id: 'vibe', group: 'software', label: { en: 'Vibe coding', tr: 'Vibe coding' }, filter: { category: 'cmj1zft8z00rovl0r6rdten09' } },

  { id: 'architect', group: 'architecture', label: { en: 'All architecture', tr: 'Tüm mimarlık' }, filter: {}, merged: archSource(ARCH_TOPICS.map((t) => t.topic)) },
  ...ARCH_TOPICS.map(({ topic, label }): PromptSection => ({
    id: `arch-${topic}`,
    group: 'architecture',
    label,
    filter: {},
    merged: archSource([topic]),
  })),

  { id: 'ui-ux', group: 'design', label: { en: 'UI / UX design', tr: 'UI / UX tasarım' }, filter: { category: 'cmmnlanki0004l204gai1zuii' } },
  { id: 'image', group: 'design', label: { en: 'Image generation', tr: 'Görsel üretimi' }, filter: { type: 'IMAGE' } },
  { id: 'video', group: 'design', label: { en: 'Video generation', tr: 'Video üretimi' }, filter: { type: 'VIDEO' } },

  { id: 'image-edit', group: 'editing', label: { en: 'All edits', tr: 'Tüm düzenlemeler' }, filter: {}, merged: editSource(EDIT_STYLES) },
  { id: 'edit-cinematic', group: 'editing', label: { en: 'Cinematic', tr: 'Sinematik' }, filter: {}, merged: editSource(['cinematic']) },
  { id: 'edit-bw', group: 'editing', label: { en: 'Black & white', tr: 'Siyah-beyaz' }, filter: {}, merged: editSource(['bw']) },
  { id: 'edit-film', group: 'editing', label: { en: 'Film & vintage', tr: 'Film & vintage' }, filter: {}, merged: editSource(['film']) },
  { id: 'edit-light', group: 'editing', label: { en: 'Light & atmosphere', tr: 'Işık & atmosfer' }, filter: {}, merged: editSource(['light']) },
  { id: 'edit-retouch', group: 'editing', label: { en: 'Retouch & restore', tr: 'Rötuş & restorasyon' }, filter: {}, merged: editSource(['retouch']) },

  { id: 'business', group: 'business', label: { en: 'Product & management', tr: 'Ürün & yönetim' }, filter: { category: 'cmj1yryph0007t5alosge4z0i' } },
  { id: 'startup', group: 'business', label: { en: 'Startup', tr: 'Girişim' }, filter: { category: 'biz_startup' } },
  { id: 'marketing', group: 'business', label: { en: 'Marketing', tr: 'Pazarlama' }, filter: { category: 'cmj1yryr7000pt5aljkv1cmah' } },
  { id: 'sales', group: 'business', label: { en: 'Sales', tr: 'Satış' }, filter: { category: 'cmj1yryrc000rt5alee2uvobd' } },
  { id: 'hr', group: 'business', label: { en: 'HR & recruiting', tr: 'İK & işe alım' }, filter: { category: 'cmj1yryri000tt5al8anobn1i' } },
  { id: 'finance', group: 'business', label: { en: 'Finance', tr: 'Finans' }, filter: { tag: 'finance' } },

  { id: 'writing', group: 'knowledge', label: { en: 'Writing', tr: 'Yazarlık' }, filter: { category: 'cmj1yrypb0006t5alt679jsqo' } },
  { id: 'technical-writing', group: 'knowledge', label: { en: 'Technical writing', tr: 'Teknik yazım' }, filter: { category: 'cmj1yryr2000nt5al6bi8o5jh' } },
  { id: 'education', group: 'knowledge', label: { en: 'Education', tr: 'Eğitim' }, filter: { category: 'cmj1yrypx0009t5aluzd5g6kk' } },
  { id: 'teaching', group: 'knowledge', label: { en: 'Teaching', tr: 'Öğretmenlik' }, filter: { category: 'edu_teaching' } },
  { id: 'research', group: 'knowledge', label: { en: 'Research & analysis', tr: 'Araştırma & analiz' }, filter: { category: 'prod_research' } },
  { id: 'productivity', group: 'knowledge', label: { en: 'Productivity', tr: 'Verimlilik' }, filter: { category: 'prod_parent' } },
]

export interface PromptItem {
  id: string
  title: string
  description: string | null
  content: string
  contentTruncated: boolean
  type: string
  mediaUrl: string | null
  /** Empty for Mercury-authored prompts (no external page). */
  url: string
  origin: 'prompts.chat' | 'mercury'
  category: string | null
  tags: string[]
  author: { name: string | null; username: string; avatar: string | null } | null
  votes: number
  createdAt: string
  updatedAt: string
  trending: boolean
  featured: boolean
  /** Set when title/description were machine-translated; the originals stay available. */
  original?: { title: string; description: string | null }
}

export type PromptLang = 'en' | 'tr'

export interface PromptsPayload {
  section: string
  sort: PromptSort
  q: string
  lang: PromptLang
  /** English keyword actually sent to prompts.chat when a non-English search was translated. */
  searchedAs?: string
  page: number
  total: number
  totalPages: number
  items: PromptItem[]
  fetchedAt: string
  source: 'live' | 'cache'
}

export interface PromptsQuery {
  section: string
  sort: PromptSort
  q: string
  page: number
  lang: PromptLang
}

export function parsePromptsQuery(params: URLSearchParams): PromptsQuery {
  const sectionParam = params.get('section') ?? 'all'
  const section = PROMPT_SECTIONS.some((s) => s.id === sectionParam) ? sectionParam : 'all'
  const sort: PromptSort = params.get('sort') === 'top' ? 'top' : 'new'
  const q = (params.get('q') ?? '').trim().slice(0, 80)
  const pageNum = Number.parseInt(params.get('page') ?? '1', 10)
  const page = Number.isFinite(pageNum) ? Math.min(Math.max(pageNum, 1), 200) : 1
  const lang: PromptLang = params.get('lang') === 'tr' ? 'tr' : 'en'
  return { section, sort, q, page, lang }
}

export function promptsCacheKey(query: PromptsQuery) {
  return `${query.lang}|${query.section}|${query.sort}|${query.q.toLowerCase()}|${query.page}`
}

// Keyless Google Translate endpoint (unofficial, batch). Failures fall back to the original English text.
// Note: translate.googleapis.com rejects Node's fetch with 429, this endpoint does not.
const TRANSLATE_API = 'https://clients5.google.com/translate_a/t'
const TRANSLATE_TIMEOUT_MS = 8000
const TRANSLATE_CHUNK_CHARS = 8000
const translationCache = new Map<string, string>()

async function googleTranslateBatch(texts: string[], target: string): Promise<{ text: string; detected: string | null }[]> {
  const url = new URL(TRANSLATE_API)
  url.searchParams.set('client', 'dict-chrome-ex')
  url.searchParams.set('sl', 'auto')
  url.searchParams.set('tl', target)
  const body = new URLSearchParams()
  for (const text of texts) body.append('q', text)
  const res = await fetch(url, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
    signal: AbortSignal.timeout(TRANSLATE_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`translate ${res.status}`)
  const json = (await res.json()) as unknown[]
  if (!Array.isArray(json) || json.length !== texts.length) throw new Error('translate: unexpected payload')
  return json.map((entry, i) =>
    Array.isArray(entry)
      ? { text: String(entry[0] ?? '') || texts[i], detected: typeof entry[1] === 'string' ? entry[1] : null }
      : { text: String(entry ?? '') || texts[i], detected: null },
  )
}

/** Translates unique texts in a few batched requests, reusing the in-memory cache. */
async function translateTexts(texts: string[], target: string): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  const missing: string[] = []
  for (const text of new Set(texts)) {
    const hit = translationCache.get(`${target}|${text}`)
    if (hit != null) out.set(text, hit)
    else missing.push(text)
  }
  const chunks: string[][] = []
  let size = 0
  for (const text of missing) {
    if (!chunks.length || size + text.length > TRANSLATE_CHUNK_CHARS) {
      chunks.push([])
      size = 0
    }
    chunks[chunks.length - 1].push(text)
    size += text.length
  }
  const results = await Promise.allSettled(chunks.map((chunk) => googleTranslateBatch(chunk, target)))
  results.forEach((result, c) => {
    if (result.status !== 'fulfilled') return
    chunks[c].forEach((text, i) => {
      const translated = result.value[i].text
      out.set(text, translated)
      translationCache.set(`${target}|${text}`, translated)
    })
  })
  while (translationCache.size > 5000) translationCache.delete(translationCache.keys().next().value as string)
  return out
}

// Recurring prompts.chat terms that machine translation gets wrong.
const GLOSSARY: Partial<Record<PromptLang, [RegExp, string][]>> = {
  tr: [
    [/Konsepti? (Tasarımı |Tasarım )?Kısa Oluşturucu(su)?/gi, 'Konsept $1Brief Oluşturucu'],
    [/yükseklik tasarım/gi, 'görünüş tasarım'],
    [/\bRammed (Dünya|Toprak)\b/g, 'Sıkıştırılmış Toprak'],
    [/\btadı\b/g, 'tercihleri'],
  ],
}

function applyGlossary(text: string, target: PromptLang) {
  return (GLOSSARY[target] ?? []).reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), text)
}

async function translateItems(items: PromptItem[], target: PromptLang): Promise<PromptItem[]> {
  const texts = items
    .filter((item) => item.origin !== 'mercury')
    .flatMap((item) => (item.description ? [item.title, item.description] : [item.title]))
  let translated: Map<string, string>
  try {
    translated = await translateTexts(texts, target)
  } catch {
    return items
  }
  return items.map((item) => {
    if (item.origin === 'mercury') return item
    const title = translated.get(item.title)
    if (!title) return item
    return {
      ...item,
      title: applyGlossary(title, target),
      description: item.description
        ? applyGlossary(translated.get(item.description) ?? item.description, target)
        : null,
      original: { title: item.title, description: item.description },
    }
  })
}

/** prompts.chat content is English: translate non-English searches before querying. */
async function toEnglishQuery(q: string): Promise<string> {
  try {
    const [{ text, detected }] = await googleTranslateBatch([q], 'en')
    return detected && detected !== 'en' ? text.trim() || q : q
  } catch {
    return q
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalize(raw: any): PromptItem {
  const content = typeof raw.content === 'string' ? raw.content : ''
  const author = raw.author
    ? { name: raw.author.name ?? null, username: String(raw.author.username ?? ''), avatar: raw.author.avatar ?? null }
    : null
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    description: raw.description ?? null,
    content: content.slice(0, MAX_CONTENT),
    contentTruncated: content.length > MAX_CONTENT,
    type: String(raw.type ?? 'TEXT'),
    mediaUrl: raw.mediaUrl ?? null,
    url: `${SITE}/prompts/${raw.id}${raw.slug ? `_${raw.slug}` : ''}`,
    origin: 'prompts.chat',
    category: raw.category?.name ?? null,
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: any) => t?.tag?.name).filter(Boolean).slice(0, 6) : [],
    author,
    votes: Number(raw.voteCount ?? raw._count?.votes ?? 0),
    createdAt: String(raw.createdAt),
    updatedAt: String(raw.updatedAt ?? raw.createdAt),
    trending: Boolean(raw.isTrending),
    featured: Boolean(raw.isFeatured),
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function fetchPromptsPage(params: Record<string, string>) {
  const url = new URL(API)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`prompts.chat ${res.status}`)
  const json = (await res.json()) as { prompts?: unknown[]; total?: number; totalPages?: number; page?: number }
  if (!Array.isArray(json.prompts)) throw new Error('prompts.chat: unexpected payload')
  return { ...json, prompts: json.prompts }
}

function curatedItem(prompt: CuratedPrompt, lang: PromptLang): PromptItem {
  return {
    id: prompt.id,
    title: prompt.title[lang],
    description: prompt.description[lang],
    content: prompt.content,
    contentTruncated: false,
    type: prompt.type,
    mediaUrl: null,
    url: '',
    origin: 'mercury',
    category: null,
    tags: prompt.tags,
    author: null,
    votes: 0,
    createdAt: '',
    updatedAt: '',
    trending: false,
    featured: true,
  }
}

const MERGED_TTL_MS = 10 * 60 * 1000
const poolCache = new Map<string, { items: PromptItem[]; expiresAt: number; pending?: Promise<PromptItem[]> }>()

/** Deduped prompts.chat results for a set of keyword searches; shared by every section using the same queries. */
async function loadPool(queries: string[]): Promise<PromptItem[]> {
  const key = queries.join('|')
  const hit = poolCache.get(key)
  if (hit && hit.expiresAt > Date.now()) return hit.items
  if (hit?.pending) return hit.pending
  const pending = (async () => {
    const results = await Promise.allSettled(queries.map((q) => fetchPromptsPage({ q, perPage: '100' })))
    if (results.every((r) => r.status === 'rejected')) {
      if (hit?.items.length) return hit.items
      throw (results[0] as PromiseRejectedResult).reason
    }
    const byId = new Map<string, PromptItem>()
    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      for (const raw of result.value.prompts) {
        const item = normalize(raw)
        byId.set(item.id, item)
      }
    }
    return [...byId.values()]
  })()
  poolCache.set(key, { items: hit?.items ?? [], expiresAt: 0, pending })
  try {
    const items = await pending
    poolCache.set(key, { items, expiresAt: Date.now() + MERGED_TTL_MS })
    return items
  } catch (err) {
    poolCache.delete(key)
    throw err
  }
}

/** All live prompts.chat matches for a merged section, relevance-filtered. */
async function loadMergedLive(source: MergedSource): Promise<PromptItem[]> {
  const pool = await loadPool(source.queries)
  return pool.filter((item) => {
    if (source.types && !source.types.includes(item.type)) return false
    const haystack = `${item.title}\n${item.description ?? ''}`
    return source.match.test(haystack) && !source.exclude?.test(haystack)
  })
}

async function fetchMergedSection(
  section: PromptSection,
  source: MergedSource,
  query: PromptsQuery,
): Promise<PromptsPayload> {
  const live = await loadMergedLive(source)
  const userQuery = query.q && query.lang !== 'en' ? await toEnglishQuery(query.q) : query.q
  const needles = [query.q, userQuery].filter(Boolean).map((q) => q.toLowerCase())
  const matches = (item: PromptItem) =>
    !needles.length ||
    needles.some((needle) =>
      [item.title, item.description ?? '', item.content, ...item.tags].some((field) => field.toLowerCase().includes(needle)),
    )

  const tier = (item: PromptItem) => (source.strong?.test(`${item.title}\n${item.description ?? ''}`) ? 0 : 1)
  const sorted = live
    .filter(matches)
    .sort(
      (a, b) =>
        tier(a) - tier(b) ||
        (query.sort === 'top' ? b.votes - a.votes : 0) ||
        b.createdAt.localeCompare(a.createdAt),
    )
  const curated = (source.curated ?? [])
    .map((prompt) => ({ prompt, item: curatedItem(prompt, query.lang) }))
    .filter(({ prompt, item }) => matches(item) || (needles.length > 0 && matches(curatedItem(prompt, 'en'))))
    .map(({ item }) => item)

  const all = [...curated, ...sorted]
  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE))
  const page = Math.min(query.page, totalPages)
  const items = all.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return {
    section: section.id,
    sort: query.sort,
    q: query.q,
    lang: query.lang,
    searchedAs: userQuery && userQuery.toLowerCase() !== query.q.toLowerCase() ? userQuery : undefined,
    page,
    total: all.length,
    totalPages,
    items: query.lang === 'en' ? items : await translateItems(items, query.lang),
    fetchedAt: new Date().toISOString(),
    source: 'live',
  }
}

export async function fetchPrompts(query: PromptsQuery): Promise<PromptsPayload> {
  const section = PROMPT_SECTIONS.find((s) => s.id === query.section) ?? PROMPT_SECTIONS[0]
  if (section.merged) return fetchMergedSection(section, section.merged, query)

  const { filter } = section
  const params: Record<string, string> = { perPage: String(PER_PAGE), page: String(query.page) }
  if (query.sort === 'top') params.sort = 'upvotes'
  if (filter.category) params.category = filter.category
  if (filter.tag) params.tag = filter.tag
  if (filter.type) params.type = filter.type
  if (filter.trending) params.trending = '1'
  const userQuery = query.q && query.lang !== 'en' ? await toEnglishQuery(query.q) : query.q
  const q = userQuery || filter.q
  if (q) params.q = q

  const json = await fetchPromptsPage(params)
  const items = json.prompts.map(normalize)
  return {
    section: section.id,
    sort: query.sort,
    q: query.q,
    lang: query.lang,
    searchedAs: userQuery && userQuery.toLowerCase() !== query.q.toLowerCase() ? userQuery : undefined,
    page: json.page ?? query.page,
    total: json.total ?? json.prompts.length,
    totalPages: json.totalPages ?? 1,
    items: query.lang === 'en' ? items : await translateItems(items, query.lang),
    fetchedAt: new Date().toISOString(),
    source: 'live',
  }
}

/** Small in-memory TTL cache shared by both server entry points. */
export function createPromptsCache(ttlMs: number, maxEntries = 300) {
  const store = new Map<string, { payload: PromptsPayload; expiresAt: number }>()
  return {
    get(key: string, allowStale = false) {
      const hit = store.get(key)
      if (!hit) return null
      if (!allowStale && hit.expiresAt <= Date.now()) return null
      return hit.payload
    },
    set(key: string, payload: PromptsPayload) {
      store.delete(key)
      store.set(key, { payload, expiresAt: Date.now() + ttlMs })
      while (store.size > maxEntries) store.delete(store.keys().next().value as string)
    },
  }
}

export async function handlePromptsRequest(
  params: URLSearchParams,
  cache: ReturnType<typeof createPromptsCache>,
): Promise<{ status: number; body: PromptsPayload | { error: string } }> {
  const query = parsePromptsQuery(params)
  const key = promptsCacheKey(query)
  const fresh = cache.get(key)
  if (fresh) return { status: 200, body: { ...fresh, source: 'cache' } }
  try {
    const payload = await fetchPrompts(query)
    cache.set(key, payload)
    return { status: 200, body: payload }
  } catch (err) {
    const stale = cache.get(key, true)
    if (stale) return { status: 200, body: { ...stale, source: 'cache' } }
    return { status: 502, body: { error: (err as Error).message } }
  }
}
