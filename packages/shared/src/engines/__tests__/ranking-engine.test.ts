// ============================================================
// Ranking Engine Tests
// Validates opportunity ranking pipeline with canonical demo data.
// FreshMart MUST rank #1 — from engine logic, never hardcoded.
// ============================================================

import { rankOpportunities, checkBuyerEligibility, normalizeInRange, validateWeights, RankingConfig, EligibilityInput } from '../ranking-engine';
import { calculateNRP } from '../nrp-engine';
import { calculateTrustScore } from '../trust-engine';
import {
  DEMO_NRP_CONFIG,
  DEMO_RANKING_WEIGHTS,
  DEMO_MARKETS,
  DEMO_MARKET_PRICES,
  DEMO_BUYERS,
  DEMO_BUYER_DEMANDS,
  DEMO_LOT,
  DEMO_DEFAULT_MARKET_RELIABILITY,
  DEMO_DEFAULT_MARKET_PAYMENT_RELIABILITY,
  DEMAND_STRENGTH_CONFIG,
  LOGISTICS_SCORE_CONFIG,
} from '../../demo-scenario';
import {
  ChannelType,
  MarketOpportunity,
  BuyerOpportunity,
  Opportunity,
  NRPInput,
  PriceTrend,
  VerificationLevel,
} from '../../types';

const CONFIG = DEMO_NRP_CONFIG;
const LOT_QTY = DEMO_LOT.quantity;

const RANKING_CONFIG: RankingConfig = {
  weights: DEMO_RANKING_WEIGHTS,
  defaultMarketReliability: DEMO_DEFAULT_MARKET_RELIABILITY,
  defaultMarketPaymentReliability: DEMO_DEFAULT_MARKET_PAYMENT_RELIABILITY,
  demandStrength: DEMAND_STRENGTH_CONFIG,
  logistics: LOGISTICS_SCORE_CONFIG,
};

// Build full opportunity objects from demo data
function buildMarketOpportunity(marketName: string): MarketOpportunity {
  const market = DEMO_MARKETS.find(m => m.name === marketName)!;
  const price = DEMO_MARKET_PRICES.find(p => p.marketName === marketName)!;

  const nrpInput: NRPInput = {
    salePricePaise: price.modalPricePaise,
    quantity: LOT_QTY,
    distanceKm: market.distanceFromFarmerKm,
    channelType: ChannelType.MARKET,
    buyerProvidesPickup: false,
    commodityId: 'tomato',
    storageDays: 0,
  };

  return {
    type: ChannelType.MARKET,
    marketId: marketName.toLowerCase().replace(/\s/g, '-'),
    marketName: market.name,
    modalPricePaise: price.modalPricePaise,
    minPricePaise: price.minPricePaise,
    maxPricePaise: price.maxPricePaise,
    arrivals: price.arrivals,
    priceTrend: price.priceTrend,
    distanceKm: market.distanceFromFarmerKm,
    nrp: calculateNRP(nrpInput, CONFIG),
  };
}

function buildBuyerOpportunity(companyName: string): BuyerOpportunity {
  const buyer = DEMO_BUYERS.find(b => b.companyName === companyName)!;
  const demand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === companyName)!;

  const nrpInput: NRPInput = {
    salePricePaise: demand.offeredPricePaise,
    quantity: LOT_QTY,
    distanceKm: buyer.distanceFromFarmerKm,
    channelType: ChannelType.BUYER,
    buyerProvidesPickup: buyer.providesPickup,
    commodityId: 'tomato',
    storageDays: 0,
  };

  // Build trust score for buyer
  const trust = calculateTrustScore({
    completedTransactions: buyer.completedTransactions,
    successfulTransactions: Math.round(buyer.completedTransactions * 0.95),
    onTimePayments: Math.round(buyer.completedTransactions * buyer.paymentReliability / 100),
    disputes: Math.max(0, Math.round(buyer.completedTransactions * 0.03)),
    accountAgeDays: buyer.accountAgeDays,
    verificationLevel: buyer.verificationLevel,
  });

  return {
    type: ChannelType.BUYER,
    buyerId: companyName.toLowerCase().replace(/\s/g, '-'),
    buyerName: buyer.companyName,
    demandId: `demand-${companyName.toLowerCase().replace(/\s/g, '-')}`,
    offeredPricePaise: demand.offeredPricePaise,
    demandQuantity: demand.quantity,
    qualityMatch: demand.qualityMatchScore,
    trustScore: trust,
    distanceKm: buyer.distanceFromFarmerKm,
    deliveryWindow: `${demand.deliveryWindowStart} to ${demand.deliveryWindowEnd}`,
    providesPickup: buyer.providesPickup,
    nrp: calculateNRP(nrpInput, CONFIG),
  };
}

describe('Ranking Engine — Weight Validation', () => {
  test('canonical weights sum to 100', () => {
    expect(() => validateWeights(DEMO_RANKING_WEIGHTS)).not.toThrow();
  });

  test('rejects weights that do not sum to 100', () => {
    expect(() => validateWeights({
      ...DEMO_RANKING_WEIGHTS,
      netRealisation: 50,
    })).toThrow(/must sum to 100/);
  });
});

