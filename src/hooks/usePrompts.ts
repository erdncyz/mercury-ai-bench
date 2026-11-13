import { useCallback, useEffect, useRef, useState } from 'react'
import type { PromptItem, PromptLang, PromptSort, PromptsPayload } from '../../shared/prompts'

export type { PromptItem, PromptSort, PromptsPayload } from '../../shared/prompts'
export { PROMPT_GROUPS, PROMPT_SECTIONS } from '../../shared/prompts'

const STALE_MS = 10 * 60 * 1000

export async function loadPrompts(
  section: string,
  sort: PromptSort,
  q: string,
  lang: PromptLang,
  page: number,
  signal: AbortSignal,
): Promise<PromptsPayload> {
  const qs = new URLSearchParams({ section, sort, lang, page: String(page) })
  if (q) qs.set('q', q)
  for (const endpoint of ['/api/prompts', '/.netlify/functions/prompts']) {
    try {
      const res = await fetch(`${endpoint}?${qs}`, { signal, headers: { Accept: 'application/json' } })
      if (!res.ok) continue
      const json = (await res.json()) as PromptsPayload
      if (Array.isArray(json.items)) return json
    } catch (err) {
      if (signal.aborted) throw err
    }
  }
  throw new Error('prompts unavailable')
}

export function usePrompts(section: string, sort: PromptSort, q: string, lang: PromptLang) {
  const [items, setItems] = useState<PromptItem[]>([])
  const [meta, setMeta] = useState<Pick<PromptsPayload, 'page' | 'total' | 'totalPages' | 'fetchedAt' | 'source' | 'searchedAs'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const controller = useRef<AbortController | null>(null)
  const lastFetch = useRef(0)

  const fetchFirst = useCallback(
    async (silent: boolean) => {
      controller.current?.abort()
      const ctrl = new AbortController()
      controller.current = ctrl
      if (!silent) setLoading(true)
      try {
        const data = await loadPrompts(section, sort, q, lang, 1, ctrl.signal)
        if (ctrl.signal.aborted) return
        setItems(data.items)
        setMeta(data)
        setError(false)
        lastFetch.current = Date.now()
      } catch {
        if (!ctrl.signal.aborted) setError(true)
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    },
    [section, sort, q, lang],
  )

  useEffect(() => {
    void fetchFirst(false)
    const onFocus = () => {
      if (Date.now() - lastFetch.current > STALE_MS) void fetchFirst(true)
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      controller.current?.abort()
    }
  }, [fetchFirst])

  const loadMore = useCallback(async () => {
    if (!meta || meta.page >= meta.totalPages || loadingMore) return
    const ctrl = controller.current ?? new AbortController()
    setLoadingMore(true)
    try {
      const data = await loadPrompts(section, sort, q, lang, meta.page + 1, ctrl.signal)
      if (ctrl.signal.aborted) return
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...data.items.filter((p) => !seen.has(p.id))]
      })
      setMeta(data)
    } catch {
      if (!ctrl.signal.aborted) setError(true)
    } finally {
      setLoadingMore(false)
    }
  }, [meta, loadingMore, section, sort, q, lang])

  return {
    items,
    total: meta?.total ?? 0,
    hasMore: meta ? meta.page < meta.totalPages : false,
    fetchedAt: meta?.fetchedAt,
    source: meta?.source,
    searchedAs: meta?.searchedAs,
    loading,
    loadingMore,
    error,
    loadMore,
  }
}
