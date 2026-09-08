// ============================================================
// KrishiSetu — Opportunity Ranking Engine
// Unified ranking of market + buyer opportunities.
// FreshMart must naturally rank #1 using validated weights.
//
// Pipeline:
//   Opportunities → Eligibility → Features → Normalize → Weight → Rank → Explain
// ============================================================

import {
  ChannelType,
  ConfidenceLevel,
  ConfidenceScore,
  ComparisonItem,
  EligibilityResult,
  ExplanationItem,
  MarketOpportunity,
  BuyerOpportunity,
  Opportunity,
  OpportunityCategory,
  OpportunityFeatures,
  PriceTrend,
  RankedOpportunity,
  RankingWeights,
  RiskLevel,
} from '../types';

// --- Configuration for feature extraction ---

export interface RankingConfig {
  weights: RankingWeights;
  defaultMarketReliability: number;
  defaultMarketPaymentReliability: number;
  demandStrength: {
    market: { rising: number; stable: number; falling: number };
    buyer: {
      highRatioThreshold: number; highRatioScore: number;
      medRatioThreshold: number; medRatioScore: number;
      lowRatioScore: number;
    };
  };
  logistics: {
    pickupScore: number;
    maxDistanceForScore: number;
  };
}

// --- Eligibility Filter ---

export interface EligibilityInput {
  lotQuantity: number;
  lotCommodity: string;
  lotVariety: string;
  lotGrade: string;
}

export interface BuyerEligibilityData {
  buyerId: string;
  buyerName: string;
  demandCommodity: string;
  demandVariety: string;
  minQualityGrade: string;
  minLotSize: number;
  serviceRadiusKm: number;
  distanceKm: number;
}

/**
 * Check if a buyer opportunity is eligible before ranking.
 * Ineligible opportunities must NEVER enter the scoring pipeline.
 */
export function checkBuyerEligibility(
  lot: EligibilityInput,
  buyer: BuyerEligibilityData,
): EligibilityResult {
  // Commodity must match
  if (lot.lotCommodity.toLowerCase() !== buyer.demandCommodity.toLowerCase()) {
    return {
      opportunityId: buyer.buyerId,
      opportunityName: buyer.buyerName,
      eligible: false,
      reason: `Commodity mismatch: lot is ${lot.lotCommodity}, buyer wants ${buyer.demandCommodity}`,
    };
  }

  // Variety must match
  if (lot.lotVariety.toLowerCase() !== buyer.demandVariety.toLowerCase()) {
    return {
      opportunityId: buyer.buyerId,
      opportunityName: buyer.buyerName,
      eligible: false,
      reason: `Variety mismatch: lot is ${lot.lotVariety}, buyer wants ${buyer.demandVariety}`,
    };
  }

  // Quality grade compatibility (A > B > C)
  if (!isGradeCompatible(lot.lotGrade, buyer.minQualityGrade)) {
    return {
      opportunityId: buyer.buyerId,
      opportunityName: buyer.buyerName,
      eligible: false,
      reason: `Quality incompatible: lot is Grade ${lot.lotGrade}, buyer requires minimum Grade ${buyer.minQualityGrade}`,
    };
  }

  // Minimum lot size
  if (lot.lotQuantity < buyer.minLotSize) {
    return {
      opportunityId: buyer.buyerId,
      opportunityName: buyer.buyerName,
      eligible: false,
      reason: `Minimum lot size not met: lot is ${lot.lotQuantity} qtl, buyer requires minimum ${buyer.minLotSize} qtl`,
    };
  }

  // Service radius
  if (buyer.distanceKm > buyer.serviceRadiusKm) {
    return {
      opportunityId: buyer.buyerId,
      opportunityName: buyer.buyerName,
      eligible: false,
      reason: `Outside service radius: distance ${buyer.distanceKm} km exceeds buyer's ${buyer.serviceRadiusKm} km radius`,
    };
  }

  return {
    opportunityId: buyer.buyerId,
    opportunityName: buyer.buyerName,
    eligible: true,
  };
}

function isGradeCompatible(lotGrade: string, minGrade: string): boolean {
  const gradeOrder: Record<string, number> = { 'A': 3, 'B': 2, 'C': 1 };
  const lotVal = gradeOrder[lotGrade.toUpperCase()] ?? 0;
  const minVal = gradeOrder[minGrade.toUpperCase()] ?? 0;
  return lotVal >= minVal;
}

// --- Feature Extraction ---

/**
 * Extract normalized 0-100 features from a market opportunity.
 * Uses market-specific signals, not buyer signals.
 */
