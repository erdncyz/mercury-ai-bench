// Daily model snapshot shared by the /api/models function and the scheduled refresher.
// Lives outside netlify/functions so Netlify does not deploy it as its own function.
import { getStore } from '@netlify/blobs'
import { archiveModels } from './modelHistory'
import fallbackModels from '../functions/fallback-models.json'
import {
  fallbackPayload,
  fetchModels,
  payloadAgeMs,
  SNAPSHOT_TTL_MS,
  type FailureReason,
  type ModelsPayload,
} from '../../shared/aaModels'

const STORE = 'aa-models'

export interface Snapshot {
  payload: ModelsPayload
  savedAt: number
  /** 'bundled' = fallback JSON written at build time; 'upstream' = fetched at runtime and stored in Blobs. */
  origin?: 'upstream' | 'bundled'
}

interface UpstreamState {
  freeOnly?: boolean
  cooldownUntil?: number
  lastReason?: FailureReason
}

let memory: Snapshot | null = null
let memoryState: UpstreamState = {}

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
    if (saved && (!memory || saved.savedAt > memory.savedAt)) memory = { ...saved, origin: 'upstream' }
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

/** The fallback JSON is refreshed at build time; when recent it counts as a valid daily snapshot. */
function bundledSnapshot(): Snapshot {
  const payload = fallbackPayload(fallbackModels)
  return { payload, savedAt: Date.now() - payloadAgeMs(payload), origin: 'bundled' }
}

/** Newest of the persisted snapshot and the bundled build-time data. */
export async function newestSnapshot(): Promise<Snapshot> {
  const saved = await readSnapshot()
  const bundled = bundledSnapshot()
  return saved && saved.savedAt >= bundled.savedAt ? saved : bundled
}

export type RefreshOutcome =
  | { ok: true; snapshot: Snapshot }
  | { ok: false; reason: FailureReason; retryAt?: number; snapshot: Snapshot }

let inflight: Promise<RefreshOutcome> | null = null

/** Fetches upstream once (shared by concurrent callers) unless a cooldown from a previous 429 is active. */
export function refreshSnapshot(): Promise<RefreshOutcome> {
  inflight ??= (async (): Promise<RefreshOutcome> => {
    const now = Date.now()
    const [current, state] = await Promise.all([newestSnapshot(), readState()])
    const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY
    if (!apiKey) return { ok: false, reason: 'missing-key', snapshot: current }
    if (state.cooldownUntil && state.cooldownUntil > now) {
      return { ok: false, reason: state.lastReason ?? 'rate-limited', retryAt: state.cooldownUntil, snapshot: current }
    }

    const result = await fetchModels(apiKey, state.freeOnly)
    if (result.ok) {
      memory = { payload: result.payload, savedAt: now, origin: 'upstream' }
      memoryState = { freeOnly: result.freeOnly }
      await Promise.all([write('snapshot', { payload: memory.payload, savedAt: now }), write('state', memoryState)])
      await archiveModels(memory.payload)
      return { ok: true, snapshot: memory }
    }

    // Back off so nobody spends another request against an exhausted quota.
    const cooldownUntil = result.retryAt ?? now + 60 * 60 * 1000
    memoryState = { freeOnly: result.freeOnly, cooldownUntil, lastReason: result.reason }
    await write('state', memoryState)
    return { ok: false, reason: result.reason, retryAt: cooldownUntil, snapshot: current }
  })().finally(() => {
    inflight = null
  })
  return inflight
}

/** Response body for /api/models: serves the daily snapshot and only refreshes when it is older than a day. */
export async function modelsResponseBody() {
  const snapshot = await newestSnapshot()
  await archiveModels(snapshot.payload)
  if (Date.now() - snapshot.savedAt < SNAPSHOT_TTL_MS) {
    return { ...snapshot.payload, source: 'cache', nextRefreshAt: snapshot.savedAt + SNAPSHOT_TTL_MS }
  }

  // The scheduled refresher normally keeps this fresh; this is the safety net if it missed a run.
  const outcome = await refreshSnapshot()
  if (outcome.ok) {
    return { ...outcome.snapshot.payload, source: 'live', nextRefreshAt: outcome.snapshot.savedAt + SNAPSHOT_TTL_MS }
  }
  const { payload, origin } = outcome.snapshot
  return {
    ...payload,
    source: origin === 'bundled' ? 'fallback' : 'cache',
    stale: true,
    reason: outcome.reason,
    retryAt: outcome.retryAt,
  }
}
