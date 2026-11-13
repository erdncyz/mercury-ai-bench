import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { refreshSupplemental, SOURCE_TTL_MS } from '../shared/benchmarks/sources.ts'
const path = resolve(import.meta.dirname, '../src/data/benchmark-sources.json')
let previous
try { previous = JSON.parse(readFileSync(path, 'utf8')) } catch { /* first snapshot */ }
if (process.env.REFRESH_BENCHMARKS !== 'force' && Date.now() - Date.parse(previous?.checkedAt ?? '') < SOURCE_TTL_MS) {
  console.log('[benchmarks] Daily snapshot is fresh; no upstream requests.')
} else {
  const result = await refreshSupplemental(previous)
  writeFileSync(path, JSON.stringify(result))
  console.log('[benchmarks]', result.sources.map((s) => `${s.name}: ${s.status}`).join(', '), `(${result.models.length} results, ${result.prices.length} prices)`)
}
