import type { Plugin } from 'vite'
import { createPromptsCache, handlePromptsRequest } from './shared/prompts.ts'

const cache = createPromptsCache(24 * 60 * 60 * 1000)

export function promptsApiPlugin(): Plugin {
  return {
    name: 'mercury-prompts-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/prompts')) return next()
        const params = new URL(req.url, 'http://localhost').searchParams
        const { status, body } = await handlePromptsRequest(params, cache)
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      })
    },
  }
}
