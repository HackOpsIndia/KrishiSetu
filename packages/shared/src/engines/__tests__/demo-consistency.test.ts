// ============================================================
// Demo Consistency Tests
// Ensures the canonical demo scenario produces consistent
// outputs end-to-end — from raw inputs through all engines.
// ============================================================

import { calculateNRP } from '../nrp-engine';
import { rankOpportunities, checkBuyerEligibility, RankingConfig, EligibilityInput } from '../ranking-engine';
import { calculateTrustScore } from '../trust-engine';
import { calculateAggregation, FarmerLot, BulkDemand, AggregationInput } from '../aggregation-engine';
import { calculateImpact, ImpactInput } from '../impact-engine';
import { calculateMatchScore, checkMatchEligibility, MatchLotInput, MatchBuyerDemandInput } from '../buyer-matching-engine';
import {
  DEMO_NRP_CONFIG,
  DEMO_RANKING_WEIGHTS,
  DEMO_MARKETS,
  DEMO_MARKET_PRICES,
  DEMO_BUYERS,
  DEMO_BUYER_DEMANDS,
  DEMO_LOT,
  DEMO_NEGOTIATION,
  DEMO_FPO_FARMERS,
  DEMO_DEFAULT_MARKET_RELIABILITY,
  DEMO_DEFAULT_MARKET_PAYMENT_RELIABILITY,
  DEMAND_STRENGTH_CONFIG,
  LOGISTICS_SCORE_CONFIG,
} from '../../demo-scenario';
import {
  ChannelType,
  NRPInput,
  MarketOpportunity,
  BuyerOpportunity,
  Opportunity,
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

// --- Helpers ---

function buildMarketOpp(marketName: string): MarketOpportunity {
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

function buildBuyerOpp(companyName: string): BuyerOpportunity {
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

// --- End-to-End Golden Demo Test ---

describe('Golden Demo — End-to-End Consistency', () => {
  test('Step 1–5: NRP comparison produces correct rankings', () => {
    // Calculate NRPs for all markets
    const puneAPMC = calculateNRP({
      salePricePaise: 310000, quantity: 18, distanceKm: 35,
      channelType: ChannelType.MARKET, buyerProvidesPickup: false,
      commodityId: 'tomato', storageDays: 0,
    }, CONFIG);

    const talegaon = calculateNRP({
      salePricePaise: 290000, quantity: 18, distanceKm: 18,
      channelType: ChannelType.MARKET, buyerProvidesPickup: false,
      commodityId: 'tomato', storageDays: 0,
    }, CONFIG);

    const freshmart = calculateNRP({
      salePricePaise: 296000, quantity: 18, distanceKm: 42,
      channelType: ChannelType.BUYER, buyerProvidesPickup: true,
      commodityId: 'tomato', storageDays: 0,
    }, CONFIG);

    // Key insight: Pune APMC ₹3,100 gross → ₹2,787 net
    //              FreshMart ₹2,960 gross → ₹2,925 net
    // Lower displayed price → higher net realization
    expect(freshmart.netRealisablePricePerQtlPaise).toBeGreaterThan(
      puneAPMC.netRealisablePricePerQtlPaise
    );
    expect(freshmart.grossPricePerQtlPaise).toBeLessThan(
      puneAPMC.grossPricePerQtlPaise
    );
  });

  test('Step 6: FreshMart ranks #1', () => {
    const markets = DEMO_MARKETS.map(m => buildMarketOpp(m.name));
    const eligibleBuyers = ['FreshMart Foods', 'Pune Veggie Hub', 'Hotel Grand', 'RK Traders']
      .map(n => buildBuyerOpp(n));

    const ranked = rankOpportunities([...markets, ...eligibleBuyers], LOT_QTY, RANKING_CONFIG);
    expect((ranked[0].opportunity as BuyerOpportunity).buyerName).toBe('FreshMart Foods');
  });

  test('Step 7: AgriFresh is filtered out (min lot 50 > 18)', () => {
    const lot: EligibilityInput = {
      lotQuantity: DEMO_LOT.quantity,
      lotCommodity: DEMO_LOT.commodityName,
      lotVariety: DEMO_LOT.varietyName,
      lotGrade: DEMO_LOT.qualityGrade,
    };

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
  });

  test('Steps 8–11: Negotiation flow to agreed ₹2,975', () => {
    const agreed = DEMO_NEGOTIATION.finalAgreedPricePaise;
    expect(agreed).toBe(297500); // ₹2,975

    const postNeg = calculateNRP({
      salePricePaise: agreed,
      quantity: 18,
      distanceKm: 42,
      channelType: ChannelType.BUYER,
      buyerProvidesPickup: true,
      commodityId: 'tomato',
      storageDays: 0,
    }, CONFIG);

    // Final NRP ≈ ₹2,940
    expect(postNeg.netRealisablePricePerQtlPaise).toBeGreaterThan(293000);
    expect(postNeg.netRealisablePricePerQtlPaise).toBeLessThan(295000);

    // Payment = ₹53,550
    expect(postNeg.grossTotalPaise).toBe(5355000);
  });

  test('Steps 12–13: Impact vs baseline', () => {
    const talegaon = DEMO_MARKETS.find(m => m.name === 'Talegaon Mandi')!;
    const talegaonPrice = DEMO_MARKET_PRICES.find(p => p.marketName === 'Talegaon Mandi')!;

    const postNeg = calculateNRP({
      salePricePaise: DEMO_NEGOTIATION.finalAgreedPricePaise,
      quantity: 18, distanceKm: 42,
      channelType: ChannelType.BUYER, buyerProvidesPickup: true,
      commodityId: 'tomato', storageDays: 0,
    }, CONFIG);

    const impact = calculateImpact({
      selectedNRP: postNeg,
      selectedOpportunityName: 'FreshMart Foods',
      baselineMarketName: 'Talegaon Mandi',
      baselineMarketPricePaise: talegaonPrice.modalPricePaise,
      baselineDistanceKm: talegaon.distanceFromFarmerKm,
      baselineQuantity: 18,
      baselineCommodityId: 'tomato',
      config: CONFIG,
    });

    // Improvement ≈ ₹318/qtl
    expect(impact.additionalRealisationPerQtlPaise).toBeGreaterThan(30000);
    expect(impact.additionalRealisationPerQtlPaise).toBeLessThan(34000);

    // Total ≈ ₹5,726
    expect(impact.additionalRealisationTotalPaise).toBeGreaterThan(550000);
    expect(impact.additionalRealisationTotalPaise).toBeLessThan(600000);
  });

  test('Steps 14–17: FPO aggregation', () => {
    const talegaonPrice = DEMO_MARKET_PRICES.find(p => p.marketName === 'Talegaon Mandi')!;
    const freshmart = DEMO_BUYERS.find(b => b.companyName === 'FreshMart Foods')!;
    const freshmartDemand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === 'FreshMart Foods')!;

    const farmers: FarmerLot[] = DEMO_FPO_FARMERS.map(f => ({
      farmerId: f.email,
      farmerName: f.name,
      quantity: f.lotQuantity,
      variety: f.variety,
      grade: f.grade,
      distanceToNearestMandiKm: 18,
      nearestMandiPricePaise: talegaonPrice.modalPricePaise,
    }));

    const result = calculateAggregation({
      commodityId: 'tomato', commodityName: 'Tomato',
      varietyId: 'hybrid', varietyName: 'Hybrid',
      targetVariety: 'Hybrid', targetGrade: 'A',
      farmers,
      demand: {
        demandId: 'demand-freshmart',
        buyerName: 'FreshMart Foods',
        commodityName: 'Tomato',
        varietyName: 'Hybrid',
        minQualityGrade: 'A',
        quantity: freshmartDemand.quantity,
        pricePaise: freshmartDemand.offeredPricePaise,
        buyerProvidesPickup: freshmart.providesPickup,
        distanceKm: freshmart.distanceFromFarmerKm,
      },
      config: CONFIG,
    });

    // 3 eligible, 1 excluded
    expect(result.eligibleFarmers.length).toBe(3);
    expect(result.excludedFarmers.length).toBe(1);

    // 75 qtl pooled
    expect(result.totalQuantity).toBe(75);

    // Bulk advantage ≈ ₹297/qtl
    expect(result.estimatedBulkAdvantagePaise).toBeGreaterThan(28000);
    expect(result.estimatedBulkAdvantagePaise).toBeLessThan(32000);
  });
});
