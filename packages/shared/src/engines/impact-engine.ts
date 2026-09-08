// ============================================================
// KrishiSetu — Impact Calculation Engine
// Calculates estimated improvement vs baseline.
// Uses unrounded totals to avoid rounding drift.
// Does NOT double-count impact components.
// ============================================================

import {
  BaselineDefinition,
  ChannelType,
  ImpactMetrics,
  NRPConfig,
  NRPInput,
  NRPResult,
  CostCategory,
} from '../types';
import { calculateNRP } from './nrp-engine';

export interface ImpactInput {
  /** The selected opportunity's final NRP result (post-negotiation) */
  selectedNRP: NRPResult;
  selectedOpportunityName: string;
  /** Baseline market data for calculating nearest mandi NRP */
  baselineMarketName: string;
  baselineMarketPricePaise: number;
  baselineDistanceKm: number;
  baselineQuantity: number;
  baselineCommodityId: string;
  config: NRPConfig;
}

/**
 * Calculate impact metrics: selected vs baseline.
 *
 * Baseline = nearest mandi NRP (calculated by engine, not seeded).
 * Impact = selected final NRP − baseline NRP (from unrounded totals).
 *
 * Impact components are kept SEPARATE — not summed into one misleading total.
 */
export function calculateImpact(input: ImpactInput): ImpactMetrics {
  // --- Calculate baseline NRP through the engine ---
  const baselineNRPInput: NRPInput = {
    salePricePaise: input.baselineMarketPricePaise,
    quantity: input.baselineQuantity,
    distanceKm: input.baselineDistanceKm,
    channelType: ChannelType.MARKET,
    buyerProvidesPickup: false,
    commodityId: input.baselineCommodityId,
    storageDays: 0,
  };

  const baselineResult = calculateNRP(baselineNRPInput, input.config);

  // --- Additional realisation: from unrounded totals ---
  const additionalRealisationTotal =
    input.selectedNRP.netTotalValuePaise - baselineResult.netTotalValuePaise;
  const additionalRealisationPerQtl =
    Math.round(additionalRealisationTotal / input.baselineQuantity);

  // --- Transaction cost difference ---
  const selectedCosts = input.selectedNRP.totalCostsPaise;
  const baselineCosts = baselineResult.totalCostsPaise;
  const costDiffTotal = baselineCosts - selectedCosts; // positive = selected is cheaper
  const costDiffPerQtl = Math.round(costDiffTotal / input.baselineQuantity);

  // --- Post-harvest loss comparison ---
  const selectedLoss = input.selectedNRP.costs
    .find(c => c.category === CostCategory.POST_HARVEST_LOSS);
  const baselineLoss = baselineResult.costs
    .find(c => c.category === CostCategory.POST_HARVEST_LOSS);

  const lossReduction = (baselineLoss?.totalAmountPaise ?? 0) - (selectedLoss?.totalAmountPaise ?? 0);

  const baselineLossPercent = baselineLoss
    ? (baselineLoss.inputs['lossPercent'] as number ?? 0)
    : 0;
  const selectedLossPercent = selectedLoss
    ? (selectedLoss.inputs['lossPercent'] as number ?? 0)
    : 0;

  // --- Baseline definition ---
  const baseline: BaselineDefinition = {
    type: 'NEAREST_MANDI_NRP',
    opportunityId: 'baseline',
    opportunityName: input.baselineMarketName,
    nrpPerQtlPaise: baselineResult.netRealisablePricePerQtlPaise,
    nrpTotalPaise: baselineResult.netTotalValuePaise,
    timestamp: new Date(),
  };

  return {
    selectedOpportunityName: input.selectedOpportunityName,
    selectedNRPPerQtlPaise: input.selectedNRP.netRealisablePricePerQtlPaise,
    selectedNRPTotalPaise: input.selectedNRP.netTotalValuePaise,
    baseline,
    additionalRealisationPerQtlPaise: additionalRealisationPerQtl,
    additionalRealisationTotalPaise: additionalRealisationTotal,
    transactionCostDifferencePerQtlPaise: costDiffPerQtl,
    transactionCostDifferenceTotalPaise: costDiffTotal,
    postHarvestLossReductionPaise: lossReduction,
    baselineLossPercent,
    selectedLossPercent,
  };
}
