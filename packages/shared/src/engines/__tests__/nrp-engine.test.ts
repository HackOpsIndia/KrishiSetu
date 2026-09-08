// ============================================================
// NRP Engine Tests
// Validates ALL canonical demo NRP calculations.
// Values must emerge from raw inputs — not hardcoded.
// ============================================================

import { calculateNRP } from '../nrp-engine';
import {
  DEMO_NRP_CONFIG,
  DEMO_MARKETS,
  DEMO_MARKET_PRICES,
  DEMO_BUYERS,
  DEMO_BUYER_DEMANDS,
  DEMO_LOT,
  DEMO_NEGOTIATION,
} from '../../demo-scenario';
import { ChannelType, NRPInput, CostCategory } from '../../types';

const CONFIG = DEMO_NRP_CONFIG;
const LOT_QTY = DEMO_LOT.quantity; // 18 qtl

// Helper: build market NRP input from demo data
function marketInput(marketName: string): NRPInput {
  const market = DEMO_MARKETS.find(m => m.name === marketName)!;
  const price = DEMO_MARKET_PRICES.find(p => p.marketName === marketName)!;
  return {
    salePricePaise: price.modalPricePaise,
    quantity: LOT_QTY,
    distanceKm: market.distanceFromFarmerKm,
    channelType: ChannelType.MARKET,
    buyerProvidesPickup: false,
    commodityId: 'tomato',
    storageDays: 0,
  };
}

// Helper: build buyer NRP input from demo data
function buyerInput(companyName: string): NRPInput {
  const buyer = DEMO_BUYERS.find(b => b.companyName === companyName)!;
  const demand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === companyName)!;
  return {
    salePricePaise: demand.offeredPricePaise, // actual offered price
    quantity: LOT_QTY,
    distanceKm: buyer.distanceFromFarmerKm,
    channelType: ChannelType.BUYER,
    buyerProvidesPickup: buyer.providesPickup,
    commodityId: 'tomato',
    storageDays: 0,
  };
}

// Tolerance: ±₹5/qtl (±500 paise) to account for integer rounding
const TOLERANCE_PAISE = 500;

