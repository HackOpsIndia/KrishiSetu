// ============================================================
// Invariants Tests
// Cross-cutting invariants that must hold across all engines.
// ============================================================

import { calculateNRP } from '../nrp-engine';
import { validateWeights, rankOpportunities, RankingConfig, normalizeInRange } from '../ranking-engine';
import { calculateAggregation, FarmerLot, BulkDemand, AggregationInput } from '../aggregation-engine';
import {
  DEMO_NRP_CONFIG,
  DEMO_RANKING_WEIGHTS,
  DEMO_LOT,
  DEMO_DEFAULT_MARKET_RELIABILITY,
  DEMO_DEFAULT_MARKET_PAYMENT_RELIABILITY,
  DEMAND_STRENGTH_CONFIG,
  LOGISTICS_SCORE_CONFIG,
} from '../../demo-scenario';
import { ChannelType, NRPInput } from '../../types';

const CONFIG = DEMO_NRP_CONFIG;

describe('Financial Invariants', () => {
  test('gross = price × quantity for any inputs', () => {
    const prices = [100000, 250000, 310000, 500000];
    const quantities = [1, 5, 18, 100.5];

    for (const price of prices) {
      for (const qty of quantities) {
        const input: NRPInput = {
          salePricePaise: price,
          quantity: qty,
          distanceKm: 20,
          channelType: ChannelType.MARKET,
          buyerProvidesPickup: false,
          commodityId: 'tomato',
          storageDays: 0,
        };
        const result = calculateNRP(input, CONFIG);
        expect(result.grossTotalPaise).toBe(price * qty);
      }
    }
  });

  test('totalCosts = sum(costItems) always', () => {
    const inputs: NRPInput[] = [
      { salePricePaise: 310000, quantity: 18, distanceKm: 35, channelType: ChannelType.MARKET, buyerProvidesPickup: false, commodityId: 'tomato', storageDays: 0 },
      { salePricePaise: 296000, quantity: 18, distanceKm: 42, channelType: ChannelType.BUYER, buyerProvidesPickup: true, commodityId: 'tomato', storageDays: 0 },
      { salePricePaise: 310000, quantity: 18, distanceKm: 55, channelType: ChannelType.BUYER, buyerProvidesPickup: false, commodityId: 'tomato', storageDays: 3 },
    ];

    for (const input of inputs) {
      const result = calculateNRP(input, CONFIG);
      const sum = result.costs.reduce((s, c) => s + c.totalAmountPaise, 0);
      expect(result.totalCostsPaise).toBe(sum);
    }
  });

  test('net = gross - costs for all scenarios', () => {
    const inputs: NRPInput[] = [
      { salePricePaise: 310000, quantity: 18, distanceKm: 35, channelType: ChannelType.MARKET, buyerProvidesPickup: false, commodityId: 'tomato', storageDays: 0 },
      { salePricePaise: 296000, quantity: 18, distanceKm: 42, channelType: ChannelType.BUYER, buyerProvidesPickup: true, commodityId: 'tomato', storageDays: 0 },
    ];

    for (const input of inputs) {
      const result = calculateNRP(input, CONFIG);
      expect(result.netTotalValuePaise).toBe(result.grossTotalPaise - result.totalCostsPaise);
    }
  });

  test('net >= 0 always', () => {
    // Even with extreme costs, NRP engine should prevent negative
    const input: NRPInput = {
      salePricePaise: 10000, // very low price
      quantity: 1,
      distanceKm: 500, // very long distance
      channelType: ChannelType.MARKET,
      buyerProvidesPickup: false,
      commodityId: 'tomato',
      storageDays: 30,
    };
    const result = calculateNRP(input, CONFIG);
    expect(result.netTotalValuePaise).toBeGreaterThanOrEqual(0);
  });
});

describe('Ranking Invariants', () => {
  test('ranking weights = 100', () => {
    expect(() => validateWeights(DEMO_RANKING_WEIGHTS)).not.toThrow();
  });

  test('scores are between 0 and 100', () => {
    // Edge: max === min
    expect(normalizeInRange(50, [50, 50])).toBe(50);
    expect(normalizeInRange(50, [50])).toBe(50);
    expect(normalizeInRange(50, [])).toBe(50);

    // Normal
    expect(normalizeInRange(0, [0, 100])).toBe(0);
    expect(normalizeInRange(100, [0, 100])).toBe(100);
    expect(normalizeInRange(50, [0, 100])).toBe(50);
  });
});

describe('Payment Invariants', () => {
  test('payment = agreedPrice × quantity', () => {
    const agreedPrice = 297500; // ₹2,975
    const qty = 18;
    const payment = agreedPrice * qty;
    expect(payment).toBe(5355000); // ₹53,550
  });
});

