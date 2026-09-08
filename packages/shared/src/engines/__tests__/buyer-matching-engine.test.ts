// ============================================================
// Buyer Matching Engine Tests
// Validates eligibility and scoring for buyer-farmer matching.
// ============================================================

import {
  checkMatchEligibility,
  calculateMatchScore,
  MatchLotInput,
  MatchBuyerDemandInput,
  DEFAULT_MATCHING_CONFIG,
} from '../buyer-matching-engine';
import {
  DEMO_LOT,
  DEMO_BUYERS,
  DEMO_BUYER_DEMANDS,
} from '../../demo-scenario';

function buildDemoLot(): MatchLotInput {
  return {
    commodityName: DEMO_LOT.commodityName,
    varietyName: DEMO_LOT.varietyName,
    qualityGrade: DEMO_LOT.qualityGrade,
    quantity: DEMO_LOT.quantity,
    minAcceptablePricePaise: DEMO_LOT.minAcceptablePricePaise,
    expectedSaleDate: DEMO_LOT.expectedSaleDate,
  };
}

function buildDemand(companyName: string): MatchBuyerDemandInput {
  const buyer = DEMO_BUYERS.find(b => b.companyName === companyName)!;
  const demand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === companyName)!;

  return {
    buyerId: companyName.toLowerCase().replace(/\s/g, '-'),
    demandId: `demand-${companyName.toLowerCase().replace(/\s/g, '-')}`,
    buyerName: companyName,
    commodityName: demand.commodityName,
    varietyName: demand.varietyName,
    minQualityGrade: demand.minQualityGrade,
    demandQuantity: demand.quantity,
    minLotSize: demand.minLotSize,
    priceLowPaise: demand.priceLowPaise,
    priceHighPaise: demand.priceHighPaise,
    offeredPricePaise: demand.offeredPricePaise,
    deliveryWindowStart: demand.deliveryWindowStart,
    deliveryWindowEnd: demand.deliveryWindowEnd,
    serviceRadiusKm: buyer.serviceRadiusKm,
    distanceKm: buyer.distanceFromFarmerKm,
    qualityMatchScore: demand.qualityMatchScore,
    trustScoreOverall: buyer.trustScoreOverall,
    providesPickup: buyer.providesPickup,
  };
}

describe('Buyer Matching — Eligibility', () => {
  const lot = buildDemoLot();

  test('AgriFresh is ineligible (min lot 50 > 18)', () => {
    const demand = buildDemand('AgriFresh Exports');
    const result = checkMatchEligibility(lot, demand);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some(r => /lot size/i.test(r))).toBe(true);
  });

  test('FreshMart is eligible', () => {
    const demand = buildDemand('FreshMart Foods');
    const result = checkMatchEligibility(lot, demand);
    expect(result.eligible).toBe(true);
    expect(result.reasons.length).toBe(0);
  });

  test('all buyers except AgriFresh are eligible for 18 qtl lot', () => {
    const eligibleNames = ['FreshMart Foods', 'Pune Veggie Hub', 'Hotel Grand', 'RK Traders'];
    for (const name of eligibleNames) {
      const demand = buildDemand(name);
      const result = checkMatchEligibility(lot, demand);
      expect(result.eligible).toBe(true);
    }
  });

  test('commodity mismatch makes ineligible', () => {
    const demand = buildDemand('FreshMart Foods');
    const mismatchLot = { ...lot, commodityName: 'Wheat' };
    const result = checkMatchEligibility(mismatchLot, demand);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some(r => /commodity/i.test(r))).toBe(true);
  });

  test('variety mismatch makes ineligible', () => {
    const demand = buildDemand('FreshMart Foods');
    const mismatchLot = { ...lot, varietyName: 'Cherry' };
    const result = checkMatchEligibility(mismatchLot, demand);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some(r => /variety/i.test(r))).toBe(true);
  });
});

describe('Buyer Matching — Scoring', () => {
  const lot = buildDemoLot();

  test('FreshMart has highest match score among eligible buyers', () => {
    const eligibleNames = ['FreshMart Foods', 'Pune Veggie Hub', 'Hotel Grand', 'RK Traders'];
    const scores: { name: string; score: number }[] = [];

    for (const name of eligibleNames) {
      const demand = buildDemand(name);
      const result = calculateMatchScore(lot, demand);
      scores.push({ name, score: result.score });
    }

    // FreshMart should have highest score
    scores.sort((a, b) => b.score - a.score);
    expect(scores[0].name).toBe('FreshMart Foods');
  });

  test('match score includes factor-level breakdown', () => {
    const demand = buildDemand('FreshMart Foods');
    const result = calculateMatchScore(lot, demand);

    expect(result.factors.length).toBeGreaterThanOrEqual(6);
    for (const factor of result.factors) {
      expect(factor.name).toBeTruthy();
      expect(factor.score).toBeGreaterThanOrEqual(0);
      expect(factor.score).toBeLessThanOrEqual(100);
      expect(factor.weight).toBeGreaterThan(0);
      expect(factor.detail).toBeTruthy();
    }
  });

  test('match result includes explanations', () => {
    const demand = buildDemand('FreshMart Foods');
    const result = calculateMatchScore(lot, demand);

    expect(result.explanation.length).toBeGreaterThan(0);
  });

  test('weights must sum to 100', () => {
    const demand = buildDemand('FreshMart Foods');
    const badConfig = {
      weights: { ...DEFAULT_MATCHING_CONFIG.weights, priceCompatibility: 50 },
    };
    expect(() => calculateMatchScore(lot, demand, badConfig)).toThrow(/sum to 100/);
  });

  test('pickup buyer gets higher logistics score', () => {
    const pickupDemand = buildDemand('FreshMart Foods'); // has pickup
    const noPickupDemand = buildDemand('Hotel Grand');    // no pickup

    const pickupResult = calculateMatchScore(lot, pickupDemand);
    const noPickupResult = calculateMatchScore(lot, noPickupDemand);

    const pickupLogistics = pickupResult.factors.find(f => f.name === 'Logistics Convenience')!;
    const noPickupLogistics = noPickupResult.factors.find(f => f.name === 'Logistics Convenience')!;

    expect(pickupLogistics.score).toBeGreaterThan(noPickupLogistics.score);
  });
});