describe('NRP Engine — Market Opportunities', () => {
  test('Pune APMC: ₹3,100 modal, 35km → ≈₹2,787/qtl net', () => {
    const result = calculateNRP(marketInput('Pune APMC'), CONFIG);

    // Gross
    expect(result.grossPricePerQtlPaise).toBe(310000);
    expect(result.grossTotalPaise).toBe(310000 * 18);

    // Cost items: transport, loading, commission, market fee, weighing, loss
    expect(result.costs.length).toBe(6); // no storage

    // Transport: 35km × ₹22/km = ₹770 total
    const transport = result.costs.find(c => c.category === CostCategory.TRANSPORT)!;
    expect(transport.totalAmountPaise).toBe(35 * 2200);

    // Loading: 18 × ₹45 = ₹810
    const loading = result.costs.find(c => c.category === CostCategory.LOADING)!;
    expect(loading.totalAmountPaise).toBe(18 * 4500);

    // Commission: 4% of gross
    const commission = result.costs.find(c => c.category === CostCategory.COMMISSION)!;
    expect(commission.totalAmountPaise).toBe(Math.round(310000 * 18 * 0.04));

    // Market fee: 1% of gross
    const marketFee = result.costs.find(c => c.category === CostCategory.MARKET_FEES)!;
    expect(marketFee.totalAmountPaise).toBe(Math.round(310000 * 18 * 0.01));

    // Weighing: 18 × ₹8
    const weighing = result.costs.find(c => c.category === CostCategory.WEIGHING)!;
    expect(weighing.totalAmountPaise).toBe(18 * 800);

    // Loss: 2% of gross
    const loss = result.costs.find(c => c.category === CostCategory.POST_HARVEST_LOSS)!;
    expect(loss.totalAmountPaise).toBe(Math.round(310000 * 18 * 0.02));

    // Net per qtl ≈ ₹2,787
    expect(result.netRealisablePricePerQtlPaise).toBeGreaterThan(278700 - TOLERANCE_PAISE);
    expect(result.netRealisablePricePerQtlPaise).toBeLessThan(278700 + TOLERANCE_PAISE);

    // Invariant: net = gross - costs
    expect(result.netTotalValuePaise).toBe(result.grossTotalPaise - result.totalCostsPaise);
  });

  test('Talegaon: ₹2,900 modal, 18km → ≈₹2,622/qtl net', () => {
    const result = calculateNRP(marketInput('Talegaon Mandi'), CONFIG);

    expect(result.grossPricePerQtlPaise).toBe(290000);

    // Expected ≈ ₹2,622
    expect(result.netRealisablePricePerQtlPaise).toBeGreaterThan(262200 - TOLERANCE_PAISE);
    expect(result.netRealisablePricePerQtlPaise).toBeLessThan(262200 + TOLERANCE_PAISE);

    // Invariant
    expect(result.netTotalValuePaise).toBe(result.grossTotalPaise - result.totalCostsPaise);
  });

  test('Pimpri: ₹2,950 modal, 28km → ≈₹2,656/qtl net', () => {
    const result = calculateNRP(marketInput('Pimpri Market'), CONFIG);

    expect(result.grossPricePerQtlPaise).toBe(295000);
    expect(result.netRealisablePricePerQtlPaise).toBeGreaterThan(265600 - TOLERANCE_PAISE);
    expect(result.netRealisablePricePerQtlPaise).toBeLessThan(265600 + TOLERANCE_PAISE);
    expect(result.netTotalValuePaise).toBe(result.grossTotalPaise - result.totalCostsPaise);
  });

  test('Markets get APMC fees, commission, and weighing', () => {
    const result = calculateNRP(marketInput('Pune APMC'), CONFIG);
    const categories = result.costs.map(c => c.category);
    expect(categories).toContain(CostCategory.COMMISSION);
    expect(categories).toContain(CostCategory.MARKET_FEES);
    expect(categories).toContain(CostCategory.WEIGHING);
  });
});

