// ============================================================
// Impact Engine Tests
// Validates impact calculation: selected vs baseline NRP.
// Uses canonical demo scenario post-negotiation data.
// ============================================================

import { calculateImpact, ImpactInput } from '../impact-engine';
import { calculateNRP } from '../nrp-engine';
import {
  DEMO_NRP_CONFIG,
  DEMO_NEGOTIATION,
  DEMO_LOT,
  DEMO_MARKET_PRICES,
  DEMO_MARKETS,
} from '../../demo-scenario';
import { ChannelType, NRPInput } from '../../types';

const CONFIG = DEMO_NRP_CONFIG;

// Post-negotiation NRP for FreshMart at ₹2,975
function buildPostNegotiationNRP() {
  const input: NRPInput = {
    salePricePaise: DEMO_NEGOTIATION.finalAgreedPricePaise,
    quantity: DEMO_LOT.quantity,
    distanceKm: 42, // FreshMart distance
    channelType: ChannelType.BUYER,
    buyerProvidesPickup: true,
    commodityId: 'tomato',
    storageDays: 0,
  };
  return calculateNRP(input, CONFIG);
}

function buildImpactInput(): ImpactInput {
  const talegaon = DEMO_MARKETS.find(m => m.name === 'Talegaon Mandi')!;
  const talegaonPrice = DEMO_MARKET_PRICES.find(p => p.marketName === 'Talegaon Mandi')!;

  return {
    selectedNRP: buildPostNegotiationNRP(),
    selectedOpportunityName: 'FreshMart Foods',
    baselineMarketName: 'Talegaon Mandi',
    baselineMarketPricePaise: talegaonPrice.modalPricePaise,
    baselineDistanceKm: talegaon.distanceFromFarmerKm,
    baselineQuantity: DEMO_LOT.quantity,
    baselineCommodityId: 'tomato',
    config: CONFIG,
  };
}

describe('Impact Engine — Canonical Demo', () => {
  test('baseline is Talegaon (nearest mandi)', () => {
    const result = calculateImpact(buildImpactInput());

    expect(result.baseline.type).toBe('NEAREST_MANDI_NRP');
    expect(result.baseline.opportunityName).toBe('Talegaon Mandi');
  });

  test('baseline NRP ≈ ₹2,622/qtl', () => {
    const result = calculateImpact(buildImpactInput());

    // ≈ 262200 paise
    expect(result.baseline.nrpPerQtlPaise).toBeGreaterThan(260000);
    expect(result.baseline.nrpPerQtlPaise).toBeLessThan(265000);
  });

  test('selected NRP ≈ ₹2,940/qtl (post-negotiation)', () => {
    const result = calculateImpact(buildImpactInput());

    // ≈ 294000 paise
    expect(result.selectedNRPPerQtlPaise).toBeGreaterThan(293000);
    expect(result.selectedNRPPerQtlPaise).toBeLessThan(295000);
  });

  test('improvement ≈ ₹318/qtl', () => {
    const result = calculateImpact(buildImpactInput());

    // ≈ 31800 paise
    expect(result.additionalRealisationPerQtlPaise).toBeGreaterThan(30000);
    expect(result.additionalRealisationPerQtlPaise).toBeLessThan(34000);
  });

  test('total improvement ≈ ₹5,726', () => {
    const result = calculateImpact(buildImpactInput());

    // ≈ 572600 paise
    expect(result.additionalRealisationTotalPaise).toBeGreaterThan(550000);
    expect(result.additionalRealisationTotalPaise).toBeLessThan(600000);
  });

  test('impact is calculated from totals, not rounded per-qtl values', () => {
    const result = calculateImpact(buildImpactInput());

    // Total impact should be (selectedTotal - baselineTotal), not (perQtl × qty)
    // They may differ slightly due to rounding
    const selectedTotal = result.selectedNRPTotalPaise;
    const baselineTotal = result.baseline.nrpTotalPaise;
    expect(result.additionalRealisationTotalPaise).toBe(selectedTotal - baselineTotal);
  });

  test('post-harvest loss is lower for direct buyer than mandi', () => {
    const result = calculateImpact(buildImpactInput());

    expect(result.selectedLossPercent).toBeLessThan(result.baselineLossPercent);
    expect(result.postHarvestLossReductionPaise).toBeGreaterThan(0);
  });
});
