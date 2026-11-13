import type { Config } from '@netlify/functions'
import { benchmarkSnapshot } from '../lib/benchmarksCache'

// Check public benchmark sources daily at 07:10 Türkiye, even without visitors.
export default async () => {
  const snapshot = await benchmarkSnapshot(20 * 60 * 60 * 1000)
  console.log('[benchmarks-refresh]', snapshot.sources.map((s) => `${s.name}: ${s.status}`).join(', '))
}

export const config: Config = { schedule: '10 4 * * *' }
