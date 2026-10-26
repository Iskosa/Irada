import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

function localSyncPlugin(): Plugin {
  const dataDir = path.resolve(process.cwd(), 'data')
  const storeFile = path.join(dataDir, 'irada-store.json')

  return {
    name: 'irada-local-sync',
    configureServer(server) {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      server.middlewares.use('/api/sync', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          if (fs.existsSync(storeFile)) {
            try {
              const content = fs.readFileSync(storeFile, 'utf-8')
              res.end(content)
              return
            } catch (err) {
              console.error('[Sync Server] Read error:', err)
            }
          }
          res.end(JSON.stringify({ tasks: null, appState: null, updatedAt: 0 }))
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const payload = {
                tasks: data.tasks,
                appState: data.appState,
                updatedAt: data.updatedAt || Date.now(),
              }
              fs.writeFileSync(storeFile, JSON.stringify(payload, null, 2), 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, timestamp: payload.updatedAt }))

              // Broadcast update to all other connected clients
              server.ws.send({
                type: 'custom',
                event: 'irada:sync-update',
                data: payload,
              })
            } catch {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localSyncPlugin()],
  server: {
    allowedHosts: true,
    watch: {
      ignored: ['**/data/**', '**/.irada/**'],
    },
  },
})
