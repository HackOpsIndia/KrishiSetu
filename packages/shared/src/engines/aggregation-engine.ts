// ============================================================
// KrishiSetu — FPO Aggregation Engine
// Pools compatible farmer lots, calculates individual vs pooled NRP,
// and derives the bulk advantage — all from the NRP engine.
// ============================================================

import {
  AggregationExclusion,
  AggregationFarmer,
  AggregationOpportunity,
  ChannelType,
  NRPConfig,
  NRPInput,
} from '../types';
import { calculateNRP } from './nrp-engine';

export interface FarmerLot {
  farmerId: string;
  farmerName: string;
  quantity: number;
  variety: string;
  grade: string;
  /** Distance to nearest mandi (for individual NRP baseline) */
  distanceToNearestMandiKm: number;
  /** Nearest mandi modal price in paise */
  nearestMandiPricePaise: number;
}

export interface BulkDemand {
  demandId: string;
  buyerName: string;
  commodityName: string;
  varietyName: string;
  minQualityGrade: string;
  quantity: number;
  pricePaise: number;
  buyerProvidesPickup: boolean;
  distanceKm: number;
  minLotSize?: number;
}

export interface CandidateBuyer {
  buyerName: string;
  minLotSize: number;
  pricePaise: number;
  distanceKm: number;
  providesPickup: boolean;
}

export interface AggregationInput {
  commodityId: string;
  commodityName: string;
  varietyId: string;
  varietyName: string;
  targetVariety: string;
  targetGrade: string;
  farmers: FarmerLot[];
  demand: BulkDemand;
  candidateBuyers?: CandidateBuyer[];
  config: NRPConfig;
}

/**
 * Determine if a given lot quantity meets a buyer's minimum lot requirement.
 */
export function isBuyerEligible(quantity: number, minLotSize: number): boolean {
  return quantity >= minLotSize;
}

/**
 * Evaluates whether pooling allows farmers to unlock an institutional buyer
 * that no single farmer could satisfy on their own.
 */
export function evaluateBuyerDemandUnlock(
  buyerName: string,
  minLotSize: number,
  individualLots: { farmerName: string; quantity: number }[],
  pooledQuantity: number,
) {
  const individualEligible = individualLots.some(f => f.quantity >= minLotSize);
  const pooledEligible = pooledQuantity >= minLotSize;
  const demandUnlocked = pooledEligible && !individualEligible;
  const individualQuantitiesStr = individualLots.map(f => `${f.quantity} qtl`).join(' / ');

  return {
    buyerName,
    minimumRequiredQuantity: minLotSize,
    individualLots,
    pooledQuantity,
    individualEligible,
    pooledEligible,
    demandUnlocked,
    message: demandUnlocked
      ? `${buyerName} requires ${minLotSize} qtl minimum. Individual farmer lots (${individualQuantitiesStr}) cannot satisfy minimum. Compatible pooled quantity reaches ${pooledQuantity} qtl: ${buyerName} demand unlocked through FPO aggregation.`
      : pooledEligible
      ? `${buyerName} minimum of ${minLotSize} qtl satisfied by individual lot.`
      : `Pooled quantity of ${pooledQuantity} qtl does not meet ${buyerName} minimum of ${minLotSize} qtl.`,
  };
}

/**
 * Detect aggregation opportunity for an FPO.
 *
 * Steps:
 * 1. Filter farmers by commodity + variety + grade compatibility
 * 2. Calculate individual NRP for each eligible farmer (selling to nearest mandi)
 * 3. Calculate pooled NRP (selling as bulk to buyer)
 * 4. Derive bulk advantage = pooled − weighted individual average
 * 5. Evaluate buyer eligibility & institutional demand unlock
 */
