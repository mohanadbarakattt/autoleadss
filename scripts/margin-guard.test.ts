import { describe, expect, it } from "vitest";
import {
  DISPLAYED_CURRENCIES,
  HARD_FLOOR,
  runMarginGuard,
  tierMarginRows,
  topupMarginRows,
} from "./margin-guard";

describe("margin-guard", () => {
  it("passes overall (no hard-floor violations)", () => {
    const result = runMarginGuard();
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("produces a row for every displayed currency, for every tier and top-up pack", () => {
    const tierRows = tierMarginRows();
    const topupRows = topupMarginRows();
    for (const tier of ["growth", "pro"]) {
      const currencies = tierRows.filter((r) => r.tier === tier).map((r) => r.currency).sort();
      expect(currencies).toEqual([...DISPLAYED_CURRENCIES].sort());
    }
    for (const pack of ["small", "medium", "large"]) {
      const currencies = topupRows.filter((r) => r.pack === pack).map((r) => r.currency).sort();
      expect(currencies).toEqual([...DISPLAYED_CURRENCIES].sort());
    }
  });

  it("every row clears the hard floor", () => {
    for (const r of [...tierMarginRows(), ...topupMarginRows()]) {
      expect(r.marginPct).toBeGreaterThanOrEqual(HARD_FLOOR);
    }
  });

  it("AED/SAR margin is numerically close to USD's — proven, not assumed", () => {
    // Rounding a peg-converted price to a whole unit is the only thing that can
    // move AED/SAR margin away from USD's; that rounding noise is at most a
    // fraction of a currency unit on a $12+ price, so the two should land
    // within a fraction of a percentage point of each other.
    function assertPegParity(group: { currency: string; marginPct: number }[]) {
      const usd = group.find((r) => r.currency === "USD")!.marginPct;
      for (const currency of ["AED", "SAR"]) {
        const converted = group.find((r) => r.currency === currency)!.marginPct;
        expect(Math.abs(converted - usd)).toBeLessThan(0.005); // < 0.5 percentage point
      }
    }
    for (const tier of ["growth", "pro"]) {
      assertPegParity(tierMarginRows().filter((r) => r.tier === tier));
    }
    for (const pack of ["small", "medium", "large"]) {
      assertPegParity(topupMarginRows().filter((r) => r.pack === pack));
    }
  });

  it("EGP margin is computed independently (VAT/Paymob), not forced to match USD", () => {
    // Sanity check that EGP isn't accidentally routed through the USD-basis
    // path — it uses a different fee model (Paymob %, not Stripe) and VAT, so
    // its margin is NOT expected to match USD's.
    const growthRows = tierMarginRows().filter((r) => r.tier === "growth");
    const egp = growthRows.find((r) => r.currency === "EGP")!.marginPct;
    const usd = growthRows.find((r) => r.currency === "USD")!.marginPct;
    expect(egp).not.toBeCloseTo(usd, 2);
  });
});