describe('Ranking Engine — Normalization', () => {
  test('normalizes correctly in a range', () => {
    const values = [100, 200, 300];
    expect(normalizeInRange(100, values)).toBe(0);
    expect(normalizeInRange(200, values)).toBe(50);
    expect(normalizeInRange(300, values)).toBe(100);
  });

  test('returns 50 when max === min', () => {
    expect(normalizeInRange(50, [50, 50, 50])).toBe(50);
  });

  test('returns 50 for single value', () => {
    expect(normalizeInRange(100, [100])).toBe(50);
  });

  test('returns 50 for empty array', () => {
    expect(normalizeInRange(100, [])).toBe(50);
  });

  test('clamps to 0–100', () => {
    const values = [100, 200];
    // Value outside range shouldn't break
    const below = normalizeInRange(50, values);
    expect(below).toBeGreaterThanOrEqual(0);
    expect(below).toBeLessThanOrEqual(100);
  });
});

describe('Ranking Engine — Eligibility', () => {
  const lot: EligibilityInput = {
    lotQuantity: DEMO_LOT.quantity,
    lotCommodity: DEMO_LOT.commodityName,
    lotVariety: DEMO_LOT.varietyName,
    lotGrade: DEMO_LOT.qualityGrade,
  };

  test('AgriFresh is INELIGIBLE due to minimum lot size', () => {
    const agriFresh = DEMO_BUYERS.find(b => b.companyName === 'AgriFresh Exports')!;
    const demand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === 'AgriFresh Exports')!;

    const result = checkBuyerEligibility(lot, {
      buyerId: 'agrifresh',
      buyerName: agriFresh.companyName,
      demandCommodity: demand.commodityName,
      demandVariety: demand.varietyName,
      minQualityGrade: demand.minQualityGrade,
      minLotSize: demand.minLotSize,
      serviceRadiusKm: agriFresh.serviceRadiusKm,
      distanceKm: agriFresh.distanceFromFarmerKm,
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/lot size/i);
  });

  test('FreshMart is eligible', () => {
    const freshmart = DEMO_BUYERS.find(b => b.companyName === 'FreshMart Foods')!;
    const demand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === 'FreshMart Foods')!;

    const result = checkBuyerEligibility(lot, {
      buyerId: 'freshmart',
      buyerName: freshmart.companyName,
      demandCommodity: demand.commodityName,
      demandVariety: demand.varietyName,
      minQualityGrade: demand.minQualityGrade,
      minLotSize: demand.minLotSize,
      serviceRadiusKm: freshmart.serviceRadiusKm,
      distanceKm: freshmart.distanceFromFarmerKm,
    });

    expect(result.eligible).toBe(true);
  });
});

describe('Ranking Engine — FreshMart Must Win', () => {
  test('FreshMart ranks #1 from actual scoring engine', () => {
    // Build all eligible opportunities
    const markets = DEMO_MARKETS.map(m => buildMarketOpportunity(m.name));

    // Only eligible buyers (not AgriFresh — min lot 50 > 18)
    const eligibleBuyerNames = ['FreshMart Foods', 'Pune Veggie Hub', 'Hotel Grand', 'RK Traders'];
    const buyers = eligibleBuyerNames.map(name => buildBuyerOpportunity(name));

    const allOpps: Opportunity[] = [...markets, ...buyers];
    const ranked = rankOpportunities(allOpps, LOT_QTY, RANKING_CONFIG);

    expect(ranked.length).toBe(7); // 3 markets + 4 buyers
    expect(ranked[0].rank).toBe(1);

    // FreshMart must be #1
    const topOpp = ranked[0].opportunity as BuyerOpportunity;
    expect(topOpp.buyerName).toBe('FreshMart Foods');
  });

  test('all scores are between 0 and 100', () => {
    const markets = DEMO_MARKETS.map(m => buildMarketOpportunity(m.name));
    const buyers = ['FreshMart Foods', 'Pune Veggie Hub', 'Hotel Grand', 'RK Traders']
      .map(name => buildBuyerOpportunity(name));

    const ranked = rankOpportunities([...markets, ...buyers], LOT_QTY, RANKING_CONFIG);

    for (const r of ranked) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
      expect(r.features.nrpScore).toBeGreaterThanOrEqual(0);
      expect(r.features.nrpScore).toBeLessThanOrEqual(100);
      expect(r.features.reliabilityScore).toBeGreaterThanOrEqual(0);
      expect(r.features.reliabilityScore).toBeLessThanOrEqual(100);
    }
  });

  test('each ranked opportunity has explanations', () => {
    const markets = DEMO_MARKETS.map(m => buildMarketOpportunity(m.name));
    const buyers = ['FreshMart Foods'].map(name => buildBuyerOpportunity(name));

    const ranked = rankOpportunities([...markets, ...buyers], LOT_QTY, RANKING_CONFIG);

    for (const r of ranked) {
      expect(r.explanation).toBeDefined();
      expect(Array.isArray(r.explanation)).toBe(true);
    }
  });

  test('#1 has comparedToNextBest', () => {
    const markets = DEMO_MARKETS.map(m => buildMarketOpportunity(m.name));
    const buyers = ['FreshMart Foods', 'Pune Veggie Hub']
      .map(name => buildBuyerOpportunity(name));

    const ranked = rankOpportunities([...markets, ...buyers], LOT_QTY, RANKING_CONFIG);

    expect(ranked[0].comparedToNextBest).toBeDefined();
    expect(ranked[0].comparedToNextBest!.nextBestName).toBeTruthy();
  });
});

describe('Ranking Engine — Edge Cases', () => {
  test('empty opportunities returns empty', () => {
    const ranked = rankOpportunities([], LOT_QTY, RANKING_CONFIG);
    expect(ranked).toEqual([]);
  });

  test('single opportunity returns rank 1', () => {
    const opp = buildMarketOpportunity('Pune APMC');
    const ranked = rankOpportunities([opp], LOT_QTY, RANKING_CONFIG);
    expect(ranked.length).toBe(1);
    expect(ranked[0].rank).toBe(1);
  });
});