export function calculateAggregation(input: AggregationInput): AggregationOpportunity {
  const eligible: AggregationFarmer[] = [];
  const excluded: AggregationExclusion[] = [];

  // --- 1. Eligibility check per farmer ---
  for (const farmer of input.farmers) {
    const reasons: string[] = [];

    if (farmer.variety.toLowerCase() !== input.targetVariety.toLowerCase()) {
      reasons.push(`${input.commodityName} (${farmer.variety}) variety not compatible with demand for ${input.commodityName} (${input.targetVariety})`);
    }

    if (!isGradeCompatible(farmer.grade, input.targetGrade)) {
      reasons.push(`Grade ${farmer.grade} does not meet minimum Grade ${input.targetGrade} requirement`);
    }

    if (reasons.length > 0) {
      excluded.push({
        farmerId: farmer.farmerId,
        farmerName: farmer.farmerName,
        reason: reasons.join('; '),
      });
      continue;
    }

    // --- Calculate individual NRP (selling to nearest mandi) ---
    const individualNRPInput: NRPInput = {
      salePricePaise: farmer.nearestMandiPricePaise,
      quantity: farmer.quantity,
      distanceKm: farmer.distanceToNearestMandiKm,
      channelType: ChannelType.MARKET,
      buyerProvidesPickup: false,
      commodityId: input.commodityId,
      storageDays: 0,
    };

    const individualResult = calculateNRP(individualNRPInput, input.config);

    eligible.push({
      farmerId: farmer.farmerId,
      farmerName: farmer.farmerName,
      quantity: farmer.quantity,
      qualityGrade: farmer.grade,
      individualNRPPaise: individualResult.netRealisablePricePerQtlPaise,
    });
  }

  // --- 2. Weighted average individual NRP ---
  const totalQuantity = eligible.reduce((sum, f) => sum + f.quantity, 0);

  let individualWeightedAvgNRP = 0;
  if (totalQuantity > 0) {
    const weightedSum = eligible.reduce(
      (sum, f) => sum + f.individualNRPPaise * f.quantity,
      0,
    );
    individualWeightedAvgNRP = Math.round(weightedSum / totalQuantity);
  }

  // --- 3. Pooled NRP (bulk sale to buyer) ---
  const pooledNRPInput: NRPInput = {
    salePricePaise: input.demand.pricePaise,
    quantity: totalQuantity,
    distanceKm: input.demand.distanceKm,
    channelType: ChannelType.BUYER,
    buyerProvidesPickup: input.demand.buyerProvidesPickup,
    commodityId: input.commodityId,
    storageDays: 0,
  };

  let pooledNRP = 0;
  if (totalQuantity > 0) {
    const pooledResult = calculateNRP(pooledNRPInput, input.config);
    pooledNRP = pooledResult.netRealisablePricePerQtlPaise;
  }

  // --- 4. Bulk advantage ---
  const bulkAdvantage = pooledNRP - individualWeightedAvgNRP;
  const bulkAdvantagePercent = individualWeightedAvgNRP > 0
    ? Math.round(bulkAdvantage / individualWeightedAvgNRP * 10000) / 100
    : 0;

  const demandCoverage = input.demand.quantity > 0
    ? Math.round(totalQuantity / input.demand.quantity * 10000) / 100
    : 0;

  const totalImprovement = bulkAdvantage * totalQuantity;

  // --- 5. Dynamic Buyer Eligibility & Demand Unlock ---
  const minRequiredQty = input.demand.minLotSize ?? 1;
  const individualLots = eligible.map(f => ({ farmerName: f.farmerName, quantity: f.quantity }));
  const unlockEval = evaluateBuyerDemandUnlock(
    input.demand.buyerName,
    minRequiredQty,
    individualLots,
    totalQuantity,
  );

  // Evaluate candidate buyers if provided, or default list including AgriFresh
  const matchedBuyers: AggregationOpportunity['matchedBuyers'] = [];

  // Add primary matched/selected buyer
  matchedBuyers.push({
    buyerName: input.demand.buyerName,
    minLotSize: minRequiredQty,
    individualEligibility: individualLots.some(f => f.quantity >= minRequiredQty) ? 'ELIGIBLE' : 'UNAVAILABLE',
    pooledEligibility: totalQuantity >= minRequiredQty ? 'ELIGIBLE' : 'UNAVAILABLE',
    state: 'SELECTED',
    pooledNRPPaise: pooledNRP,
    pooledNRPRupees: Math.round(pooledNRP / 100),
    statusText: 'Selected baseline buyer for aggregation',
  });

  // Evaluate candidate institutional buyers if supplied
  if (input.candidateBuyers && input.candidateBuyers.length > 0) {
    for (const cb of input.candidateBuyers) {
      if (cb.buyerName === input.demand.buyerName) continue;
      const indElig = individualLots.some(f => f.quantity >= cb.minLotSize);
      const poolElig = totalQuantity >= cb.minLotSize;

      let cbPooledNRP = 0;
      if (poolElig && totalQuantity > 0) {
        const cbNrpResult = calculateNRP({
          salePricePaise: cb.pricePaise,
          quantity: totalQuantity,
          distanceKm: cb.distanceKm,
          channelType: ChannelType.BUYER,
          buyerProvidesPickup: cb.providesPickup,
          commodityId: input.commodityId,
          storageDays: 0,
        }, input.config);
        cbPooledNRP = cbNrpResult.netRealisablePricePerQtlPaise;
      }

      matchedBuyers.push({
        buyerName: cb.buyerName,
        minLotSize: cb.minLotSize,
        individualEligibility: indElig ? 'ELIGIBLE' : 'UNAVAILABLE',
        pooledEligibility: poolElig ? 'ELIGIBLE' : 'UNAVAILABLE',
        state: poolElig ? 'ELIGIBLE' : 'UNAVAILABLE',
        pooledNRPPaise: cbPooledNRP,
        pooledNRPRupees: Math.round(cbPooledNRP / 100),
        statusText: poolElig
          ? (!indElig ? 'Eligible demand unlocked — offer required' : 'Eligible buyer')
          : `Unavailable: requires minimum ${cb.minLotSize} qtl`,
      });
    }
  }

  return {
    commodityId: input.commodityId,
    commodityName: input.commodityName,
    varietyId: input.varietyId,
    varietyName: input.varietyName,
    eligibleFarmers: eligible,
    excludedFarmers: excluded,
    totalQuantity,
    pooledQuantity: totalQuantity,
    matchingDemandId: input.demand.demandId,
    matchingBuyerName: input.demand.buyerName,
    demandQuantity: input.demand.quantity,
    demandCoveragePercent: demandCoverage,
    minimumRequiredQuantity: minRequiredQty,
    demandUnlocked: unlockEval.demandUnlocked,
    demandUnlockExplanation: unlockEval,
    matchedBuyers,
    individualWeightedAvgNRPPaise: individualWeightedAvgNRP,
    individualAverageNRP: Math.round(individualWeightedAvgNRP / 100),
    pooledNRPPaise: pooledNRP,
    pooledNRP: Math.round(pooledNRP / 100),
    bulkAdvantage: Math.round(bulkAdvantage / 100),
    bulkAdvantagePaise: bulkAdvantage,
    estimatedBulkAdvantagePaise: bulkAdvantage,
    estimatedBulkAdvantagePercent: bulkAdvantagePercent,
    bulkAdvantagePercent,
    totalImprovementPaise: totalImprovement,
  };
}

function isGradeCompatible(lotGrade: string, minGrade: string): boolean {
  const order: Record<string, number> = { 'A': 3, 'B': 2, 'C': 1 };
  return (order[lotGrade.toUpperCase()] ?? 0) >= (order[minGrade.toUpperCase()] ?? 0);
}
