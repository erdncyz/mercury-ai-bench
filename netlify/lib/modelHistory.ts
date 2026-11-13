import { getStore } from '@netlify/blobs'
import { historyPoints, historySnapshot, type HistorySnapshot } from '../../shared/modelHistory'
import type { ModelsPayload } from '../../shared/aaModels'

const store = () => getStore({ name: 'model-history', consistency: 'strong' })

export async function archiveModels(payload: ModelsPayload) {
  const snapshot = historySnapshot(payload)
  if (!snapshot || !Object.keys(snapshot.models).length) return
  try {
    // One immutable observation per UTC day; concurrent requests cannot overwrite it.
    await store().setJSON(`daily/${snapshot.at.slice(0, 10)}`, snapshot, { onlyIfNew: true })
  } catch (error) {
    console.error('[model-history] could not persist observation', error instanceof Error ? error.message : 'storage error')
  }
}

export async function readModelHistory(slug: string, days: number) {
  const historyStore = store()
  const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  const { blobs } = await historyStore.list({ prefix: 'daily/' })
  const keys = blobs.map((b) => b.key).filter((key) => key.slice(6) >= cutoff).sort().slice(-366)
  const snapshots: HistorySnapshot[] = []
  // Keep storage concurrency bounded for a full year of observations.
  for (let i = 0; i < keys.length; i += 12) {
    const batch = await Promise.all(keys.slice(i, i + 12).map((key) => historyStore.get(key, { type: 'json' }) as Promise<HistorySnapshot | null>))
    for (const snapshot of batch) if (snapshot) snapshots.push(snapshot)
  }
  return { points: historyPoints(snapshots, slug, days), available: true }
}