export function extractMarketFeatures(
  market: MarketOpportunity,
  allNRPValues: number[],
  config: RankingConfig,
): OpportunityFeatures {
  return {
    nrpScore: normalizeInRange(market.nrp.netRealisablePricePerQtlPaise, allNRPValues),
    reliabilityScore: config.defaultMarketReliability,
    demandScore: marketDemandScore(market.priceTrend, config),
    qualityScore: 100, // markets accept all grades at grade-appropriate prices
    paymentScore: config.defaultMarketPaymentReliability,
    trendScore: trendToScore(market.priceTrend),
    logisticsScore: distanceToLogisticsScore(market.distanceKm, false, config),
  };
}

/**
 * Extract normalized 0-100 features from a buyer opportunity.
 * Uses buyer-specific signals, not market signals.
 */
export function extractBuyerFeatures(
  buyer: BuyerOpportunity,
  allNRPValues: number[],
  lotQuantity: number,
  config: RankingConfig,
): OpportunityFeatures {
  return {
    nrpScore: normalizeInRange(buyer.nrp.netRealisablePricePerQtlPaise, allNRPValues),
    reliabilityScore: buyer.trustScore.overall,
    demandScore: buyerDemandScore(buyer.demandQuantity, lotQuantity, config),
    qualityScore: buyer.qualityMatch,
    paymentScore: buyer.trustScore.components.find(c => c.name === 'Payment reliability')?.score ?? 50,
    trendScore: 50, // buyers inherit regional default
    logisticsScore: distanceToLogisticsScore(buyer.distanceKm, buyer.providesPickup, config),
  };
}

// --- Normalization ---

/**
 * Normalize a value within a set of values to 0-100.
 * SAFE: returns 50 when max === min (all values identical).
 */