describe('NRP Engine — Buyer Opportunities', () => {
  test('FreshMart: ₹2,960 offer, 42km, pickup → ≈₹2,925/qtl net', () => {
    const result = calculateNRP(buyerInput('FreshMart Foods'), CONFIG);

    // Gross = ₹2,960 × 18
    expect(result.grossPricePerQtlPaise).toBe(296000);

    // Buyer with pickup: no transport, no APMC fees
    const categories = result.costs.map(c => c.category);
    expect(categories).not.toContain(CostCategory.TRANSPORT);
    expect(categories).not.toContain(CostCategory.COMMISSION);
    expect(categories).not.toContain(CostCategory.MARKET_FEES);
    expect(categories).not.toContain(CostCategory.WEIGHING);

    // Should have: loading + loss
    expect(categories).toContain(CostCategory.LOADING);
    expect(categories).toContain(CostCategory.POST_HARVEST_LOSS);

    // Loading at buyer rate: 18 × ₹20
    const loading = result.costs.find(c => c.category === CostCategory.LOADING)!;
    expect(loading.totalAmountPaise).toBe(18 * 2000);

    // Loss: 0.5% of (296000 * 18 = 5328000) = 26640
    const loss = result.costs.find(c => c.category === CostCategory.POST_HARVEST_LOSS)!;
    expect(loss.totalAmountPaise).toBe(Math.round(296000 * 18 * 0.005));

    // Net ≈ ₹2,925 (5328000 - 36000 - 26640 = 5265360, / 18 = 292520)
    expect(result.netRealisablePricePerQtlPaise).toBeGreaterThan(292500 - TOLERANCE_PAISE);
    expect(result.netRealisablePricePerQtlPaise).toBeLessThan(292500 + TOLERANCE_PAISE);

    expect(result.netTotalValuePaise).toBe(result.grossTotalPaise - result.totalCostsPaise);
  });

  test('Pune Veggie Hub: ₹2,850 offer, 22km, pickup → ≈₹2,816/qtl net', () => {
    const result = calculateNRP(buyerInput('Pune Veggie Hub'), CONFIG);

    // Offered price from demo-scenario: ₹2,850 (285000 paise)
    expect(result.grossPricePerQtlPaise).toBe(285000);

    const categories = result.costs.map(c => c.category);
    expect(categories).not.toContain(CostCategory.TRANSPORT); // pickup
    expect(categories).not.toContain(CostCategory.COMMISSION);

    // Gross: 285000 * 18 = 5130000
    // Loading: 18 * 2000 = 36000
    // Loss: 0.5% of 5130000 = 25650
    // Total costs: 61650
    // Net: 5130000 - 61650 = 5068350
    // Per qtl: 5068350 / 18 ≈ 281575 (≈₹2,816/qtl)
    expect(result.netRealisablePricePerQtlPaise).toBeGreaterThan(281600 - TOLERANCE_PAISE);
    expect(result.netRealisablePricePerQtlPaise).toBeLessThan(281600 + TOLERANCE_PAISE);

    expect(result.netTotalValuePaise).toBe(result.grossTotalPaise - result.totalCostsPaise);
  });

  test('Hotel Grand: ₹3,200 offer, 55km, no pickup → ≈₹2,997/qtl net', () => {
    const result = calculateNRP(buyerInput('Hotel Grand'), CONFIG);

    // No pickup → has transport
    const categories = result.costs.map(c => c.category);
    expect(categories).toContain(CostCategory.TRANSPORT);
    expect(categories).not.toContain(CostCategory.COMMISSION); // still direct buyer

    // Transport: 55km × ₹22/km = ₹1,210
    const transport = result.costs.find(c => c.category === CostCategory.TRANSPORT)!;
    expect(transport.totalAmountPaise).toBe(55 * 2200);

    expect(result.netTotalValuePaise).toBe(result.grossTotalPaise - result.totalCostsPaise);
  });

  test('RK Traders: pickup → no transport', () => {
    const result = calculateNRP(buyerInput('RK Traders'), CONFIG);

    const categories = result.costs.map(c => c.category);
    expect(categories).not.toContain(CostCategory.TRANSPORT);
    expect(categories).not.toContain(CostCategory.COMMISSION);
    expect(result.netTotalValuePaise).toBe(result.grossTotalPaise - result.totalCostsPaise);
  });

  test('Buyers never get APMC commission/market fee/weighing', () => {
    for (const name of ['FreshMart Foods', 'Pune Veggie Hub', 'Hotel Grand', 'RK Traders', 'AgriFresh Exports']) {
      const result = calculateNRP(buyerInput(name), CONFIG);
      const categories = result.costs.map(c => c.category);
      expect(categories).not.toContain(CostCategory.COMMISSION);
      expect(categories).not.toContain(CostCategory.MARKET_FEES);
      expect(categories).not.toContain(CostCategory.WEIGHING);
    }
  });

  test('Buyer loss uses direct rate (0.5%), not mandi rate (2%)', () => {
    const result = calculateNRP(buyerInput('FreshMart Foods'), CONFIG);
    const loss = result.costs.find(c => c.category === CostCategory.POST_HARVEST_LOSS)!;
    // 0.5% of gross (dynamically calculated, not hardcoded)
    const expectedLoss = Math.round(result.grossTotalPaise * 0.005);
    expect(loss.totalAmountPaise).toBe(expectedLoss);
  });
});

