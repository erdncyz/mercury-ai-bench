import type { Plugin } from 'vite'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { historyPoints, historyQuery, historySnapshot, type HistorySnapshot } from './shared/modelHistory.ts'
import { dirname, resolve } from 'node:path'
import {
  fallbackPayload,
  fetchModels,
  payloadAgeMs,
  SNAPSHOT_TTL_MS,
  type FailureReason,
  type ModelsPayload,
} from './shared/aaModels.ts'

// Same daily budget as the Netlify function. Stored in <root>/.cache (not node_modules) so npm installs
// and dev restarts keep the snapshot instead of spending quota again.

interface DevCache {
  snapshot?: { payload: ModelsPayload; savedAt: number }
  freeOnly?: boolean
  cooldownUntil?: number
  lastReason?: FailureReason
}

function loadEnvKey(root: string): string | undefined {
  if (process.env.ARTIFICIAL_ANALYSIS_API_KEY) {
    return process.env.ARTIFICIAL_ANALYSIS_API_KEY
  }
  try {
    const text = readFileSync(resolve(root, '.env'), 'utf8')
    return text.match(/^ARTIFICIAL_ANALYSIS_API_KEY=(.+)$/m)?.[1]?.trim()
  } catch {
    return undefined
  }
}

export function devModelsCachePath(root: string) {
  return resolve(root, '.cache/mercury/aa-models.json')
}

const LEGACY_CACHE = 'node_modules/.cache/mercury/aa-models.json'

function readCache(root: string): DevCache {
  const path = devModelsCachePath(root)
  const source = existsSync(path) ? path : resolve(root, LEGACY_CACHE)
  try {
    return JSON.parse(readFileSync(source, 'utf8')) as DevCache
  } catch {
    return {}
  }
}

function writeCache(root: string, cache: DevCache) {
  try {
    const path = devModelsCachePath(root)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, JSON.stringify(cache))
  } catch {
    // dev-only cache; ignore write failures
  }
}

/** Newest of the dev snapshot and the bundled fallback (refreshed by `npm run build`). */
function newestSnapshot(root: string, cache: DevCache) {
  let bundled: { payload: ModelsPayload; savedAt: number; bundled: true } | null = null
  try {
    const payload = fallbackPayload(JSON.parse(readFileSync(resolve(root, 'src/data/fallback-models.json'), 'utf8')))
    bundled = { payload, savedAt: Date.now() - payloadAgeMs(payload), bundled: true }
  } catch {
    // no bundled data
  }
  if (cache.snapshot && (!bundled || cache.snapshot.savedAt >= bundled.savedAt)) {
    return { ...cache.snapshot, bundled: false }
  }
  return bundled
}

async function respond(root: string) {
  const now = Date.now()
  const cache = readCache(root)
  const snapshot = newestSnapshot(root, cache)
  if (snapshot && now - snapshot.savedAt < SNAPSHOT_TTL_MS) {
    return { ...snapshot.payload, source: 'cache', nextRefreshAt: snapshot.savedAt + SNAPSHOT_TTL_MS }
  }

  const stale = (reason: FailureReason, retryAt?: number) =>
    snapshot
      ? { ...snapshot.payload, source: snapshot.bundled ? 'fallback' : 'cache', stale: true, reason, retryAt }
      : { ...fallbackPayload({}), source: 'fallback', reason, retryAt }

  const apiKey = loadEnvKey(root)
  if (!apiKey) return stale('missing-key')
  if (cache.cooldownUntil && cache.cooldownUntil > now) {
    return stale(cache.lastReason ?? 'rate-limited', cache.cooldownUntil)
  }

  const result = await fetchModels(apiKey, cache.freeOnly)
  if (result.ok) {
    writeCache(root, { snapshot: { payload: result.payload, savedAt: now }, freeOnly: result.freeOnly })
    return { ...result.payload, source: 'live', nextRefreshAt: now + SNAPSHOT_TTL_MS }
  }

  const cooldownUntil = result.retryAt ?? now + 60 * 60 * 1000
  writeCache(root, { ...cache, freeOnly: result.freeOnly, cooldownUntil, lastReason: result.reason })
  return stale(result.reason, cooldownUntil)
}

function archiveDev(root: string, payload: ModelsPayload) {
  const snapshot = historySnapshot(payload)
  if (!snapshot || !Object.keys(snapshot.models).length) return
  const directory = resolve(root, '.cache/mercury/history')
  mkdirSync(directory, { recursive: true })
  const path = resolve(directory, `${snapshot.at.slice(0, 10)}.json`)
  try {
    writeFileSync(path, JSON.stringify(snapshot), { flag: 'wx' })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
  }
}

function readDevHistory(root: string, slug: string, days: number) {
  const directory = resolve(root, '.cache/mercury/history')
  if (!existsSync(directory)) return { points: [], available: true }
  const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  const snapshots = readdirSync(directory).filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name) && name.slice(0, 10) >= cutoff)
    .sort().slice(-366).map((name) => JSON.parse(readFileSync(resolve(directory, name), 'utf8')) as HistorySnapshot)
  return { points: historyPoints(snapshots, slug, days), available: true }
}

export function modelsApiPlugin(): Plugin {
  let inflight: Promise<unknown> | null = null
  return {
    name: 'mercury-models-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        if (url.pathname !== '/api/models' && url.pathname !== '/api/model-history') return next()
        res.setHeader('Content-Type', 'application/json')
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        if (url.pathname === '/api/model-history') {
          const query = historyQuery(url)
          if (!query) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid history query' }))
            return
          }
          try {
            res.end(JSON.stringify(readDevHistory(server.config.root, query.slug, query.days)))
          } catch {
            res.statusCode = 503
            res.end(JSON.stringify({ points: [], available: false }))
          }
          return
        }
        inflight ??= respond(server.config.root).finally(() => {
          inflight = null
        })
        const payload = await inflight as ModelsPayload
        try { archiveDev(server.config.root, payload) } catch { /* Model responses remain available if history storage fails. */ }
        res.end(JSON.stringify(payload))
      })
    },
  }
}
