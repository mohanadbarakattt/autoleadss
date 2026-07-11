import type { Funnel, Lead } from '../types'

/**
 * Remote data-access layer backed by the shared Neon Postgres project, via this
 * app's own Vercel serverless functions (`api/`) — see
 * ~/projects/mbai-ecosystem/docs/SHARED-DB-DESIGN.md. Supersedes the old
 * Supabase-backed db/client.ts + db/remote.ts.
 *
 * There's no client-side signal for "is the Neon backend configured" (DATABASE_URL
 * / CLERK_SECRET_KEY are server-only secrets) — so, unlike the old Supabase
 * integration, availability isn't a static env-derived flag. The caller (store.ts)
 * probes by calling `listFunnels()` once on sign-in: if it resolves, remote mode
 * activates; if it throws (network error, 501 not-configured, 401, etc.), the
 * caller falls back to localStorage. Every function here throws on failure rather
 * than swallowing errors, so that fallback decision stays in the caller's hands.
 */

/** Minimal handle store.ts hands down — just enough to attach a fresh Clerk token
 * to each authenticated call. Intentionally not a full SDK client (no persistent
 * connection/session state to manage, unlike the old SupabaseClient). */
export interface RemoteAuth {
  getToken: () => Promise<string | null>
}

/** Exported so other db/* modules (e.g. db/usage.ts) can reuse the same
 * Clerk-token-attaching fetch wrapper instead of duplicating it. */
export async function authedRequest<T>(auth: RemoteAuth, path: string, init: RequestInit = {}): Promise<T> {
  const token = await auth.getToken()
  if (!token) throw new Error(`api${path}: no Clerk token available`)
  return request<T>(path, { ...init, headers: { ...init.headers, authorization: `Bearer ${token}` } })
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, { ...init, headers: { 'content-type': 'application/json', ...init.headers } })
  } catch (e) {
    throw new Error(`api${path}: network error (${e instanceof Error ? e.message : 'unknown'})`)
  }
  if (!res.ok) {
    let message = `api${path}: HTTP ${res.status}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) message = body.error
    } catch {
      /* body wasn't JSON — keep the generic message */
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

// ---------- authenticated (dashboard) ----------

export async function listFunnels(auth: RemoteAuth): Promise<Funnel[]> {
  const { funnels } = await authedRequest<{ funnels: Funnel[] }>(auth, '/api/funnels')
  return funnels
}

export async function createFunnel(auth: RemoteAuth, f: Funnel): Promise<void> {
  await authedRequest(auth, '/api/funnels', { method: 'POST', body: JSON.stringify(f) })
}

export async function updateFunnel(auth: RemoteAuth, id: string, patch: Partial<Funnel>): Promise<void> {
  await authedRequest(auth, `/api/funnels/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export async function deleteFunnel(auth: RemoteAuth, id: string): Promise<void> {
  await authedRequest(auth, `/api/funnels/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function setLeadStatusRemote(auth: RemoteAuth, leadId: string, status: Lead['status']): Promise<void> {
  await authedRequest(auth, `/api/leads/${encodeURIComponent(leadId)}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

// ---------- public (published page) ----------

export async function getPublishedFunnel(slug: string): Promise<Funnel | null> {
  const { funnel } = await request<{ funnel: Funnel | null }>(`/api/published?slug=${encodeURIComponent(slug)}`)
  return funnel
}

export async function recordVisitRemote(slug: string): Promise<void> {
  await request('/api/published/visit', { method: 'POST', body: JSON.stringify({ slug }) })
}

export async function captureLeadRemote(
  slug: string,
  lead: { name: string; phone: string; email?: string; message?: string; source?: string },
): Promise<void> {
  await request('/api/published/lead', { method: 'POST', body: JSON.stringify({ slug, ...lead }) })
}
