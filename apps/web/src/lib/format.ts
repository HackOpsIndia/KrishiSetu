// ============================================================
// Formatting Utilities — For display only, NOT for calculations.
// All financial values come pre-calculated from the API.
// ============================================================

/**
 * Format paise as Indian Rupees string.
 * Display only — never use for calculations.
 */
export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatRupeesDecimal(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function formatPerQtl(paise: number): string {
  return `${formatRupees(paise)}/qtl`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function formatDistance(km: number): string {
  return `${km} km`;
}

export function formatCurrency(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function formatQuintal(qtl: number): string {
  return `${qtl} Qtl`;
}

