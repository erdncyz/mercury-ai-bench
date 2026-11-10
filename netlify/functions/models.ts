import type { Context, Config } from '@netlify/functions'
import { modelsResponseBody } from '../lib/modelsCache'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600',
  }
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

  // Serves the daily snapshot from Netlify Blobs; upstream is only hit when it is over a day old.
  return new Response(JSON.stringify(await modelsResponseBody()), { status: 200, headers: corsHeaders() })
}

export const config: Config = {
  path: '/api/models',
}