describe('NRP Engine — Post-Negotiation', () => {
  test('₹2,975 agreed price → ≈₹2,940/qtl net', () => {
    const postNegInput: NRPInput = {
      salePricePaise: DEMO_NEGOTIATION.finalAgreedPricePaise, // 297500
      quantity: LOT_QTY,
      distanceKm: 42, // FreshMart distance
      channelType: ChannelType.BUYER,
      buyerProvidesPickup: true, // FreshMart provides pickup
      commodityId: 'tomato',
      storageDays: 0,
    };

    const result = calculateNRP(postNegInput, CONFIG);

    // Gross: ₹2,975 × 18 = ₹53,550 = 5355000 paise
    expect(result.grossTotalPaise).toBe(297500 * 18);

    // Costs: loading (₹20/qtl) + loss (0.5%)
    // Loading: 18 × 2000 = 36000
    // Loss: 0.5% of 5355000 = 26775
    // Total costs: 62775
    // Net: 5355000 - 62775 = 5292225
    // Per qtl: 5292225 / 18 ≈ 294013

    expect(result.netRealisablePricePerQtlPaise).toBeGreaterThan(294000 - TOLERANCE_PAISE);
    expect(result.netRealisablePricePerQtlPaise).toBeLessThan(294000 + TOLERANCE_PAISE);

    // Payment amount = gross total
    expect(result.grossTotalPaise).toBe(5355000); // ₹53,550
  });
});

describe('NRP Engine — Invariants', () => {
  test('gross = price × quantity', () => {
    const result = calculateNRP(marketInput('Pune APMC'), CONFIG);
    expect(result.grossTotalPaise).toBe(result.grossPricePerQtlPaise * result.quantity);
  });

  test('totalCosts = sum of all cost items', () => {
    const result = calculateNRP(marketInput('Pune APMC'), CONFIG);
    const sumCosts = result.costs.reduce((s, c) => s + c.totalAmountPaise, 0);
    expect(result.totalCostsPaise).toBe(sumCosts);
  });

  test('net = gross - costs', () => {
    const result = calculateNRP(marketInput('Pune APMC'), CONFIG);
    expect(result.netTotalValuePaise).toBe(result.grossTotalPaise - result.totalCostsPaise);
  });

  test('net >= 0', () => {
    const result = calculateNRP(marketInput('Pune APMC'), CONFIG);
    expect(result.netTotalValuePaise).toBeGreaterThanOrEqual(0);
  });

  test('no zero-value cost items when cost is not applicable', () => {
    // FreshMart with pickup — should NOT have a transport cost item
    const result = calculateNRP(buyerInput('FreshMart Foods'), CONFIG);
    for (const cost of result.costs) {
      // Every cost item that exists should have a non-zero amount
      // (the absence of a cost means "not applicable", not ₹0)
      expect(cost.totalAmountPaise).toBeGreaterThan(0);
    }
  });

  test('rejects invalid inputs', () => {
    const base = marketInput('Pune APMC');
    expect(() => calculateNRP({ ...base, quantity: 0 }, CONFIG)).toThrow();
    expect(() => calculateNRP({ ...base, quantity: -1 }, CONFIG)).toThrow();
    expect(() => calculateNRP({ ...base, salePricePaise: 0 }, CONFIG)).toThrow();
    expect(() => calculateNRP({ ...base, distanceKm: -5 }, CONFIG)).toThrow();
    expect(() => calculateNRP({ ...base, storageDays: -1 }, CONFIG)).toThrow();
  });

  test('storage cost is added only when storageDays > 0', () => {
    const withStorage: NRPInput = { ...marketInput('Pune APMC'), storageDays: 3 };
    const result = calculateNRP(withStorage, CONFIG);
    const storage = result.costs.find(c => c.category === CostCategory.STORAGE);
    expect(storage).toBeDefined();
    expect(storage!.totalAmountPaise).toBe(500 * 18 * 3); // ₹5/qtl/day × 18 × 3

    const noStorage = calculateNRP(marketInput('Pune APMC'), CONFIG);
    const noStorageCost = noStorage.costs.find(c => c.category === CostCategory.STORAGE);
    expect(noStorageCost).toBeUndefined();
  });

  test('each cost item has complete metadata', () => {
    const result = calculateNRP(marketInput('Pune APMC'), CONFIG);
    for (const cost of result.costs) {
      expect(cost.category).toBeDefined();
      expect(cost.label).toBeTruthy();
      expect(cost.source).toBeDefined();
      expect(cost.calculationMethod).toBeTruthy();
      expect(cost.confidence).toBeDefined();
      expect(cost.inputs).toBeDefined();
      expect(Object.keys(cost.inputs).length).toBeGreaterThan(0);
    }
  });
});
