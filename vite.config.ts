import type { Connect } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleBacklinkApi } from './server/backlinkGenerator'

function backlinkApiPlugin() {
  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    if (!req.url?.startsWith('/api/')) {
      next()
      return
    }

    await handleBacklinkApi(req, res)
  }

  return {
    name: 'backlink-api-plugin',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(middleware)
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY
  }

  if (env.OPENAI_MODEL) {
    process.env.OPENAI_MODEL = env.OPENAI_MODEL
  }

  return {
    plugins: [react(), backlinkApiPlugin()],
    server: {
      port: 4173
    },
    preview: {
      port: 4173
    }
  }
})
