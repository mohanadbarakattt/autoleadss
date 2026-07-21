// VENDORED from mbai-ecosystem/packages/money/src/money.ts
// DO NOT EDIT HERE — edit the source package and re-run:
//   node packages/money/sync.mjs <this-dir>
// A CI drift check (packages/money/check-drift.mjs) fails if this copy is
// edited locally or falls behind source.
import { PIASTRES_PER_EGP, EGYPT_VAT_RATE } from './constants';

/** Money in integer piastres. Never a float — see constants.ts. */
export type Piastres = number;

export function egpToPiastres(egp: number): Piastres {
  if (!Number.isFinite(egp)) throw new Error(`egpToPiastres: not a number: ${egp}`);
  return Math.round(egp * PIASTRES_PER_EGP);
}

export function piastresToEgp(p: Piastres): number {
  return p / PIASTRES_PER_EGP;
}

/** Arabic-Indic digits, for the ar locale only. Franco is Latin-script by
 * definition, so ٠-٩ inside a Franco string is defect class F2. */
const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toArabicIndic(s: string): string {
  return s.replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)]!);
}

export type MoneyLocale = 'en' | 'ar' | 'franco';

export interface FormatOptions {
  /** Drop ".00" on whole amounts. Default true — "250 EGP" reads better than
   * "250.00 EGP" in a chat reply. */
  compact?: boolean;
}

/**
 * Formats piastres for display. The locale decides BOTH numerals and currency:
 *   en     -> "250 EGP"
 *   ar     -> "٢٥٠ جنيه"    (Arabic-Indic)
 *   franco -> "250 geneh"   (Latin digits always; and "geneh", never "gene3"
 *             — the owner's correction: the word does not end in 3.)
 */
export function formatEgp(p: Piastres, locale: MoneyLocale = 'en', opts: FormatOptions = {}): string {
  const compact = opts.compact ?? true;
  const egp = piastresToEgp(p);
  const whole = p % PIASTRES_PER_EGP === 0;
  const num = compact && whole ? String(egp) : egp.toFixed(2);
  const grouped = num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  switch (locale) {
    case 'ar':
      return `${toArabicIndic(grouped)} جنيه`;
    case 'franco':
      return `${grouped} geneh`;
    default:
      return `${grouped} EGP`;
  }
}

/** Adds VAT to a VAT-exclusive amount. */
export function vatExclusive(p: Piastres, rate: number = EGYPT_VAT_RATE): Piastres {
  return Math.round(p * (1 + rate));
}

/** Splits a VAT-inclusive amount into net and VAT. */
export function vatInclusive(p: Piastres, rate: number = EGYPT_VAT_RATE): { net: Piastres; vat: Piastres } {
  const net = Math.round(p / (1 + rate));
  return { net, vat: p - net };
}
