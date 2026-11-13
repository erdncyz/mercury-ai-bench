import { useEffect, useState } from 'react'
import type { PromptLang, PromptsPayload } from '../../shared/prompts'
import { loadPrompts } from './usePrompts'

const REFRESH_MS = 10 * 60 * 1000

export function useLibraryPrompts(lang: PromptLang) {
  const [state, setState] = useState<{ lang: PromptLang; data?: PromptsPayload; loading: boolean; error: boolean }>({ lang, loading: true, error: false })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let pending = false
    let lastAttempt = 0
    const refresh = async () => {
      if (pending || controller.signal.aborted) return
      pending = true
      lastAttempt = Date.now()
      setState(prev => ({ ...prev, loading: true }))
      try {
        const data = await loadPrompts('library', 'new', '', lang, 1, controller.signal)
        if (!controller.signal.aborted) setState({ lang, data, loading: false, error: !!data.stale })
      } catch {
        if (!controller.signal.aborted) setState(prev => ({ lang, data: prev.lang === lang ? prev.data : undefined, loading: false, error: true }))
      } finally {
        pending = false
      }
    }
    const onFocus = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastAttempt >= REFRESH_MS) void refresh()
    }
    void refresh()
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, REFRESH_MS)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [lang, revision])

  const active = state.lang === lang ? state : undefined
  return {
    items: active?.data?.items ?? [],
    fetchedAt: active?.data?.fetchedAt,
    loading: active?.loading ?? true,
    error: active?.error ?? false,
    refresh: () => setRevision(value => value + 1),
  }
}
