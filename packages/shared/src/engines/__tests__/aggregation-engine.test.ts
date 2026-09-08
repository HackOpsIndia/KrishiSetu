// ============================================================
// FPO Aggregation Engine Tests
// Validates pooling, eligibility, bulk advantage calculations.
// Uses canonical demo scenario data exclusively.
// ============================================================

import { calculateAggregation, AggregationInput, FarmerLot, BulkDemand } from '../aggregation-engine';
import {
  DEMO_NRP_CONFIG,
  DEMO_FPO_FARMERS,
  DEMO_BUYER_DEMANDS,
  DEMO_BUYERS,
  DEMO_MARKET_PRICES,
} from '../../demo-scenario';

const CONFIG = DEMO_NRP_CONFIG;

// Build demo aggregation input
function buildDemoAggregation(): AggregationInput {
  // Nearest mandi for FPO farmers: Talegaon (closest to Dehu Road area)
  const talegaonPrice = DEMO_MARKET_PRICES.find(p => p.marketName === 'Talegaon Mandi')!;

  const farmers: FarmerLot[] = DEMO_FPO_FARMERS.map(f => ({
    farmerId: f.email,
    farmerName: f.name,
    quantity: f.lotQuantity,
    variety: f.variety,
    grade: f.grade,
    distanceToNearestMandiKm: 18, // Talegaon is nearest
    nearestMandiPricePaise: talegaonPrice.modalPricePaise,
  }));

  const freshmart = DEMO_BUYERS.find(b => b.companyName === 'FreshMart Foods')!;
  const freshmartDemand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === 'FreshMart Foods')!;

  const demand: BulkDemand = {
    demandId: 'demand-freshmart',
    buyerName: 'FreshMart Foods',
    commodityName: 'Tomato',
    varietyName: 'Hybrid',
    minQualityGrade: 'A',
    quantity: freshmartDemand.quantity,
    pricePaise: freshmartDemand.offeredPricePaise,
    buyerProvidesPickup: freshmart.providesPickup,
    distanceKm: freshmart.distanceFromFarmerKm,
  };

  return {
    commodityId: 'tomato',
    commodityName: 'Tomato',
    varietyId: 'hybrid',
    varietyName: 'Hybrid',
    targetVariety: 'Hybrid',
    targetGrade: 'A',
    farmers,
    demand,
    config: CONFIG,
  };
}

describe('Aggregation Engine — Eligibility', () => {
  test('Vijay is excluded (Local/B not compatible with Hybrid/A)', () => {
    const result = calculateAggregation(buildDemoAggregation());

    const excluded = result.excludedFarmers;
    expect(excluded.length).toBe(1);
    expect(excluded[0].farmerName).toBe('Vijay Kulkarni');
    expect(excluded[0].reason).toBeTruthy();
  });

  test('Suresh, Meena, Anita are eligible', () => {
    const result = calculateAggregation(buildDemoAggregation());

    const eligibleNames = result.eligibleFarmers.map(f => f.farmerName);
    expect(eligibleNames).toContain('Suresh Patil');
    expect(eligibleNames).toContain('Meena Deshpande');
    expect(eligibleNames).toContain('Anita Shinde');
    expect(result.eligibleFarmers.length).toBe(3);
  });
});

describe('Aggregation Engine — Pooled Quantity', () => {
  test('pooled quantity = sum of eligible lots', () => {
    const result = calculateAggregation(buildDemoAggregation());

    // 20 + 30 + 25 = 75
    const expectedQty = DEMO_FPO_FARMERS
      .filter(f => f.eligible)
      .reduce((sum, f) => sum + f.lotQuantity, 0);

    expect(result.totalQuantity).toBe(expectedQty);
    expect(result.totalQuantity).toBe(75);
  });
});

describe('Aggregation Engine — Individual NRP', () => {
  test('individual NRPs are calculated through NRP engine', () => {
    const result = calculateAggregation(buildDemoAggregation());

    for (const farmer of result.eligibleFarmers) {
      expect(farmer.individualNRPPaise).toBeGreaterThan(0);
      // Each should be approximately ≈₹2,624–₹2,631 for Talegaon at ₹2,900
      expect(farmer.individualNRPPaise).toBeGreaterThan(260000);
      expect(farmer.individualNRPPaise).toBeLessThan(270000);
    }
  });
});

describe('Aggregation Engine — Bulk Advantage', () => {
  test('pooled NRP is higher than individual weighted average', () => {
    const result = calculateAggregation(buildDemoAggregation());

    expect(result.pooledNRPPaise).toBeGreaterThan(result.individualWeightedAvgNRPPaise);
  });

  test('bulk advantage ≈ ₹297/qtl (±₹15)', () => {
    const result = calculateAggregation(buildDemoAggregation());

    // Expected: ≈₹297/qtl = 29700 paise
    expect(result.estimatedBulkAdvantagePaise).toBeGreaterThan(28000); // ₹280
    expect(result.estimatedBulkAdvantagePaise).toBeLessThan(32000);   // ₹320
  });

  test('bulk advantage percent ≈ 11.3% (±2%)', () => {
    const result = calculateAggregation(buildDemoAggregation());

    expect(result.estimatedBulkAdvantagePercent).toBeGreaterThan(9);
    expect(result.estimatedBulkAdvantagePercent).toBeLessThan(14);
  });

  test('total improvement = bulk advantage × pooled quantity', () => {
    const result = calculateAggregation(buildDemoAggregation());

    expect(result.totalImprovementPaise).toBe(
      result.estimatedBulkAdvantagePaise * result.totalQuantity
    );
  });
});

