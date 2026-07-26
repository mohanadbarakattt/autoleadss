import type { VercelApiRequest } from './http'

/**
 * Reads the RAW request bytes for signature verification.
 *
 * WHY THIS EXISTS AS A SHARED MODULE: every webhook that verifies an HMAC must
 * hash the exact bytes the sender signed. Re-serializing a parsed body
 * (`JSON.stringify(req.body)`) reorders keys and drops whitespace, so the hash
 * never matches — and worse, when a route sets `bodyParser: false` (which it
 * must, to get the raw bytes at all) `req.body` is `undefined`, so that
 * expression silently hashes the literal string `"{}"`. That shipped in the
 * WhatsApp webhook: every inbound message failed verification and was rejected
 * with a non-retryable 403, so Meta stopped redelivering and every customer
 * message was lost. It passed tests only because tests assign `req.body` a
 * string. Two copies of this logic is how one of them drifts back to that — so
 * there is exactly one copy, here.
 *
 * A route using this MUST also `export const config = { api: { bodyParser: false } }`,
 * otherwise the platform consumes the stream before the handler sees it.
 *
 * The `typeof req.body === 'string'` branch is a test convenience: tests assign
 * the raw string directly rather than constructing a stream. Production always
 * takes the stream path.
 */

/** No legitimate webhook payload is anywhere near this; the cap stops a hostile
 * sender forcing us to buffer an unbounded stream into memory. */
export const MAX_BODY_BYTES = 256 * 1024

export async function readRawBody(req: VercelApiRequest): Promise<string> {
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) throw new Error('payload too large')
    return req.body
  }
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req as unknown as AsyncIterable<Buffer | string>) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buf.length
    if (total > MAX_BODY_BYTES) throw new Error('payload too large')
    chunks.push(buf)
  }
  return Buffer.concat(chunks).toString('utf8')
}
