import type { Config } from '@netlify/functions'
import { newestSnapshot, refreshSnapshot } from '../lib/modelsCache'
import { archiveModels } from '../lib/modelHistory'

// Refreshes the Artificial Analysis snapshot once a day (04:00 UTC = 07:00 Türkiye) so visitors only read the cache.
// Skips when the snapshot is already recent, e.g. after a deploy whose build refreshed the bundled data.
const MIN_AGE_MS = 20 * 60 * 60 * 1000

export default async () => {
  const current = await newestSnapshot()
  await archiveModels(current.payload)
  const age = Date.now() - current.savedAt
  if (age < MIN_AGE_MS) {
    console.log(`[models-refresh] snapshot is ${Math.round(age / 3600000)}h old; skipping`)
    return
  }
  const outcome = await refreshSnapshot()
  console.log(
    outcome.ok
      ? `[models-refresh] refreshed ${outcome.snapshot.payload.data.length} models`
      : `[models-refresh] failed: ${outcome.reason}${outcome.retryAt ? `, retry after ${new Date(outcome.retryAt).toISOString()}` : ''}`,
  )
}

export const config: Config = {
  schedule: '0 4 * * *',
}