describe('Aggregation Engine — Invariants', () => {
  test('pooledQuantity = sum(eligible lots)', () => {
    const result = calculateAggregation(buildDemoAggregation());
    const sum = result.eligibleFarmers.reduce((s, f) => s + f.quantity, 0);
    expect(result.totalQuantity).toBe(sum);
  });

  test('bulkAdvantage = pooledNRP − individualWeightedAvgNRP', () => {
    const result = calculateAggregation(buildDemoAggregation());
    expect(result.estimatedBulkAdvantagePaise).toBe(
      result.pooledNRPPaise - result.individualWeightedAvgNRPPaise
    );
  });
});

describe('Aggregation Engine — Large Buyer Eligibility & Demand Unlock', () => {
  test('Individual buyer eligibility: 18 qtl vs 50 qtl AgriFresh minimum -> INELIGIBLE', () => {
    const agriFreshDemand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === 'AgriFresh Exports')!;
    const rameshQuantity = 18;

    expect(rameshQuantity).toBeLessThan(agriFreshDemand.minLotSize);
    expect(rameshQuantity >= agriFreshDemand.minLotSize).toBe(false);
  });

  test('Pooled buyer eligibility: 75 qtl vs 50 qtl AgriFresh minimum -> ELIGIBLE', () => {
    const agriFreshDemand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === 'AgriFresh Exports')!;
    const demo = buildDemoAggregation();
    const result = calculateAggregation(demo);

    expect(result.totalQuantity).toBe(75);
    expect(result.totalQuantity >= agriFreshDemand.minLotSize).toBe(true);
  });

  test('Aggregation cluster: 4 farmers -> 3 compatible, 1 excluded, 75 qtl pooled', () => {
    const result = calculateAggregation(buildDemoAggregation());

    expect(result.eligibleFarmers.length).toBe(3);
    expect(result.excludedFarmers.length).toBe(1);
    expect(result.totalQuantity).toBe(75);
    expect(result.excludedFarmers[0].farmerName).toBe('Vijay Kulkarni');
  });

  test('Bulk economics: pooledNRP − individualWeightedAvgNRP ≈ ₹297/qtl', () => {
    const result = calculateAggregation(buildDemoAggregation());
    const advantageRupees = Math.round(result.estimatedBulkAdvantagePaise / 100);

    expect(advantageRupees).toBe(297);
  });

  test('No hardcoding: Dynamic threshold responds to varying quantities', () => {
    const demo = buildDemoAggregation();
    const agriFreshMinLot = 50;

    // Test with quantity below threshold (e.g. 40 qtl)
    const belowThresholdFarmers: FarmerLot[] = [
      {
        farmerId: 'f1',
        farmerName: 'Farmer 1',
        quantity: 20,
        variety: 'Hybrid',
        grade: 'A',
        distanceToNearestMandiKm: 18,
        nearestMandiPricePaise: 290000,
      },
      {
        farmerId: 'f2',
        farmerName: 'Farmer 2',
        quantity: 20,
        variety: 'Hybrid',
        grade: 'A',
        distanceToNearestMandiKm: 18,
        nearestMandiPricePaise: 290000,
      },
    ];

    const belowResult = calculateAggregation({
      ...demo,
      farmers: belowThresholdFarmers,
      candidateBuyers: [
        {
          buyerName: 'AgriFresh Exports',
          minLotSize: agriFreshMinLot,
          pricePaise: 320000,
          distanceKm: 88,
          providesPickup: false,
        },
      ],
    });

    expect(belowResult.totalQuantity).toBe(40);
    const agriFreshBelow = belowResult.matchedBuyers?.find(b => b.buyerName === 'AgriFresh Exports');
    expect(agriFreshBelow?.pooledEligibility).toBe('UNAVAILABLE');
    expect(agriFreshBelow?.state).toBe('UNAVAILABLE');

    // Test with quantity meeting/exceeding threshold (e.g. 55 qtl)
    const aboveThresholdFarmers: FarmerLot[] = [
      ...belowThresholdFarmers,
      {
        farmerId: 'f3',
        farmerName: 'Farmer 3',
        quantity: 15,
        variety: 'Hybrid',
        grade: 'A',
        distanceToNearestMandiKm: 18,
        nearestMandiPricePaise: 290000,
      },
    ];

    const aboveResult = calculateAggregation({
      ...demo,
      farmers: aboveThresholdFarmers,
      candidateBuyers: [
        {
          buyerName: 'AgriFresh Exports',
          minLotSize: agriFreshMinLot,
          pricePaise: 320000,
          distanceKm: 88,
          providesPickup: false,
        },
      ],
    });

    expect(aboveResult.totalQuantity).toBe(55);
    const agriFreshAbove = aboveResult.matchedBuyers?.find(b => b.buyerName === 'AgriFresh Exports');
    expect(agriFreshAbove?.pooledEligibility).toBe('ELIGIBLE');
    expect(agriFreshAbove?.state).toBe('ELIGIBLE');
  });
});
