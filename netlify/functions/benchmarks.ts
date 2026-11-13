import type { Config } from '@netlify/functions'
import { benchmarkSnapshot } from '../lib/benchmarksCache'

export default async (request: Request) => {
  if (request.method !== 'GET') return new Response(null, { status: 405 })
  return Response.json(await benchmarkSnapshot(), { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=1800' } })
}
export const config: Config = { path: '/api/benchmarks' }
