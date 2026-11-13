import type { Config } from '@netlify/functions'
import { historyQuery } from '../../shared/modelHistory'
import { readModelHistory } from '../lib/modelHistory'

export default async (req: Request) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...headers, Allow: 'GET' } })
  const query = historyQuery(new URL(req.url))
  if (!query) return new Response(JSON.stringify({ error: 'Provide slug and days (7, 30, 90, 365)' }), { status: 400, headers })
  try {
    return new Response(JSON.stringify(await readModelHistory(query.slug, query.days)), { headers })
  } catch {
    return new Response(JSON.stringify({ points: [], available: false }), { status: 503, headers: { ...headers, 'Cache-Control': 'no-store' } })
  }
}

export const config: Config = { path: '/api/model-history' }
