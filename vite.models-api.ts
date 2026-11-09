import type { Plugin } from 'vite'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import {
  fallbackPayload,
  fetchModels,
  type FailureReason,
  type ModelsPayload,
} from './shared/aaModels.ts'

// Same budget as the Netlify function; persisted to disk so dev restarts don't burn quota.
const FRESH_MS = 6 * 60 * 60 * 1000

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

function cachePath(root: string) {
  return resolve(root, 'node_modules/.cache/mercury/aa-models.json')
}

function readCache(root: string): DevCache {
  try {
    return JSON.parse(readFileSync(cachePath(root), 'utf8')) as DevCache
  } catch {
    return {}
  }
}

function writeCache(root: string, cache: DevCache) {
  try {
    const path = cachePath(root)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, JSON.stringify(cache))
  } catch {
    // dev-only cache; ignore write failures
  }
}

function stale(root: string, cache: DevCache, reason: FailureReason, retryAt?: number) {
  if (cache.snapshot) return { ...cache.snapshot.payload, source: 'cache', stale: true, reason, retryAt }
  const fallback = JSON.parse(readFileSync(resolve(root, 'src/data/fallback-models.json'), 'utf8'))
  return { ...fallbackPayload(fallback), source: 'fallback', reason, retryAt }
}

async function respond(root: string) {
  const now = Date.now()
  const cache = readCache(root)
  if (cache.snapshot && now - cache.snapshot.savedAt < FRESH_MS) {
    return { ...cache.snapshot.payload, source: 'cache' }
  }

  const apiKey = loadEnvKey(root)
  if (!apiKey) return stale(root, cache, 'missing-key')
  if (cache.cooldownUntil && cache.cooldownUntil > now) {
    return stale(root, cache, cache.lastReason ?? 'rate-limited', cache.cooldownUntil)
  }

  const result = await fetchModels(apiKey, cache.freeOnly)
  if (result.ok) {
    writeCache(root, { snapshot: { payload: result.payload, savedAt: now }, freeOnly: result.freeOnly })
    return { ...result.payload, source: 'live' }
  }

  const cooldownUntil = result.retryAt ?? now + 15 * 60 * 1000
  writeCache(root, { ...cache, freeOnly: result.freeOnly, cooldownUntil, lastReason: result.reason })
  return stale(root, cache, result.reason, result.retryAt)
}

export function modelsApiPlugin(): Plugin {
  let inflight: Promise<unknown> | null = null
  return {
    name: 'mercury-models-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/models')) return next()
        res.setHeader('Content-Type', 'application/json')
        inflight ??= respond(server.config.root).finally(() => {
          inflight = null
        })
        res.end(JSON.stringify(await inflight))
      })
    },
  }
}
