/**
 * Production server — Bun + TanStack Start
 * Sert les assets statiques depuis dist/client et route le reste vers TanStack Start.
 */
import path from 'node:path'

const PORT = Number(process.env.PORT ?? 3000)
const CLIENT_DIR = './dist/client'
const SERVER_ENTRY = './dist/server/server.js'

async function start() {
  const { default: handler } = (await import(SERVER_ENTRY)) as {
    default: { fetch: (req: Request) => Response | Promise<Response> }
  }

  // Preload static assets into route map
  const routes: Record<string, (req: Request) => Response> = {}
  const glob = new Bun.Glob('**/*')

  for await (const relativePath of glob.scan({ cwd: CLIENT_DIR })) {
    const filepath = path.join(CLIENT_DIR, relativePath)
    const route = `/${relativePath}`
    const file = Bun.file(filepath)
    if (!(await file.exists()) || file.size === 0) continue

    const bytes = new Uint8Array(await file.arrayBuffer())
    const type = file.type || 'application/octet-stream'
    const immutable = relativePath.startsWith('assets/')

    routes[route] = () => {
      return new Response(new Uint8Array(bytes), {
        headers: {
          'Content-Type': type,
          'Cache-Control': immutable
            ? 'public, max-age=31536000, immutable'
            : 'public, max-age=3600',
        },
      })
    }
  }

  console.log(`Preloaded ${Object.keys(routes).length} static assets`)

  Bun.serve({
    port: PORT,
    routes: {
      ...routes,
      '/*': (req: Request) => handler.fetch(req),
    },
  })

  console.log(`Server listening on http://localhost:${PORT}`)
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
