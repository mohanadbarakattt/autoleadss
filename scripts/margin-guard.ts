// margin-guard — CI gate for AutoLeadss's WhatsApp-AI / AI-action caps
// (PRICING-SPEC-DRAFT.md §2.2, §7 item 4: "AutoLeadss margin-guard missing").
//
// Ports Virlo Studio's pure-function + CI-gate pattern (the "strongest pattern in
// the ecosystem" per the spec's §6 recommendation): logic lives in exported pure
// functions, the CLI wrapper below prints a report and exits 1 on any violation.
// Run: `npm run margin-guard`.
//
// Reads exactly one config for every cost/FX literal (billing/costs.ts) and one
// for every price/cap literal (pricing.ts + entitlements.ts) — nothing here is a
// re-typed number.
//
// AutoLeadss has no margin floor of its own yet (spec §6: "none coded"), so this
// reuses Virlo's ecosystem-wide 55%/60% hard-floor/warn-target pair rather than
// inventing a new one — the safer, already-vetted choice.

import { TIERS, TOPUP_PACKS } from "../src/saas/pricing";
import { ENTITLEMENTS } from "../src/saas/entitlements";
import {
  WHATSAPP_COST_USD,
  AI_ACTION_COST_USD,
  FX_USD_TO_EGP,
  paymobFeeEgp,
  stripeFeeUsd,
} from "../src/saas/billing/costs";

export const HARD_FLOOR = 0.55;
export const WARN_TARGET = 0.6;

function parseEgp(s: string): number {
  const n = Number(s.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) throw new Error(`Cannot parse EGP price: "${s}"`);
  return n;
}
function parseUsd(s: string): number {
  const n = Number(s.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) throw new Error(`Cannot parse USD price: "${s}"`);
  return n;
}

export type Region = "egypt" | "gulf";

export type TierMarginRow = {
  tier: string;
  region: Region;
  listPrice: number;
  fee: number;
  netRevenue: number;
  whatsappCost: number;
  aiActionCost: number;
  totalCost: number;
  marginPct: number;
};

export type TopupMarginRow = {
  pack: string;
  region: Region;
  listPrice: number;
  fee: number;
  netRevenue: number;
  totalCost: number;
  marginPct: number;
};

export type GuardResult = {
  ok: boolean;
  violations: string[];
  warnings: string[];
  tierRows: TierMarginRow[];
  topupRows: TopupMarginRow[];
};

/** Worst-case tier economics at full cap burn — Starter/Done-with-you/White-label
 * have no numeric cap (see entitlements.ts's `null` cases) so there's nothing to
 * check for them; only Growth/Pro carry the new WhatsApp-AI/AI-action exposure. */
export function tierMarginRows(): TierMarginRow[] {
  const rows: TierMarginRow[] = [];
  for (const planId of ["growth", "pro"] as const) {
    const tier = TIERS.find((t) => t.id === planId);
    if (!tier) throw new Error(`No TIERS entry for plan "${planId}"`);
    const ent = ENTITLEMENTS[planId];
    const whatsappCap = ent.whatsappCap?.limit ?? 0;
    const aiActionCap = ent.aiActionCap?.limit ?? 0;

    const egpPrice = parseEgp(tier.priceEgypt);
    const egpFee = paymobFeeEgp(egpPrice);
    const egpNet = egpPrice - egpFee;
    const egpWhatsappCost = whatsappCap * WHATSAPP_COST_USD * FX_USD_TO_EGP;
    const egpAiCost = aiActionCap * AI_ACTION_COST_USD * FX_USD_TO_EGP;
    const egpTotalCost = egpWhatsappCost + egpAiCost;
    rows.push({
      tier: planId,
      region: "egypt",
      listPrice: egpPrice,
      fee: egpFee,
      netRevenue: egpNet,
      whatsappCost: egpWhatsappCost,
      aiActionCost: egpAiCost,
      totalCost: egpTotalCost,
      marginPct: (egpNet - egpTotalCost) / egpNet,
    });

    const usdPrice = parseUsd(tier.priceGulf);
    const usdFee = stripeFeeUsd(usdPrice);
    const usdNet = usdPrice - usdFee;
    const usdWhatsappCost = whatsappCap * WHATSAPP_COST_USD;
    const usdAiCost = aiActionCap * AI_ACTION_COST_USD;
    const usdTotalCost = usdWhatsappCost + usdAiCost;
    rows.push({
      tier: planId,
      region: "gulf",
      listPrice: usdPrice,
      fee: usdFee,
      netRevenue: usdNet,
      whatsappCost: usdWhatsappCost,
      aiActionCost: usdAiCost,
      totalCost: usdTotalCost,
      marginPct: (usdNet - usdTotalCost) / usdNet,
    });
  }
  return rows;
}

/** Worst-case top-up-pack economics at full redemption before the 90-day expiry
 * (breakage would only improve margin, so full redemption is the binding case). */
