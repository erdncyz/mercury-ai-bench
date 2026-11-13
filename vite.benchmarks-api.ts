import type { Plugin } from 'vite'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { refreshSupplemental, SOURCE_TTL_MS } from './shared/benchmarks/sources.ts'
import type { SupplementalData } from './src/types/models.ts'

export function benchmarksApiPlugin(): Plugin {
  let inflight: Promise<SupplementalData> | null = null
  return {
    name: 'mercury-benchmarks-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/benchmarks') return next()
        const path = resolve(server.config.root, '.cache/mercury/benchmarks.json')
        async function respond() {
          const candidates: SupplementalData[] = []
          for (const file of [path, resolve(server.config.root, 'src/data/benchmark-sources.json')]) {
            try { candidates.push(JSON.parse(readFileSync(file, 'utf8'))) } catch { /* use bundled data */ }
          }
          const previous = candidates.sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt))[0]
          const retryMs = previous?.sources.some((s) => s.status !== 'ok') ? 60 * 60 * 1000 : SOURCE_TTL_MS
          if (Date.now() - Date.parse(previous?.checkedAt ?? '') < retryMs) return previous
          const result = await refreshSupplemental(previous)
          mkdirSync(dirname(path), { recursive: true })
          writeFileSync(path, JSON.stringify(result))
          return result
        }
        inflight ??= respond().finally(() => { inflight = null })
        try {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(await inflight))
        } catch {
          res.statusCode = 503
          res.end(JSON.stringify({ error: 'Benchmark sources unavailable' }))
        }
      })
    },
  }
}
