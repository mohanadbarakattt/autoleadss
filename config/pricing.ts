export type Industry = 'ecommerce' | 'realEstate';
export type ContractLength = 3 | 6 | 12;

export interface PricingTier {
  id: 'starter' | 'growth' | 'premium';
  // TODO: operator to provide final prices in AED
  baseMonthlyAed: number;
  performanceFee: {
    ecommerce: number;       // fraction (e.g. 0.07 = 7%)
    realEstateCommission: number; // fraction of broker commission
  };
  attributionWindows: {
    ecommerce: { clickDays: number; viewDays: number };
    realEstate: { clickDays: number };
  };
}

export const tiers: PricingTier[] = [
  {
    id: 'starter',
    baseMonthlyAed: 3500, // TODO: operator to confirm
    performanceFee: {
      ecommerce: 0.07,            // TODO: operator to confirm (7%)
      realEstateCommission: 0.20, // TODO: operator to confirm (20% of broker commission)
    },
    attributionWindows: {
      ecommerce: { clickDays: 30, viewDays: 7 },
      realEstate: { clickDays: 90 },
    },
  },
  {
    id: 'growth',
    baseMonthlyAed: 6500, // TODO: operator to confirm
    performanceFee: {
      ecommerce: 0.05,            // TODO: operator to confirm (5%)
      realEstateCommission: 0.15, // TODO: operator to confirm (15% of broker commission)
    },
    attributionWindows: {
      ecommerce: { clickDays: 30, viewDays: 7 },
      realEstate: { clickDays: 90 },
    },
  },
  {
    id: 'premium',
    baseMonthlyAed: 12000, // TODO: operator to confirm
    performanceFee: {
      ecommerce: 0.03,            // TODO: operator to confirm (3%)
      realEstateCommission: 0.10, // TODO: operator to confirm (10% of broker commission)
    },
    attributionWindows: {
      ecommerce: { clickDays: 30, viewDays: 7 },
      realEstate: { clickDays: 90 },
    },
  },
];

// TODO: operator to confirm discount percentages
export const contractDiscounts: Record<ContractLength, number> = {
  3: 0,    // full price
  6: 0.10, // -10%
  12: 0.20, // -20%
};

export function getDiscountedPrice(basePrice: number, contractLength: ContractLength): number {
  return Math.round(basePrice * (1 - contractDiscounts[contractLength]));
}

export function formatAed(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(fraction: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(fraction);
}
