// VENDORED from mbai-ecosystem/packages/money/src/margin.ts
// DO NOT EDIT HERE — edit the source package and re-run:
//   node packages/money/sync.mjs <this-dir>
// A CI drift check (packages/money/check-drift.mjs) fails if this copy is
// edited locally or falls behind source.
import { usdToEgpRate, EGYPT_VAT_RATE } from './constants';
import { processorFee, type PayMethod } from './fees';
import { egpToPiastres, type Piastres } from './money';

/**
 * FX-aware margin maths.
 *
 * The whole point: cost is incurred in USD (Google) and revenue collected in
 * EGP, so margin is a function of the exchange rate. A floor computed once in
 * EGP goes silently underwater as the pound moves — which is exactly what
 * happened: autoleadss carried FX=49 against a real 55, understating cost 12%
 * while its guard kept reporting healthy margins.
 */

export interface MarginInput {
  /** What we pay the provider, in USD, for everything this price must cover. */
  costUsd: number;
  /** What the customer pays, in piastres — the GROSS, VAT-inclusive amount. */
  priceP: Piastres;
  /** USD->EGP. Defaults to the env/owner rate. */
  rate?: number;
  /** Override the processor fee. Defaults to the fee for `method`. */
  feeP?: Piastres;
  /** Fawry costs more than cards/wallets. Defaults to card. */
  method?: PayMethod;
  /**
   * Owner decision 2026-07-20: listed prices ARE VAT-inclusive, so 14% of
   * every headline price is remitted to the government and was never ours.
   * Ignoring this overstates margin by ~12% of gross. Set false only for a
   * genuinely VAT-exempt line.
   */
  vatInclusive?: boolean;
}

export interface MarginResult {
  /** VAT remitted to the government — never ours. */
  vatP: Piastres;
  /** Processor fee taken, in piastres. */
  feeP: Piastres;
  /** Revenue we actually keep: gross - VAT - fee. */
  netP: Piastres;
  /** Provider cost converted at `rate`, in piastres. */
  costP: Piastres;
  /** Gross profit in piastres (can be negative). */
  profitP: Piastres;
  /** profit / net. 0.55 = 55% margin. Negative means loss-making. */
  ratio: number;
  /** net / cost. The multiplier virlo's >=3.3x floor uses. Infinity at zero cost. */
  multiple: number;
  rate: number;
}

export function computeMargin(input: MarginInput): MarginResult {
  const rate = input.rate ?? usdToEgpRate();
  const method = input.method ?? 'card';
  // The processor takes its cut of the GROSS charged amount, VAT included.
  const feeP = input.feeP ?? processorFee(input.priceP, method);
  const vatIncl = input.vatInclusive ?? true;
  const vatP = vatIncl ? input.priceP - Math.round(input.priceP / (1 + EGYPT_VAT_RATE)) : 0;
  const costP = egpToPiastres(input.costUsd * rate);
  const netP = input.priceP - vatP - feeP;
  const profitP = netP - costP;
  return {
    vatP,
    feeP,
    netP,
    costP,
    profitP,
    ratio: netP === 0 ? 0 : profitP / netP,
    multiple: costP === 0 ? Infinity : netP / costP,
    rate,
  };
}

export interface FloorViolation {
  label: string;
  ratio: number;
  floor: number;
  netP: Piastres;
  costP: Piastres;
  message: string;
}

/**
 * Checks a set of priced items against a margin floor. Returns violations
 * rather than throwing so a CI script can report ALL failures at once instead
 * of stopping at the first — a partial list invites a fix-one-rerun loop.
 */
export function checkMarginFloor(
  items: Array<{ label: string } & MarginInput>,
  floor: number,
): FloorViolation[] {
  return items.flatMap((item) => {
    const m = computeMargin(item);
    if (m.ratio >= floor) return [];
    return [{
      label: item.label,
      ratio: m.ratio,
      floor,
      netP: m.netP,
      costP: m.costP,
      message:
        `${item.label}: margin ${(m.ratio * 100).toFixed(1)}% is below the ${(floor * 100).toFixed(0)}% floor ` +
        `(net ${(m.netP / 100).toFixed(2)} EGP - cost ${(m.costP / 100).toFixed(2)} EGP at ${m.rate} EGP/USD)`,
    }];
  });
}

/**
 * The smallest price that clears `floor` for a given cost — the answer to
 * "what is the minimum viable top-up?". With a FLAT processor fee this is not
 * proportional: the fee has to be cleared before any margin exists at all.
 */
export function minimumViablePrice(costUsd: number, floor: number, rate?: number): Piastres {
  if (floor >= 1) throw new Error('floor must be < 1');
  const r = rate ?? usdToEgpRate();
  const costP = egpToPiastres(costUsd * r);
  const requiredNet = costP / (1 - floor);
  // Gross must cover net + VAT + a percentage fee that is itself charged on
  // the gross, so solve rather than add: with v = VAT rate and p = fee %,
  //   net = gross/(1+v) - (gross*p + flat)  ->  gross = (net + flat) / (1/(1+v) - p)
  const denom = 1 / (1 + EGYPT_VAT_RATE) - 0.0275;
  let gross = Math.ceil((requiredNet + 300) / denom);
  // The closed form is a hair under after integer rounding of VAT and fee
  // (0.54999 vs a 0.55 floor), so verify and nudge. Cheap, and it means the
  // returned price provably clears the floor rather than nearly clearing it.
  for (let i = 0; i < 100 && computeMargin({ costUsd, priceP: gross, rate: r }).ratio < floor; i++) {
    gross += 1;
  }
  return gross;
}