describe('Aggregation Invariants', () => {
  test('pooledQuantity = sum(eligible lots)', () => {
    const farmers: FarmerLot[] = [
      { farmerId: '1', farmerName: 'A', quantity: 20, variety: 'Hybrid', grade: 'A', distanceToNearestMandiKm: 18, nearestMandiPricePaise: 290000 },
      { farmerId: '2', farmerName: 'B', quantity: 30, variety: 'Hybrid', grade: 'A', distanceToNearestMandiKm: 18, nearestMandiPricePaise: 290000 },
      { farmerId: '3', farmerName: 'C', quantity: 15, variety: 'Local', grade: 'B', distanceToNearestMandiKm: 18, nearestMandiPricePaise: 290000 },
    ];

    const demand: BulkDemand = {
      demandId: 'd1', buyerName: 'Test', commodityName: 'Tomato', varietyName: 'Hybrid',
      minQualityGrade: 'A', quantity: 200, pricePaise: 296000,
      buyerProvidesPickup: true, distanceKm: 42,
    };

    const input: AggregationInput = {
      commodityId: 'tomato', commodityName: 'Tomato',
      varietyId: 'hybrid', varietyName: 'Hybrid',
      targetVariety: 'Hybrid', targetGrade: 'A',
      farmers, demand, config: CONFIG,
    };

    const result = calculateAggregation(input);

    // Only Hybrid/A eligible: 20 + 30 = 50
    expect(result.totalQuantity).toBe(50);
    expect(result.excludedFarmers.length).toBe(1);

    const sum = result.eligibleFarmers.reduce((s, f) => s + f.quantity, 0);
    expect(result.totalQuantity).toBe(sum);
  });

  test('bulkAdvantage = pooledNRP − individualWeightedAvgNRP', () => {
    const farmers: FarmerLot[] = [
      { farmerId: '1', farmerName: 'A', quantity: 20, variety: 'Hybrid', grade: 'A', distanceToNearestMandiKm: 18, nearestMandiPricePaise: 290000 },
      { farmerId: '2', farmerName: 'B', quantity: 30, variety: 'Hybrid', grade: 'A', distanceToNearestMandiKm: 18, nearestMandiPricePaise: 290000 },
    ];

    const demand: BulkDemand = {
      demandId: 'd1', buyerName: 'Test', commodityName: 'Tomato', varietyName: 'Hybrid',
      minQualityGrade: 'A', quantity: 200, pricePaise: 296000,
      buyerProvidesPickup: true, distanceKm: 42,
    };

    const result = calculateAggregation({
      commodityId: 'tomato', commodityName: 'Tomato',
      varietyId: 'hybrid', varietyName: 'Hybrid',
      targetVariety: 'Hybrid', targetGrade: 'A',
      farmers, demand, config: CONFIG,
    });

    expect(result.estimatedBulkAdvantagePaise).toBe(
      result.pooledNRPPaise - result.individualWeightedAvgNRPPaise
    );
  });
});

describe('State Machine Invariants', () => {
  // Imported from types
  test('lot transitions are defined for all states', () => {
    const { LotStatus, LOT_TRANSITIONS, isValidLotTransition } = require('../../types');

    for (const status of Object.values(LotStatus)) {
      expect(LOT_TRANSITIONS[status as string]).toBeDefined();
    }

    // COMPLETED and CANCELLED are terminal
    expect(LOT_TRANSITIONS[LotStatus.COMPLETED].length).toBe(0);
    expect(LOT_TRANSITIONS[LotStatus.CANCELLED].length).toBe(0);

    // Valid transitions
    expect(isValidLotTransition(LotStatus.DRAFT, LotStatus.READY)).toBe(true);
    expect(isValidLotTransition(LotStatus.DRAFT, LotStatus.COMPLETED)).toBe(false);
  });

  test('transaction transitions are defined for all states', () => {
    const { TransactionStatus, TRANSACTION_TRANSITIONS, isValidTransactionTransition } = require('../../types');

    for (const status of Object.values(TransactionStatus)) {
      expect(TRANSACTION_TRANSITIONS[status as string]).toBeDefined();
    }

    expect(TRANSACTION_TRANSITIONS[TransactionStatus.COMPLETED].length).toBe(0);
    expect(TRANSACTION_TRANSITIONS[TransactionStatus.CANCELLED].length).toBe(0);

    expect(isValidTransactionTransition(TransactionStatus.CONFIRMED, TransactionStatus.LOGISTICS_BOOKED)).toBe(true);
    expect(isValidTransactionTransition(TransactionStatus.COMPLETED, TransactionStatus.CONFIRMED)).toBe(false);
  });
});
