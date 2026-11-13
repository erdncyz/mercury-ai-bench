import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { modelsApiPlugin } from './vite.models-api.ts'
import { benchmarksApiPlugin } from './vite.benchmarks-api.ts'
import { promptsApiPlugin } from './vite.prompts-api.ts'
import { pulseApiPlugin } from './vite.pulse-api.ts'

export default defineConfig({
  plugins: [
    react(), tailwindcss(), modelsApiPlugin(), benchmarksApiPlugin(), pulseApiPlugin(), promptsApiPlugin(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Mercury AI Bench',
        short_name: 'Mercury',
        description: 'Compare AI models by task, price and performance.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#030303',
        theme_color: '#030303',
        lang: 'en',
        categories: ['productivity', 'utilities'],
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Bench', url: '/bench', icons: [{ src: '/icons/pwa-192.png', sizes: '192x192' }] },
          { name: 'Compare', url: '/compare', icons: [{ src: '/icons/pwa-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        // Live data must keep its own freshness and error handling.
        navigateFallbackDenylist: [/^\/api(?:\/|$)/, /^\/\.netlify(?:\/|$)/],
      },
    }),
  ],
})
