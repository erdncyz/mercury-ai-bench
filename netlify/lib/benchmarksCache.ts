import { getStore } from '@netlify/blobs'
import bundled from '../../src/data/benchmark-sources.json'
import { refreshSupplemental, SOURCE_TTL_MS } from '../../shared/benchmarks/sources.ts'
import type { SupplementalData } from '../../src/types/models.ts'

let memory: SupplementalData = bundled as SupplementalData
let inflight: Promise<SupplementalData> | null = null

export function benchmarkSnapshot(maxAgeMs = SOURCE_TTL_MS): Promise<SupplementalData> {
  inflight ??= (async () => {
    let store: ReturnType<typeof getStore> | undefined
    try {
      store = getStore('benchmark-sources')
      const saved = await store.get('snapshot', { type: 'json' }) as SupplementalData | null
      if (saved && Date.parse(saved.checkedAt) > Date.parse(memory.checkedAt)) memory = saved
    } catch { /* retain bundled snapshot */ }
    const retryMs = memory.sources.some((s) => s.status !== 'ok') ? 3600000 : SOURCE_TTL_MS
    if (Date.now() - Date.parse(memory.checkedAt) < Math.min(maxAgeMs, retryMs)) return memory
    memory = await refreshSupplemental(memory)
    try { await store?.setJSON('snapshot', memory) } catch { /* retain memory */ }
    return memory
  })().finally(() => { inflight = null })
  return inflight
}