export function topupMarginRows(): TopupMarginRow[] {
  const rows: TopupMarginRow[] = [];
  for (const pack of TOPUP_PACKS) {
    const egpPrice = parseEgp(pack.priceEgypt);
    const egpFee = paymobFeeEgp(egpPrice);
    const egpNet = egpPrice - egpFee;
    const egpCost = pack.whatsapp * WHATSAPP_COST_USD * FX_USD_TO_EGP + pack.aiAction * AI_ACTION_COST_USD * FX_USD_TO_EGP;
    rows.push({ pack: pack.id, region: "egypt", listPrice: egpPrice, fee: egpFee, netRevenue: egpNet, totalCost: egpCost, marginPct: (egpNet - egpCost) / egpNet });

    const usdPrice = parseUsd(pack.priceGulf);
    const usdFee = stripeFeeUsd(usdPrice);
    const usdNet = usdPrice - usdFee;
    const usdCost = pack.whatsapp * WHATSAPP_COST_USD + pack.aiAction * AI_ACTION_COST_USD;
    rows.push({ pack: pack.id, region: "gulf", listPrice: usdPrice, fee: usdFee, netRevenue: usdNet, totalCost: usdCost, marginPct: (usdNet - usdCost) / usdNet });
  }
  return rows;
}

export function runMarginGuard(): GuardResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  warnings.push(
    `WhatsApp cost basis ($${WHATSAPP_COST_USD}/conversation) is a placeholder — no Meta per-country/per-category rate card sourced yet (PRICING-SPEC-DRAFT.md §2.2/§7 item 1). Every margin number below is provisional on this figure.`,
  );

  const tierRows = tierMarginRows();
  for (const r of tierRows) {
    const label = `tier "${r.tier}" (${r.region})`;
    if (r.marginPct < HARD_FLOOR) {
      violations.push(`${label}: worst-case margin ${(r.marginPct * 100).toFixed(1)}% < hard floor ${(HARD_FLOOR * 100).toFixed(0)}%`);
    } else if (r.marginPct < WARN_TARGET) {
      warnings.push(`${label}: worst-case margin ${(r.marginPct * 100).toFixed(1)}% < target ${(WARN_TARGET * 100).toFixed(0)}%`);
    }
  }

  const topupRows = topupMarginRows();
  for (const r of topupRows) {
    const label = `top-up "${r.pack}" (${r.region})`;
    if (r.marginPct < HARD_FLOOR) {
      violations.push(`${label}: worst-case margin ${(r.marginPct * 100).toFixed(1)}% < hard floor ${(HARD_FLOOR * 100).toFixed(0)}%`);
    } else if (r.marginPct < WARN_TARGET) {
      warnings.push(`${label}: worst-case margin ${(r.marginPct * 100).toFixed(1)}% < target ${(WARN_TARGET * 100).toFixed(0)}%`);
    }
  }

  return { ok: violations.length === 0, violations, warnings, tierRows, topupRows };
}

export function formatReport(r: GuardResult): string {
  const lines: string[] = [];
  lines.push("");
  lines.push(`  AutoLeadss margin-guard  ·  WhatsApp $${WHATSAPP_COST_USD}/conv  ·  AI-action $${AI_ACTION_COST_USD}/action  ·  FX ${FX_USD_TO_EGP} EGP/$1`);
  lines.push("  " + "-".repeat(84));
  lines.push("  tier/pack       region   list price   net rev.     total cost   margin");
  for (const t of r.tierRows) {
    lines.push(
      "  " +
        t.tier.padEnd(15) +
        t.region.padEnd(9) +
        (t.region === "egypt" ? `${t.listPrice.toFixed(0)} EGP` : `$${t.listPrice.toFixed(0)}`).padEnd(13) +
        (t.region === "egypt" ? `${t.netRevenue.toFixed(2)} EGP` : `$${t.netRevenue.toFixed(2)}`).padEnd(13) +
        (t.region === "egypt" ? `${t.totalCost.toFixed(2)} EGP` : `$${t.totalCost.toFixed(2)}`).padEnd(13) +
        (t.marginPct * 100).toFixed(1) + "%",
    );
  }
  for (const t of r.topupRows) {
    lines.push(
      "  " +
        `topup-${t.pack}`.padEnd(15) +
        t.region.padEnd(9) +
        (t.region === "egypt" ? `${t.listPrice.toFixed(0)} EGP` : `$${t.listPrice.toFixed(0)}`).padEnd(13) +
        (t.region === "egypt" ? `${t.netRevenue.toFixed(2)} EGP` : `$${t.netRevenue.toFixed(2)}`).padEnd(13) +
        (t.region === "egypt" ? `${t.totalCost.toFixed(2)} EGP` : `$${t.totalCost.toFixed(2)}`).padEnd(13) +
        (t.marginPct * 100).toFixed(1) + "%",
    );
  }
  lines.push("  " + "-".repeat(84));
  lines.push(`  hard floor ${(HARD_FLOOR * 100).toFixed(0)}%  ·  warn target ${(WARN_TARGET * 100).toFixed(0)}%`);
  lines.push("");
  for (const w of r.warnings) lines.push("  ⚠ warn:  " + w);
  for (const v of r.violations) lines.push("  ✗ FAIL:  " + v);
  lines.push(r.ok ? "  ✓ margin-guard passed" : `  ✗ margin-guard FAILED (${r.violations.length} violation(s))`);
  lines.push("");
  return lines.join("\n");
}

// --- CLI ---
const isCli =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] != null &&
  /margin-guard(\.ts|\.js)?$/.test(process.argv[1]);

if (isCli) {
  try {
    const result = runMarginGuard();
    process.stdout.write(formatReport(result) + "\n");
    process.exit(result.ok ? 0 : 1);
  } catch (err) {
    process.stderr.write("margin-guard crashed: " + (err instanceof Error ? err.message : String(err)) + "\n");
    process.exit(1);
  }
}
