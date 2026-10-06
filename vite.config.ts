import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// Serves live token usage from local harness logs in dev and preview.
function usageEndpoint(): Plugin {
  const handler = (req: { url?: string }, res: { setHeader: (k: string, v: string) => void; end: (b: string) => void }, next: () => void) => {
    const route = req.url?.split('?')[0]
    if (route !== '/usage.json' && route !== '/repos.json') return next()
    const { collect } = require('./scripts/usage-collector.cjs')
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    if (route === '/repos.json') {
      const { repoStatus, lastSeen } = require('./scripts/repo-status.cjs')
      const paths = new URL(req.url ?? '', 'http://localhost').searchParams.getAll('p')
      return res.end(JSON.stringify({ repos: repoStatus(paths), seen: lastSeen(collect().rows) }))
    }
    res.end(JSON.stringify(collect()))
  }
  return {
    name: 'banker-usage-endpoint',
    configureServer: (server) => void server.middlewares.use(handler),
    configurePreviewServer: (server) => void server.middlewares.use(handler),
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    usageEndpoint(),
  ],
  server: {
    port: 3333,
    host: true,
  },
})
