export interface SavedPrompt {
  id: string
  title: string
  content: string
  collectionId: string | null
  values: Record<string, string>
  sourceId?: string
  sourceUrl?: string
  truncated?: boolean
}
export interface PromptCollection { id: string; name: string }
export interface PromptWorkspace {
  version: 1
  prompts: SavedPrompt[]
  collections: PromptCollection[]
}
export const WORKSPACE_KEY = 'mercury-prompt-workspace-v1'
export const emptyWorkspace = (): PromptWorkspace => ({ version: 1, prompts: [], collections: [] })
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const text = (x: unknown, max: number): x is string => typeof x === 'string' && x.length <= max

export function parseWorkspace(value: unknown): PromptWorkspace {
  if (!object(value) || value.version !== 1 || !Array.isArray(value.prompts) || !Array.isArray(value.collections)
    || value.prompts.length > 5000 || value.collections.length > 500) throw new Error('Invalid workspace')
  const ids = new Set<string>()
  const collections = value.collections.map((c) => {
    if (!object(c) || !text(c.id, 250) || !c.id || ids.has(c.id) || !text(c.name, 120) || !c.name.trim()) throw new Error('Invalid collection')
    ids.add(c.id)
    return { id: c.id, name: c.name }
  })
  const promptIds = new Set<string>()
  const prompts = value.prompts.map((p): SavedPrompt => {
    if (!object(p) || !text(p.id, 250) || !p.id || promptIds.has(p.id) || !text(p.title, 250) || !p.title.trim()
      || !text(p.content, 100000) || !p.content.trim() || !object(p.values)
      || Object.keys(p.values).length > 200 || !Object.values(p.values).every((v) => text(v, 10000))
      || (p.collectionId !== null && (!text(p.collectionId, 250) || !ids.has(p.collectionId)))
      || (p.sourceId !== undefined && !text(p.sourceId, 250))
      || (p.sourceUrl !== undefined && (!text(p.sourceUrl, 2000) || (p.sourceUrl !== '' && !/^https?:\/\//i.test(p.sourceUrl))))
      || (p.truncated !== undefined && typeof p.truncated !== 'boolean')) throw new Error('Invalid prompt')
    promptIds.add(p.id)
    return { id: p.id, title: p.title, content: p.content, collectionId: p.collectionId,
      values: Object.fromEntries(Object.entries(p.values)) as Record<string, string>,
      ...(p.sourceId !== undefined ? { sourceId: p.sourceId as string } : {}),
      ...(p.sourceUrl !== undefined ? { sourceUrl: p.sourceUrl as string } : {}),
      ...(p.truncated !== undefined ? { truncated: p.truncated as boolean } : {}) }
  })
  return { version: 1, collections, prompts }
}

const PLACEHOLDER = /\{\{\s*([^{}\n]{1,100}?)\s*\}\}|\[([^\]\n[]{1,100})\]/g
export function templateFields(content: string): string[] {
  return [...new Set([...content.matchAll(PLACEHOLDER)].map((match) => (match[1] ?? match[2]).trim()))]
}
export function fillTemplate(content: string, values: Record<string, string>): string {
  return content.replace(PLACEHOLDER, (match, curly: string | undefined, square: string | undefined) => {
    const key = (curly ?? square ?? '').trim()
    return Object.hasOwn(values, key) && values[key].trim() ? values[key] : match
  })
}

/** Imports add entries; conflicts receive fresh IDs so both copies remain recoverable. */
export function mergeWorkspace(current: PromptWorkspace, incoming: PromptWorkspace): PromptWorkspace {
  const collections = [...current.collections]
  const mapping = new Map<string, string>()
  for (const collection of incoming.collections) {
    const existing = collections.find((c) => c.name === collection.name)
    const id = existing?.id ?? crypto.randomUUID()
    mapping.set(collection.id, id)
    if (!existing) collections.push({ ...collection, id })
  }
  const prompts = [...current.prompts]
  for (const prompt of incoming.prompts) {
    const collectionId = prompt.collectionId ? mapping.get(prompt.collectionId)! : null
    const identical = prompts.some((p) => p.title === prompt.title && p.content === prompt.content && p.collectionId === collectionId && JSON.stringify(p.values) === JSON.stringify(prompt.values))
    if (!identical) prompts.push({ ...prompt, id: crypto.randomUUID(), collectionId })
  }
  return parseWorkspace({ version: 1, prompts, collections })
}
