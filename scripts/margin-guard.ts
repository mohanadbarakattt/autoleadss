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
//
// Phase 7b (geo-located pricing currency): the app now displays a price in
// whichever of EGP/USD/AED/SAR the visitor sees (src/saas/currency.ts). A
// currency the app can show but this guard doesn't check is a guard that has
// stopped guarding — so EVERY row below is checked for every currency the
// pricing page can display, not just the original two region price lists.
// AED/SAR rows run the ACTUAL display price (`convertUsdToCurrency`, the same
// function Pricing.tsx calls) back through the margin formula, proving they
// land in the same safe territory as USD rather than assuming it.

import { TIERS, TOPUP_PACKS } from "../src/saas/pricing";
import { ENTITLEMENTS } from "../src/saas/entitlements";
import {
  WHATSAPP_COST_USD,
  AI_ACTION_COST_USD,
  stripeFeeUsd,
} from "../src/saas/billing/costs";
// Money maths comes from the shared @mbai/money package (vendored). It is
// VAT-aware: prices are VAT-inclusive, so 14% of every headline price is
// remitted and was never ours — ignoring that overstated every margin here
// by ~12 percentage points.
import { computeMargin, egpToPiastres, piastresToEgp, usdToEgpRate } from "../src/saas/lib/money/index.js";
import { convertUsdToCurrency, CURRENCY_PEGS, SUPPORTED_CURRENCIES } from "../src/saas/currency";
import type { Currency } from "../src/saas/types";

export const HARD_FLOOR = 0.55;
export const WARN_TARGET = 0.6;

/**
 * Every currency the pricing page can display — DERIVED from the app's own
 * SUPPORTED_CURRENCIES, not hand-copied.
 *
 * It was a literal, with a comment asking whoever edits it to remember to keep
 * the two in sync. That is not a guarantee, it is a wish: adding a currency to
 * the app would have shipped a displayed price this guard never checked, while
 * the guard still reported green. A margin guard that silently skips a live
 * price is worse than no guard, because it is trusted. Importing means adding a
 * currency can only ever ADD a row here.
 */
export const DISPLAYED_CURRENCIES: readonly Currency[] = SUPPORTED_CURRENCIES;

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

export type TierMarginRow = {
  tier: string;
  currency: Currency;
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
  currency: Currency;
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

/**
 * Margin for a USD-cost-basis price point: USD itself, or a Gulf currency
 * pegged to it (AED/SAR). All three share Stripe as the (hypothetical, since
 * payments aren't live) processor and USD-denominated WhatsApp/AI costs, so
 * they share this one formula — the only thing that changes per currency is
 * `listPrice`, computed via the SAME `convertUsdToCurrency` the app uses to
 * DISPLAY it. That price is round-tripped back to a USD equivalent to compute
 * the fee, which is what makes this an independent proof of AED/SAR margin
 * rather than an assumption that it matches USD's.
 */
function usdBasisRow(usdPrice: number, currency: "USD" | "AED" | "SAR", costUsd: number) {
  const listPrice = currency === "USD" ? usdPrice : convertUsdToCurrency(usdPrice, currency);
  const peg = currency === "USD" ? 1 : CURRENCY_PEGS[currency]!;
  const usdEquivalent = listPrice / peg;
  const fee = stripeFeeUsd(usdEquivalent) * peg;
  const netRevenue = listPrice - fee;
  const totalCost = costUsd * peg;
  return { listPrice, fee, netRevenue, totalCost, marginPct: (netRevenue - totalCost) / netRevenue };
}

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
    const costUsd = whatsappCap * WHATSAPP_COST_USD + aiActionCap * AI_ACTION_COST_USD;

    const egpPrice = parseEgp(tier.priceEgypt);
    const rate = usdToEgpRate();
    const m = computeMargin({ costUsd, priceP: egpToPiastres(egpPrice), rate });
    const egpFee = piastresToEgp(m.feeP + m.vatP); // fee + VAT both leave us
    const egpNet = piastresToEgp(m.netP);
    const egpWhatsappCost = whatsappCap * WHATSAPP_COST_USD * rate;
    const egpAiCost = aiActionCap * AI_ACTION_COST_USD * rate;
    const egpTotalCost = piastresToEgp(m.costP);
    rows.push({
      tier: planId,
      currency: "EGP",
      listPrice: egpPrice,
      fee: egpFee,
      netRevenue: egpNet,
      whatsappCost: egpWhatsappCost,
      aiActionCost: egpAiCost,
      totalCost: egpTotalCost,
      marginPct: (egpNet - egpTotalCost) / egpNet,
    });

    const usdPrice = parseUsd(tier.priceGulf);
    for (const currency of ["USD", "AED", "SAR"] as const) {
      const r = usdBasisRow(usdPrice, currency, costUsd);
      const peg = currency === "USD" ? 1 : CURRENCY_PEGS[currency]!;
      rows.push({
        tier: planId,
        currency,
        listPrice: r.listPrice,
        fee: r.fee,
        netRevenue: r.netRevenue,
        whatsappCost: whatsappCap * WHATSAPP_COST_USD * peg,
        aiActionCost: aiActionCap * AI_ACTION_COST_USD * peg,
        totalCost: r.totalCost,
        marginPct: r.marginPct,
      });
    }
  }
  return rows;
}

