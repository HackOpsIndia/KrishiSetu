// ============================================================
// KrishiSetu — Buyer Matching Engine
// Determines compatibility between farmer lots and buyer demand.
// Returns match score with factor-level explanations.
//
// Eligibility is checked FIRST. Incompatible buyers never score.
// ============================================================

import { MatchFactor, MatchResult } from '../types';

export interface MatchLotInput {
  commodityName: string;
  varietyName: string;
  qualityGrade: string;
  quantity: number;
  /** Farmer's minimum acceptable price in paise per qtl */
  minAcceptablePricePaise: number;
  /** Expected sale/delivery date ISO string */
  expectedSaleDate: string;
}

export interface MatchBuyerDemandInput {
  buyerId: string;
  demandId: string;
  buyerName: string;
  commodityName: string;
  varietyName: string;
  minQualityGrade: string;
  demandQuantity: number;
  minLotSize: number;
  priceLowPaise: number;
  priceHighPaise: number;
  offeredPricePaise: number;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  serviceRadiusKm: number;
  distanceKm: number;
  qualityMatchScore: number;
  trustScoreOverall: number;
  providesPickup: boolean;
}

export interface MatchingConfig {
  weights: {
    priceCompatibility: number;   // 25
    qualityMatch: number;         // 20
    quantityFit: number;          // 15
    trustReliability: number;     // 15
    logisticsConvenience: number; // 15
    deliveryTiming: number;       // 10
  };
}

export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  weights: {
    priceCompatibility: 25,
    qualityMatch: 20,
    quantityFit: 15,
    trustReliability: 15,
    logisticsConvenience: 15,
    deliveryTiming: 10,
  },
};

// --- Grade ordering ---

const GRADE_ORDER: Record<string, number> = { 'A': 3, 'B': 2, 'C': 1 };

function isGradeCompatible(lotGrade: string, minGrade: string): boolean {
  return (GRADE_ORDER[lotGrade.toUpperCase()] ?? 0) >= (GRADE_ORDER[minGrade.toUpperCase()] ?? 0);
}

// --- Eligibility ---

export interface MatchEligibilityResult {
  eligible: boolean;
  reasons: string[];
}

/**
 * Check if a buyer demand is fundamentally compatible with a farmer lot.
 * Ineligible demands must NEVER enter the scoring pipeline.
 */
