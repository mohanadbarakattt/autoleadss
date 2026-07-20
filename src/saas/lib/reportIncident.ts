/**
 * Reports a lost business-critical write from BROWSER code (defect class C9 —
 * see mbai-ecosystem/docs/OPS-INCIDENTS.md).
 *
 * Posts to this app's own `/api/incidents`, NOT to the gateway directly: the
 * gateway needs MBAI_GATEWAY_KEY, which is a server secret and must never be
 * shipped to the client. The server route holds the key and forwards.
 *
 * Call it BESIDE the existing console.error, never instead of it — if the
 * network is what failed, the console line is all that survives.
 *
 * Never throws and never needs awaiting:
 *   catch (err) {
 *     console.error('[x][LEAD-DROP] ...', { err })
 *     void reportIncident('LEAD-DROP', 'capture failed twice', { slug })
 *   }
 */
export function reportIncident(
  kind: 'LEAD-DROP' | 'REMOTE-SYNC-DROP' | 'QUOTA-DROP',
  message: string,
  context?: Record<string, unknown>,
): void {
  try {
    if (typeof fetch !== 'function') return
    void fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, message, context }),
      // A lead drop often coincides with the visitor leaving the page. Without
      // keepalive the browser cancels in-flight requests on unload and the
      // report is lost precisely when it matters most.
      keepalive: true,
    }).catch(() => {
      /* reporting a drop must never cause one */
    })
  } catch {
    /* never throw from a reporting path */
  }
}