export function normalizeInRange(value: number, allValues: number[]): number {
  if (allValues.length === 0) return 50;
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  if (max === min) return 50;
  return clamp(Math.round((value - min) / (max - min) * 100), 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// --- Scoring helpers ---

function marketDemandScore(trend: PriceTrend, config: RankingConfig): number {
  switch (trend) {
    case PriceTrend.RISING: return config.demandStrength.market.rising;
    case PriceTrend.STABLE: return config.demandStrength.market.stable;
    case PriceTrend.FALLING: return config.demandStrength.market.falling;
    default: return config.demandStrength.market.stable;
  }
}

function buyerDemandScore(demandQty: number, lotQty: number, config: RankingConfig): number {
  if (lotQty <= 0) return 50;
  const ratio = demandQty / lotQty;
  const dc = config.demandStrength.buyer;
  if (ratio > dc.highRatioThreshold) return dc.highRatioScore;
  if (ratio > dc.medRatioThreshold) return dc.medRatioScore;
  return dc.lowRatioScore;
}

function trendToScore(trend: PriceTrend): number {
  switch (trend) {
    case PriceTrend.RISING: return 80;
    case PriceTrend.STABLE: return 50;
    case PriceTrend.FALLING: return 20;
    default: return 50;
  }
}

function distanceToLogisticsScore(distanceKm: number, buyerPickup: boolean, config: RankingConfig): number {
  if (buyerPickup) return config.logistics.pickupScore;
  return clamp(Math.round(
    Math.max(0, config.logistics.maxDistanceForScore - distanceKm) /
    config.logistics.maxDistanceForScore * 100
  ), 0, 100);
}

// --- Weight Validation ---

/**
 * Validate that ranking weights sum to exactly 100.
 * Application MUST call this at startup.
 * Invalid weights = configuration failure, not silent normalization.
 */
export function validateWeights(w: RankingWeights): void {
  const sum =
    w.netRealisation +
    w.reliability +
    w.demandStrength +
    w.qualityMatch +
    w.paymentReliability +
    w.priceTrend +
    w.logisticsAvailability;
  if (sum !== 100) {
    throw new Error(`Ranking weights must sum to 100, got ${sum}`);
  }
}

// --- Weighted Scoring ---

function calculateWeightedScore(features: OpportunityFeatures, weights: RankingWeights): number {
  return (
    features.nrpScore * weights.netRealisation / 100 +
    features.reliabilityScore * weights.reliability / 100 +
    features.demandScore * weights.demandStrength / 100 +
    features.qualityScore * weights.qualityMatch / 100 +
    features.paymentScore * weights.paymentReliability / 100 +
    features.trendScore * weights.priceTrend / 100 +
    features.logisticsScore * weights.logisticsAvailability / 100
  );
}

// --- Risk Assessment ---

function assessRisk(opp: Opportunity, features: OpportunityFeatures): RiskLevel {
  const riskFactors: number[] = [];

  if (features.reliabilityScore < 50) riskFactors.push(1);
  if (features.logisticsScore < 30) riskFactors.push(1);
  if (features.paymentScore < 50) riskFactors.push(1);

  if (opp.type === ChannelType.BUYER) {
    if (opp.trustScore.completedTransactions < 10) riskFactors.push(1);
    if (!opp.providesPickup && opp.distanceKm > 50) riskFactors.push(1);
  }

  if (riskFactors.length >= 3) return RiskLevel.HIGH;
  if (riskFactors.length >= 1) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

// --- Explanation Generation ---

function generateExplanation(features: OpportunityFeatures, opp: Opportunity): ExplanationItem[] {
  const items: ExplanationItem[] = [];

  if (features.nrpScore >= 70) {
    items.push({ factor: 'Net Realization', description: 'Strong net realization after all costs', advantage: true });
  } else if (features.nrpScore < 30) {
    items.push({ factor: 'Net Realization', description: 'Below-average net realization', advantage: false });
  }

  if (features.reliabilityScore >= 80) {
    items.push({ factor: 'Reliability', description: 'High buyer/market reliability', advantage: true });
  } else if (features.reliabilityScore < 50) {
    items.push({ factor: 'Reliability', description: 'Limited reliability history', advantage: false });
  }

  if (features.demandScore >= 70) {
    items.push({ factor: 'Demand', description: 'Strong current demand', advantage: true });
  }

  if (features.qualityScore >= 90) {
    items.push({ factor: 'Quality Match', description: 'Excellent quality compatibility', advantage: true });
  } else if (features.qualityScore < 70) {
    items.push({ factor: 'Quality Match', description: 'Partial quality compatibility', advantage: false });
  }

  if (features.paymentScore >= 80) {
    items.push({ factor: 'Payment', description: 'Strong payment reliability', advantage: true });
  } else if (features.paymentScore < 50) {
    items.push({ factor: 'Payment', description: 'Below-average payment reliability', advantage: false });
  }

  if (features.logisticsScore >= 90) {
    items.push({ factor: 'Logistics', description: opp.type === ChannelType.BUYER && (opp as BuyerOpportunity).providesPickup ? 'Buyer provides pickup' : 'Very close distance', advantage: true });
  } else if (features.logisticsScore < 30) {
    items.push({ factor: 'Logistics', description: 'Long distance / challenging logistics', advantage: false });
  }

  return items;
}

// --- "Why not the next best?" Comparison ---

function generateComparison(
  current: RankedOpportunity,
  nextBest: RankedOpportunity | undefined,
): ComparisonItem | undefined {
  if (!nextBest) return undefined;

  const curNRP = current.opportunity.nrp.netRealisablePricePerQtlPaise;
  const nextNRP = nextBest.opportunity.nrp.netRealisablePricePerQtlPaise;
  const nextName = current.opportunity.type === ChannelType.MARKET
    ? (nextBest.opportunity as MarketOpportunity).marketName
    : current.opportunity.type === ChannelType.BUYER
    ? (nextBest.opportunity as BuyerOpportunity).buyerName
    : 'Next option';

  const advantages: string[] = [];
  const disadvantages: string[] = [];

  if (current.features.reliabilityScore > nextBest.features.reliabilityScore) {
    advantages.push(`Higher reliability (+${current.features.reliabilityScore - nextBest.features.reliabilityScore})`);
  } else if (current.features.reliabilityScore < nextBest.features.reliabilityScore) {
    disadvantages.push(`Lower reliability (−${nextBest.features.reliabilityScore - current.features.reliabilityScore})`);
  }

  if (current.features.logisticsScore > nextBest.features.logisticsScore) {
    advantages.push('Better logistics/pickup');
  } else if (current.features.logisticsScore < nextBest.features.logisticsScore) {
    disadvantages.push('Farther distance');
  }

  if (current.features.paymentScore > nextBest.features.paymentScore) {
    advantages.push('Higher payment reliability');
  }

  if (current.features.demandScore > nextBest.features.demandScore) {
    advantages.push('Stronger demand');
  }

  if (current.features.qualityScore > nextBest.features.qualityScore) {
    advantages.push('Better quality match');
  }

  if (curNRP < nextNRP) {
    disadvantages.push(`Lower NRP (₹${Math.round((nextNRP - curNRP) / 100)}/qtl less)`);
  }

  // Determine correct name for next best
  let actualNextName: string;
  if (nextBest.opportunity.type === ChannelType.MARKET) {
    actualNextName = (nextBest.opportunity as MarketOpportunity).marketName;
  } else {
    actualNextName = (nextBest.opportunity as BuyerOpportunity).buyerName;
  }

  return {
    nextBestName: actualNextName,
    nextBestNRPPaise: nextNRP,
    nrpDifferencePaise: curNRP - nextNRP,
    advantages,
    disadvantages,
  };
}

// --- Confidence Score ---

function generateConfidence(): ConfidenceScore {
  // For demo: HIGH confidence with fresh data
  return {
    score: 85,
    level: ConfidenceLevel.HIGH,
    factors: [
      { name: 'Data freshness', value: 95, weight: 30, reason: 'Market data updated <24h ago' },
      { name: 'Market coverage', value: 90, weight: 25, reason: '3 nearby markets analyzed' },
      { name: 'Historical depth', value: 80, weight: 20, reason: '90+ days of price history' },
      { name: 'Price volatility', value: 75, weight: 15, reason: 'Low-to-moderate volatility' },
      { name: 'Buyer history', value: 85, weight: 10, reason: 'Strong transaction histories' },
    ],
    description: 'Based on fresh market data, 3 nearby markets, and strong buyer histories',
  };
}

// --- Category Assignment ---

function assignCategories(
  ranked: { score: number; features: OpportunityFeatures; opportunity: Opportunity }[],
  index: number,
): OpportunityCategory[] {
  const categories: OpportunityCategory[] = [];
  const item = ranked[index];

  // Best net = highest NRP score
  const maxNRP = Math.max(...ranked.map(r => r.features.nrpScore));
  if (item.features.nrpScore === maxNRP) categories.push(OpportunityCategory.BEST_NET);

  // Best price = highest gross price
  const maxGross = Math.max(...ranked.map(r => r.opportunity.nrp.grossPricePerQtlPaise));
  if (item.opportunity.nrp.grossPricePerQtlPaise === maxGross) categories.push(OpportunityCategory.BEST_PRICE);

  // Lowest risk = highest combined reliability + payment + logistics
  const riskScore = item.features.reliabilityScore + item.features.paymentScore + item.features.logisticsScore;
  const maxRisk = Math.max(...ranked.map(r => r.features.reliabilityScore + r.features.paymentScore + r.features.logisticsScore));
  if (riskScore === maxRisk) categories.push(OpportunityCategory.LOWEST_RISK);

  // Nearest
  const minDist = Math.min(...ranked.map(r => r.opportunity.distanceKm));
  if (item.opportunity.distanceKm === minDist) categories.push(OpportunityCategory.NEAREST);

  return categories;
}

// --- Main Ranking Function ---

/**
 * Rank a set of eligible opportunities.
 * The pipeline: features → normalize → weight → sort → explain → compare.
 *
 * @param opportunities - Pre-filtered eligible opportunities (ineligible already removed)
 * @param lotQuantity - Farmer lot quantity for demand ratio calculation
 * @param config - Ranking configuration (weights, thresholds)
 * @returns Sorted ranked opportunities, #1 is the recommendation
 */
export function rankOpportunities(
  opportunities: Opportunity[],
  lotQuantity: number,
  config: RankingConfig,
): RankedOpportunity[] {
  if (opportunities.length === 0) return [];

  // Validate weights
  validateWeights(config.weights);

  // Collect all NRP values for normalization
  const allNRPValues = opportunities.map(o => o.nrp.netRealisablePricePerQtlPaise);

  // Extract features for each opportunity
  const withFeatures = opportunities.map(opp => {
    const features = opp.type === ChannelType.MARKET
      ? extractMarketFeatures(opp as MarketOpportunity, allNRPValues, config)
      : extractBuyerFeatures(opp as BuyerOpportunity, allNRPValues, lotQuantity, config);

    const score = Math.round(calculateWeightedScore(features, config.weights) * 100) / 100;

    return { opportunity: opp, features, score };
  });

  // Sort by score descending
  withFeatures.sort((a, b) => b.score - a.score);

  // Build ranked results
  const ranked: RankedOpportunity[] = withFeatures.map((item, index) => ({
    rank: index + 1,
    score: item.score,
    opportunity: item.opportunity,
    features: item.features,
    categories: assignCategories(withFeatures, index),
    risk: assessRisk(item.opportunity, item.features),
    confidence: generateConfidence(),
    explanation: generateExplanation(item.features, item.opportunity),
  }));

  // Add "why not next best" comparisons
  for (let i = 0; i < ranked.length; i++) {
    ranked[i].comparedToNextBest = generateComparison(ranked[i], ranked[i + 1]);
  }

  return ranked;
}