/** Worst-case top-up-pack economics at full redemption before the 90-day expiry
 * (breakage would only improve margin, so full redemption is the binding case). */
export function topupMarginRows(): TopupMarginRow[] {
  const rows: TopupMarginRow[] = [];
  for (const pack of TOPUP_PACKS) {
    const egpPrice = parseEgp(pack.priceEgypt);
    const packCostUsd = pack.whatsapp * WHATSAPP_COST_USD + pack.aiAction * AI_ACTION_COST_USD;
    const pm = computeMargin({ costUsd: packCostUsd, priceP: egpToPiastres(egpPrice) });
    rows.push({
      pack: pack.id, currency: "EGP", listPrice: egpPrice,
      fee: piastresToEgp(pm.feeP + pm.vatP),
      netRevenue: piastresToEgp(pm.netP),
      totalCost: piastresToEgp(pm.costP),
      marginPct: pm.ratio,
    });

    const usdPrice = parseUsd(pack.priceGulf);
    for (const currency of ["USD", "AED", "SAR"] as const) {
      const r = usdBasisRow(usdPrice, currency, packCostUsd);
      rows.push({ pack: pack.id, currency, listPrice: r.listPrice, fee: r.fee, netRevenue: r.netRevenue, totalCost: r.totalCost, marginPct: r.marginPct });
    }
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
    const label = `tier "${r.tier}" (${r.currency})`;
    if (r.marginPct < HARD_FLOOR) {
      violations.push(`${label}: worst-case margin ${(r.marginPct * 100).toFixed(1)}% < hard floor ${(HARD_FLOOR * 100).toFixed(0)}%`);
    } else if (r.marginPct < WARN_TARGET) {
      warnings.push(`${label}: worst-case margin ${(r.marginPct * 100).toFixed(1)}% < target ${(WARN_TARGET * 100).toFixed(0)}%`);
    }
  }

  const topupRows = topupMarginRows();
  for (const r of topupRows) {
    const label = `top-up "${r.pack}" (${r.currency})`;
    if (r.marginPct < HARD_FLOOR) {
      violations.push(`${label}: worst-case margin ${(r.marginPct * 100).toFixed(1)}% < hard floor ${(HARD_FLOOR * 100).toFixed(0)}%`);
    } else if (r.marginPct < WARN_TARGET) {
      warnings.push(`${label}: worst-case margin ${(r.marginPct * 100).toFixed(1)}% < target ${(WARN_TARGET * 100).toFixed(0)}%`);
    }
  }

  return { ok: violations.length === 0, violations, warnings, tierRows, topupRows };
}

function fmtAmount(amount: number, currency: Currency): string {
  if (currency === "EGP") return `${amount.toFixed(2)} EGP`;
  if (currency === "USD") return `$${amount.toFixed(2)}`;
  return `${currency} ${amount.toFixed(2)}`;
}

export function formatReport(r: GuardResult): string {
  const lines: string[] = [];
  lines.push("");
  lines.push(
    `  AutoLeadss margin-guard  ·  WhatsApp $${WHATSAPP_COST_USD}/conv  ·  AI-action $${AI_ACTION_COST_USD}/action  ·  FX ${usdToEgpRate()} EGP/$1  ·  AED peg ${CURRENCY_PEGS.AED}  ·  SAR peg ${CURRENCY_PEGS.SAR}  ·  VAT-inclusive`,
  );
  lines.push("  " + "-".repeat(88));
  lines.push("  tier/pack       currency  list price     net rev.       total cost     margin");
  for (const t of r.tierRows) {
    lines.push(
      "  " +
        t.tier.padEnd(15) +
        t.currency.padEnd(10) +
        fmtAmount(t.listPrice, t.currency).padEnd(15) +
        fmtAmount(t.netRevenue, t.currency).padEnd(15) +
        fmtAmount(t.totalCost, t.currency).padEnd(15) +
        (t.marginPct * 100).toFixed(1) + "%",
    );
  }
  for (const t of r.topupRows) {
    lines.push(
      "  " +
        `topup-${t.pack}`.padEnd(15) +
        t.currency.padEnd(10) +
        fmtAmount(t.listPrice, t.currency).padEnd(15) +
        fmtAmount(t.netRevenue, t.currency).padEnd(15) +
        fmtAmount(t.totalCost, t.currency).padEnd(15) +
        (t.marginPct * 100).toFixed(1) + "%",
    );
  }
  lines.push("  " + "-".repeat(88));
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
