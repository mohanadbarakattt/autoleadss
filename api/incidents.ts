import { methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from './_lib/http'

/**
 * POST /api/incidents — server-side proxy for browser-reported lost writes.
 *
 * WHY A PROXY EXISTS AT ALL: the drop sites in this app (Published.tsx lead
 * capture, store.ts remote sync, billing/usage.ts counters) all run in the
 * VISITOR's browser. The gateway's /v1/incidents endpoint authenticates with
 * MBAI_GATEWAY_KEY, which is a server secret — shipping it to the client so
 * the browser could call the gateway directly would hand every visitor a key
 * that can also call /v1/chat on our account. So the browser posts here, and
 * only this function holds the key.
 *
 * DELIBERATELY UNAUTHENTICATED: the most important report is a LEAD-DROP from
 * a published funnel, and those visitors are anonymous by definition —
 * requiring a Clerk session would silence exactly the incident we most want.
 * The trade-off is that this endpoint is publicly postable, so it is narrowed
 * instead of authenticated:
 *   - `kind` must be one of a fixed allowlist (no arbitrary rows),
 *   - message and context are size-capped,
 *   - nothing the caller sends decides which app it is attributed to (the
 *     gateway derives that from our bearer key).
 * [NEEDS-OWNER] There is still no rate limit, so a determined actor could
 * spam rows. Mitigation if that ever happens: per-IP limiting here, or a
 * per-kind cap in the gateway. Logged as a known limit in
 * mbai-ecosystem/docs/OPS-INCIDENTS.md rather than left implicit.
 */

/** Only kinds this app actually emits. Anything else is rejected rather than
 * forwarded, so the table can't be filled with arbitrary junk. */
const ALLOWED_KINDS = new Set(['LEAD-DROP', 'REMOTE-SYNC-DROP', 'QUOTA-DROP'])

const MAX_MESSAGE = 500
const MAX_CONTEXT_BYTES = 2000

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const baseUrl = process.env.MBAI_GATEWAY_URL
  const key = process.env.MBAI_GATEWAY_KEY
  // Not configured (demo deploys) — accept and drop, so the browser never
  // treats an unconfigured backend as an error worth retrying.
  if (!baseUrl || !key) return sendJson(res, 202, { recorded: false, reason: 'gateway not configured' })

  const body = (req.body ?? {}) as { kind?: unknown; message?: unknown; context?: unknown }
  const kind = typeof body.kind === 'string' ? body.kind : ''
  const message = typeof body.message === 'string' ? body.message : ''
  if (!ALLOWED_KINDS.has(kind) || !message) {
    return sendJson(res, 400, { error: 'kind must be a known incident kind and message is required.' })
  }

  let context: Record<string, unknown> = {}
  if (body.context && typeof body.context === 'object') {
    const serialised = JSON.stringify(body.context)
    context = serialised.length <= MAX_CONTEXT_BYTES ? (body.context as Record<string, unknown>) : { truncated: true }
  }

  try {
    await fetch(`${baseUrl}/v1/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ kind, message: message.slice(0, MAX_MESSAGE), context }),
    })
  } catch (err) {
    // Reporting a drop must never itself produce one the caller has to handle.
    console.error('[incidents] failed to forward to gateway (logs only)', { kind, err })
  }

  // Always 202: the browser is already on a failure path and has nothing
  // useful to do with an error from the reporting channel.
  return sendJson(res, 202, { recorded: true })
}
