import { Suspense } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import { Writable } from 'node:stream'
import AppRoutes from './routes'
import RouteHead from './components/RouteHead'

export type RenderResult = { html: string; helmet: HelmetServerState }

/** Renders one route to HTML at build time (see scripts/prerender.mjs). */
export function render(url: string): Promise<RenderResult> {
  const helmetContext: { helmet?: HelmetServerState } = {}

  return new Promise((resolve, reject) => {
    let html = ''
    const sink = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk.toString()
        callback()
      },
    })
    sink.on('finish', () => resolve({ html, helmet: helmetContext.helmet! }))

    const stream = renderToPipeableStream(
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <RouteHead />
          <Suspense fallback={null}>
            <AppRoutes />
          </Suspense>
        </StaticRouter>
      </HelmetProvider>,
      {
        // Wait for lazy-loaded pages so the full page is in the HTML.
        onAllReady() {
          stream.pipe(sink)
        },
        onShellError: reject,
        onError(error) {
          reject(error)
        },
      },
    )
  })
}
