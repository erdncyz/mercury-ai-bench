import assert from 'node:assert/strict'
import { readFile, readdir, access } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'

const read = (file) => readFile(new URL(`../dist/${file}`, import.meta.url))
const manifest = JSON.parse(await read('manifest.webmanifest'))
assert.equal(manifest.id, '/')
assert.equal(manifest.start_url, '/')
assert.equal(manifest.scope, '/')
assert.equal(manifest.display, 'standalone')
assert.equal(manifest.prefer_related_applications ?? false, false)

for (const size of [192, 512]) {
  const icon = manifest.icons.find((icon) => icon.sizes === `${size}x${size}` && icon.purpose === 'any')
  assert.ok(icon, `Missing ${size}px install icon`)
  const png = await read(icon.src.replace(/^\//, ''))
  assert.equal(png.readUInt32BE(16), size)
  assert.equal(png.readUInt32BE(20), size)
}
assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'))
const appleIcon = await read('icons/apple-touch-icon.png')
assert.equal(appleIcon.readUInt32BE(16), 180)
assert.equal(appleIcon.readUInt32BE(20), 180)
const html = (await read('index.html')).toString()
assert.match(html, /rel="manifest"/)
assert.match(html, /rel="apple-touch-icon"/)
assert.match(html, /name="theme-color"/)

// Inspect the generated worker's actual Workbox configuration, without executing it in a browser.
let precache = []
let navigation
const listeners = new Map()
let skipWaiting = false
const workbox = {
  precacheAndRoute(entries) { precache = entries },
  cleanupOutdatedCaches() {},
  createHandlerBoundToURL(url) { return url },
  NavigationRoute: class {
    constructor(handler, options) { this.handler = handler; this.options = options }
  },
  registerRoute(route) { navigation = route },
}
const define = (_deps, initialize) => initialize(workbox)
runInNewContext((await read('sw.js')).toString(), {
  define,
  self: { define, addEventListener(type, fn) { listeners.set(type, fn) }, skipWaiting() { skipWaiting = true } },
})
assert.equal(navigation.handler, '/index.html')
for (const path of ['/api/models', '/api/prompts', '/.netlify/functions/models']) {
  assert.ok(navigation.options.denylist.some((rule) => rule.test(path)), `Live endpoint intercepted: ${path}`)
}
for (const path of ['/', '/bench', '/compare', '/model/example']) {
  assert.ok(!navigation.options.denylist.some((rule) => rule.test(path)), `Offline navigation excluded: ${path}`)
}
const urls = new Set(precache.map((entry) => entry.url))
assert.ok(urls.has('index.html'))
for (const file of await readdir(new URL('../dist/assets/', import.meta.url))) {
  if (/\.(js|css)$/.test(file)) assert.ok(urls.has(`assets/${file}`), `Missing offline asset: ${file}`)
}
for (const file of urls) await access(new URL(`../dist/${file}`, import.meta.url))
assert.ok([...urls].some((url) => url.includes('fallback-models')), 'Offline model snapshot is not cached')
assert.ok(![...urls].some((url) => /^\/?(?:api|\.netlify)\//.test(url)))
assert.equal(skipWaiting, false, 'Updates must wait for user confirmation')
listeners.get('message')({ data: { type: 'SKIP_WAITING' } })
assert.equal(skipWaiting, true)
console.log(`PWA checks passed: install metadata, icons, ${urls.size} offline files, API exclusions and update activation.`)
