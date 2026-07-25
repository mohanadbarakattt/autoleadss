import type { NeonQueryFunction } from '@neondatabase/serverless'

/**
 * True when `subAccountId` belongs to `userId`. The `funnels.sub_account_id`
 * foreign key (migration 0008_agency.sql) only proves the row exists — it
 * doesn't prove the CALLER owns it — so every funnel write that can set it
 * (api/funnels/index.ts create, api/funnels/[id].ts patch) checks ownership
 * here first. Without this, a caller could attach their own funnel to another
 * agency's sub-account bucket.
 */
export async function subAccountBelongsToCaller(
  sql: NeonQueryFunction<false, false>,
  subAccountId: string,
  userId: string,
): Promise<boolean> {
  const rows = (await sql`
    select 1 from autoleadss.sub_accounts where id = ${subAccountId} and clerk_user_id = ${userId} limit 1
  `) as unknown as unknown[]
  return rows.length > 0
}
