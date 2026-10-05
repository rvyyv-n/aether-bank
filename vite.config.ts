import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// Serves live token usage from local harness logs in dev and preview.
function usageEndpoint(): Plugin {
  const handler = (req: { url?: string }, res: { setHeader: (k: string, v: string) => void; end: (b: string) => void }, next: () => void) => {
    if (req.url?.split('?')[0] !== '/usage.json') return next()
    const { collect } = require('./scripts/usage-collector.cjs')
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
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
