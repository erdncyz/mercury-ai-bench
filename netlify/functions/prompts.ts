import type { Config, Context } from '@netlify/functions'
import { createPromptsCache, handlePromptsRequest } from '../../shared/prompts'

// Refresh community prompts once a day.
const cache = createPromptsCache(24 * 60 * 60 * 1000)

function headers() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  }
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers() })
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: headers() })
  }
  const { status, body } = await handlePromptsRequest(new URL(req.url).searchParams, cache)
  return new Response(JSON.stringify(body), { status, headers: headers() })
}

export const config: Config = {
  path: '/api/prompts',
}
