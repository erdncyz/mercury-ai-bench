import type { Context, Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import fallbackModels from './fallback-models.json'
import {
  fallbackPayload,
  fetchModels,
  type FailureReason,
  type ModelsPayload,
} from '../../shared/aaModels'

// Free tier: 100 requests / 24h and ~6 per refresh, so refresh at most every 6h.
const FRESH_MS = 6 * 60 * 60 * 1000
const STORE = 'aa-models'

interface Snapshot {
  payload: ModelsPayload
  savedAt: number
}

interface UpstreamState {
  freeOnly?: boolean
  cooldownUntil?: number
  lastReason?: FailureReason
}

let memory: Snapshot | null = null
let memoryState: UpstreamState = {}
let inflight: Promise<Response> | null = null

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=600',
  }
}

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: corsHeaders() })
}

// Blobs can be unavailable (e.g. plain `vite` or a misconfigured site); degrade to memory.
function store() {
  try {
    return getStore(STORE)
  } catch {
    return null
  }
}

async function readSnapshot(): Promise<Snapshot | null> {
  try {
    const saved = (await store()?.get('snapshot', { type: 'json' })) as Snapshot | null
    if (saved && (!memory || saved.savedAt > memory.savedAt)) memory = saved
  } catch {
    // keep memory copy
  }
  return memory
}

async function readState(): Promise<UpstreamState> {
  try {
    const saved = (await store()?.get('state', { type: 'json' })) as UpstreamState | null
    if (saved) memoryState = saved
  } catch {
    // keep memory copy
  }
  return memoryState
}

async function write(key: 'snapshot' | 'state', value: Snapshot | UpstreamState) {
  try {
    await store()?.setJSON(key, value)
  } catch {
    // memory copy is already updated
  }
}

function serveStale(snapshot: Snapshot | null, reason: FailureReason, retryAt?: number) {
  if (snapshot) {
    return json({ ...snapshot.payload, source: 'cache', stale: true, reason, retryAt })
  }
  return json({ ...fallbackPayload(fallbackModels), source: 'fallback', reason, retryAt })
}

async function handle(): Promise<Response> {
  const now = Date.now()
  const [snapshot, state] = await Promise.all([readSnapshot(), readState()])

  if (snapshot && now - snapshot.savedAt < FRESH_MS) {
    return json({ ...snapshot.payload, source: 'cache' })
  }

  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY
  if (!apiKey) return serveStale(snapshot, 'missing-key')

  if (state.cooldownUntil && state.cooldownUntil > now) {
    return serveStale(snapshot, state.lastReason ?? 'rate-limited', state.cooldownUntil)
  }

  const result = await fetchModels(apiKey, state.freeOnly)
  if (result.ok) {
    memory = { payload: result.payload, savedAt: now }
    memoryState = { freeOnly: result.freeOnly }
    await Promise.all([write('snapshot', memory), write('state', memoryState)])
    return json({ ...result.payload, source: 'live' })
  }

  // Back off so every visitor does not spend another request against an exhausted quota.
  const cooldownUntil = result.retryAt ?? now + 15 * 60 * 1000
  memoryState = { freeOnly: result.freeOnly, cooldownUntil, lastReason: result.reason }
  await write('state', memoryState)
  return serveStale(snapshot, result.reason, result.retryAt)
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders(),
    })
  }

  // Collapse concurrent requests on a warm instance into a single upstream refresh.
  inflight ??= handle().finally(() => {
    inflight = null
  })
  return (await inflight).clone()
}

export const config: Config = {
  path: '/api/models',
}
