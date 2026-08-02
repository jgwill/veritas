import { watch } from 'fs'
import { basename, dirname } from 'path'
import { storePath, storeRevision } from '@/lib/stc/parse-chart-store'

// SSE watch on the chart store — modeled on the stateloom watch-route shape
// (hello + change events, 15s ping, force-dynamic, nodejs runtime), owned here.
//
// The revision token is derived from store CONTENT (max metadata.updatedAt),
// never the file mtime (blueprint E1): announce only what was persisted.
// The directory is watched, not the file — the store is rewritten whole, and a
// replace-by-rename would silently orphan a file watcher.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const path = storePath()
  if (!path) {
    return new Response(
      JSON.stringify({ error: 'VERITAS_STC_STORE is not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const encoder = new TextEncoder()
  const file = basename(path)
  const dir = dirname(path)

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        )
      }

      let lastRevision = ''
      try {
        lastRevision = await storeRevision(path)
      } catch {
        // store unreadable at open — client's refetch will surface it
      }
      send('hello', { file, revision: lastRevision })

      let debounce: ReturnType<typeof setTimeout> | null = null
      const onChange = () => {
        if (debounce) clearTimeout(debounce)
        debounce = setTimeout(async () => {
          try {
            const revision = await storeRevision(path)
            if (revision && revision !== lastRevision) {
              lastRevision = revision
              send('change', { file, revision })
            }
          } catch {
            // mid-rewrite read — next event will catch up
          }
        }, 150)
      }

      let watcher: ReturnType<typeof watch> | null = null
      try {
        watcher = watch(dir, (_ev, name) => {
          if (!name || name === file) onChange()
        })
      } catch {
        send('error', { message: 'watch failed on store directory' })
      }

      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          cleanup()
        }
      }, 15000)

      const cleanup = () => {
        clearInterval(ping)
        if (debounce) clearTimeout(debounce)
        watcher?.close()
        try {
          controller.close()
        } catch {
          // already closed
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