export function checkMatchEligibility(
  lot: MatchLotInput,
  demand: MatchBuyerDemandInput,
): MatchEligibilityResult {
  const reasons: string[] = [];

  // Commodity
  if (lot.commodityName.toLowerCase() !== demand.commodityName.toLowerCase()) {
    reasons.push(`Commodity mismatch: lot is ${lot.commodityName}, buyer wants ${demand.commodityName}`);
  }

  // Variety
  if (lot.varietyName.toLowerCase() !== demand.varietyName.toLowerCase()) {
    reasons.push(`Variety mismatch: lot is ${lot.varietyName}, buyer wants ${demand.varietyName}`);
  }

  // Quality grade
  if (!isGradeCompatible(lot.qualityGrade, demand.minQualityGrade)) {
    reasons.push(`Quality incompatible: lot Grade ${lot.qualityGrade}, buyer requires minimum Grade ${demand.minQualityGrade}`);
  }

  // Minimum lot size
  if (lot.quantity < demand.minLotSize) {
    reasons.push(`Minimum lot size not met: lot is ${lot.quantity} qtl, buyer requires minimum ${demand.minLotSize} qtl`);
  }

  // Service radius
  if (demand.distanceKm > demand.serviceRadiusKm) {
    reasons.push(`Outside service radius: ${demand.distanceKm} km exceeds ${demand.serviceRadiusKm} km`);
  }

  // Price compatibility (farmer min vs buyer max)
  if (lot.minAcceptablePricePaise > demand.priceHighPaise) {
    reasons.push(`Price incompatible: farmer minimum ₹${lot.minAcceptablePricePaise / 100}/qtl exceeds buyer maximum ₹${demand.priceHighPaise / 100}/qtl`);
  }

  // Delivery window
  const saleDate = new Date(lot.expectedSaleDate);
  const windowEnd = new Date(demand.deliveryWindowEnd);
  if (saleDate > windowEnd) {
    reasons.push(`Delivery timing: expected sale date ${lot.expectedSaleDate} is after buyer's window end ${demand.deliveryWindowEnd}`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

// --- Match Scoring ---

/**
 * Calculate match score for an eligible buyer demand.
 * All factors are 0–100. Returns weighted total with explanations.
 */
export function calculateMatchScore(
  lot: MatchLotInput,
  demand: MatchBuyerDemandInput,
  config: MatchingConfig = DEFAULT_MATCHING_CONFIG,
): MatchResult {
  const w = config.weights;

  // Validate weights sum to 100
  const wSum = w.priceCompatibility + w.qualityMatch + w.quantityFit +
    w.trustReliability + w.logisticsConvenience + w.deliveryTiming;
  if (wSum !== 100) {
    throw new Error(`Matching weights must sum to 100, got ${wSum}`);
  }

  const factors: MatchFactor[] = [];

  // 1. Price Compatibility (0–100)
  // How well does the buyer's offered price compare to farmer's expectation?
  const priceScore = computePriceScore(lot.minAcceptablePricePaise, demand.priceLowPaise, demand.priceHighPaise, demand.offeredPricePaise);
  factors.push({
    name: 'Price Compatibility',
    score: priceScore,
    weight: w.priceCompatibility,
    detail: `Offered ₹${demand.offeredPricePaise / 100}/qtl, farmer min ₹${lot.minAcceptablePricePaise / 100}/qtl`,
  });

  // 2. Quality Match (0–100)
  const qualityScore = demand.qualityMatchScore;
  factors.push({
    name: 'Quality Match',
    score: qualityScore,
    weight: w.qualityMatch,
    detail: `Buyer quality match assessment: ${qualityScore}%`,
  });

  // 3. Quantity Fit (0–100)
  const quantityScore = computeQuantityScore(lot.quantity, demand.demandQuantity, demand.minLotSize);
  factors.push({
    name: 'Quantity Fit',
    score: quantityScore,
    weight: w.quantityFit,
    detail: `Lot ${lot.quantity} qtl, buyer demand ${demand.demandQuantity} qtl (min ${demand.minLotSize} qtl)`,
  });

  // 4. Trust/Reliability (0–100)
  const trustScore = demand.trustScoreOverall;
  factors.push({
    name: 'Trust & Reliability',
    score: trustScore,
    weight: w.trustReliability,
    detail: `Buyer trust score: ${trustScore}/100`,
  });

  // 5. Logistics Convenience (0–100)
  const logisticsScore = computeLogisticsScore(demand.distanceKm, demand.providesPickup, demand.serviceRadiusKm);
  factors.push({
    name: 'Logistics Convenience',
    score: logisticsScore,
    weight: w.logisticsConvenience,
    detail: demand.providesPickup
      ? `Buyer provides pickup (${demand.distanceKm} km)`
      : `Farmer delivers to ${demand.distanceKm} km`,
  });

  // 6. Delivery Timing (0–100)
  const timingScore = computeTimingScore(lot.expectedSaleDate, demand.deliveryWindowStart, demand.deliveryWindowEnd);
  factors.push({
    name: 'Delivery Timing',
    score: timingScore,
    weight: w.deliveryTiming,
    detail: `Window: ${demand.deliveryWindowStart} to ${demand.deliveryWindowEnd}`,
  });

  // Weighted total
  const totalScore = Math.round(
    factors.reduce((sum, f) => sum + (f.score * f.weight / 100), 0) * 100
  ) / 100;

  // Explanations
  const explanation: string[] = [];
  const sorted = [...factors].sort((a, b) => b.score * b.weight - a.score * a.weight);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  explanation.push(`Strongest factor: ${strongest.name} (${strongest.score}%)`);
  if (weakest.score < 60) {
    explanation.push(`Area to watch: ${weakest.name} (${weakest.score}%)`);
  }
  if (demand.providesPickup) {
    explanation.push('Buyer provides pickup — eliminates transport cost');
  }

  return {
    buyerId: demand.buyerId,
    demandId: demand.demandId,
    score: totalScore,
    factors,
    explanation,
  };
}

// --- Scoring Helpers ---

function computePriceScore(
  farmerMinPaise: number,
  buyerLowPaise: number,
  buyerHighPaise: number,
  offeredPaise: number,
): number {
  if (offeredPaise <= 0 || farmerMinPaise <= 0) return 0;

  // How far above the farmer's minimum is the offered price?
  const aboveMin = offeredPaise - farmerMinPaise;
  const priceRange = buyerHighPaise - farmerMinPaise;

  if (priceRange <= 0) {
    return offeredPaise >= farmerMinPaise ? 80 : 20;
  }

  // Score based on where offered falls in (farmerMin → buyerHigh)
  const ratio = aboveMin / priceRange;
  return clamp(Math.round(ratio * 100), 0, 100);
}

function computeQuantityScore(
  lotQty: number,
  demandQty: number,
  minLotSize: number,
): number {
  if (lotQty < minLotSize) return 0;

  // Best when lot is a good fraction of demand (not too small, not oversupplying)
  const ratio = lotQty / demandQty;

  if (ratio >= 0.8 && ratio <= 1.2) return 100;  // near-perfect match
  if (ratio >= 0.5) return 90;                     // good partial
  if (ratio >= 0.2) return 75;                     // acceptable
  if (ratio >= 0.05) return 60;                    // small but worth it
  return 50;                                        // very small fraction
}

function computeLogisticsScore(
  distanceKm: number,
  buyerPickup: boolean,
  serviceRadiusKm: number,
): number {
  if (buyerPickup) return 100;

  // Score inversely proportional to distance within service radius
  if (serviceRadiusKm <= 0) return 50;
  const ratio = 1 - (distanceKm / serviceRadiusKm);
  return clamp(Math.round(ratio * 100), 10, 100);
}

function computeTimingScore(
  expectedSaleDate: string,
  windowStart: string,
  windowEnd: string,
): number {
  const sale = new Date(expectedSaleDate).getTime();
  const start = new Date(windowStart).getTime();
  const end = new Date(windowEnd).getTime();
  const windowDays = (end - start) / (1000 * 60 * 60 * 24);

  if (sale < start) {
    // Before window — how many days early?
    const earlyDays = (start - sale) / (1000 * 60 * 60 * 24);
    if (earlyDays <= 2) return 90;  // barely early
    if (earlyDays <= 5) return 70;
    return 50;
  }

  if (sale > end) {
    return 0; // after window — should have been filtered by eligibility
  }

  // Within window — best if in first third
  const positionInWindow = (sale - start) / (end - start);
  if (positionInWindow <= 0.33) return 100;
  if (positionInWindow <= 0.66) return 85;
  return 70;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
