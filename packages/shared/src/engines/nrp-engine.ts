// ============================================================
// KrishiSetu — Net Realisable Price Engine
// THE most important calculation in the entire system.
// Single authoritative implementation. No duplicates anywhere.
//
// All monetary values in INTEGER PAISE.
// All rates injected via NRPConfig — no magic numbers.
// ============================================================

import {
  CostCategory,
  CostConfidence,
  CostItem,
  CostSource,
  ChannelType,
  NRPConfig,
  NRPInput,
  NRPResult,
} from '../types';

/**
 * Calculate Net Realisable Price for a selling opportunity.
 *
 * This function is the SINGLE SOURCE OF TRUTH for NRP calculations.
 * Every other module (ranking, impact, FPO, analytics) must call this.
 *
 * @param input - Sale parameters (price, quantity, distance, channel, etc.)
 * @param config - Platform configuration (rates, fees, percentages)
 * @returns Complete NRP breakdown with itemized costs
 */
export function calculateNRP(input: NRPInput, config: NRPConfig): NRPResult {
  // --- Validate inputs ---
  if (input.quantity <= 0) {
    throw new Error(`Invalid quantity: ${input.quantity}. Must be positive.`);
  }
  if (input.salePricePaise <= 0) {
    throw new Error(`Invalid sale price: ${input.salePricePaise}. Must be positive.`);
  }
  if (input.distanceKm < 0) {
    throw new Error(`Invalid distance: ${input.distanceKm}. Must be non-negative.`);
  }
  if (input.storageDays < 0) {
    throw new Error(`Invalid storage days: ${input.storageDays}. Must be non-negative.`);
  }

  const grossTotal = input.salePricePaise * input.quantity;
  const costs: CostItem[] = [];

  // --- 1. Transport ---
  if (input.channelType === ChannelType.BUYER && input.buyerProvidesPickup) {
    // Buyer provides pickup — farmer transport cost is genuinely ₹0.
    // We do NOT add a zero-value cost item. The absence means "not applicable".
  } else if (input.distanceKm > 0) {
    const transportTotal = input.distanceKm * config.transportRatePerKmPaise;
    const transportPerQtl = Math.round(transportTotal / input.quantity);
    costs.push({
      category: CostCategory.TRANSPORT,
      label: 'Transport',
      amountPerQtlPaise: transportPerQtl,
      totalAmountPaise: transportTotal,
      source: CostSource.CALCULATED,
      calculationMethod: `${input.distanceKm} km × ₹${config.transportRatePerKmPaise / 100}/km`,
      confidence: CostConfidence.HIGH,
      inputs: {
        distanceKm: input.distanceKm,
        ratePerKmPaise: config.transportRatePerKmPaise,
        quantity: input.quantity,
      },
    });
  }

  // --- 2. Loading ---
  const isMarket = input.channelType === ChannelType.MARKET;
  const loadingRatePaise = isMarket
    ? config.mandiLoadingPerQtlPaise
    : config.buyerLoadingPerQtlPaise;
  const loadingTotal = loadingRatePaise * input.quantity;

  costs.push({
    category: CostCategory.LOADING,
    label: isMarket ? 'Mandi loading/unloading' : 'Loading',
    amountPerQtlPaise: loadingRatePaise,
    totalAmountPaise: loadingTotal,
    source: CostSource.CONFIG,
    calculationMethod: `${input.quantity} qtl × ₹${loadingRatePaise / 100}/qtl`,
    confidence: CostConfidence.HIGH,
    inputs: {
      ratePerQtlPaise: loadingRatePaise,
      quantity: input.quantity,
    },
  });

  // --- 3. APMC Commission (MARKET only) ---
  if (isMarket) {
    const commissionTotal = Math.round(grossTotal * config.apmcCommissionPct / 100);
    const commissionPerQtl = Math.round(commissionTotal / input.quantity);
    costs.push({
      category: CostCategory.COMMISSION,
      label: 'APMC Commission',
      amountPerQtlPaise: commissionPerQtl,
      totalAmountPaise: commissionTotal,
      source: CostSource.CONFIG,
      calculationMethod: `₹${input.salePricePaise / 100}/qtl × ${input.quantity} qtl × ${config.apmcCommissionPct}%`,
      confidence: CostConfidence.HIGH,
      inputs: {
        grossTotalPaise: grossTotal,
        commissionPct: config.apmcCommissionPct,
      },
    });
  }

  // --- 4. APMC Market Fee (MARKET only) ---
  if (isMarket) {
    const marketFeeTotal = Math.round(grossTotal * config.apmcMarketFeePct / 100);
    const marketFeePerQtl = Math.round(marketFeeTotal / input.quantity);
    costs.push({
      category: CostCategory.MARKET_FEES,
      label: 'APMC Market Fee',
      amountPerQtlPaise: marketFeePerQtl,
      totalAmountPaise: marketFeeTotal,
      source: CostSource.CONFIG,
      calculationMethod: `₹${input.salePricePaise / 100}/qtl × ${input.quantity} qtl × ${config.apmcMarketFeePct}%`,
      confidence: CostConfidence.HIGH,
      inputs: {
        grossTotalPaise: grossTotal,
        marketFeePct: config.apmcMarketFeePct,
      },
    });
  }

  // --- 5. Weighing (MARKET only) ---
  if (isMarket) {
    const weighingTotal = config.apmcWeighingPerQtlPaise * input.quantity;
    costs.push({
      category: CostCategory.WEIGHING,
      label: 'Weighing charge',
      amountPerQtlPaise: config.apmcWeighingPerQtlPaise,
      totalAmountPaise: weighingTotal,
      source: CostSource.CONFIG,
      calculationMethod: `${input.quantity} qtl × ₹${config.apmcWeighingPerQtlPaise / 100}/qtl`,
      confidence: CostConfidence.HIGH,
      inputs: {
        ratePerQtlPaise: config.apmcWeighingPerQtlPaise,
        quantity: input.quantity,
      },
    });
  }

  // --- 6. Post-harvest loss ---
  const lossPercent = isMarket ? config.mandiLossPercent : config.directLossPercent;
  if (lossPercent > 0) {
    const lossTotal = Math.round(grossTotal * lossPercent / 100);
    const lossPerQtl = Math.round(lossTotal / input.quantity);
    costs.push({
      category: CostCategory.POST_HARVEST_LOSS,
      label: `Estimated post-harvest loss (${lossPercent}%)`,
      amountPerQtlPaise: lossPerQtl,
      totalAmountPaise: lossTotal,
      source: CostSource.ESTIMATED,
      calculationMethod: `Gross ₹${grossTotal / 100} × ${lossPercent}%`,
      confidence: isMarket ? CostConfidence.MEDIUM : CostConfidence.MEDIUM,
      inputs: {
        grossTotalPaise: grossTotal,
        lossPercent,
      },
    });
  }

  // --- 7. Storage (if applicable) ---
  if (input.storageDays > 0 && config.storageCostPerQtlPerDayPaise > 0) {
    const storageTotal = config.storageCostPerQtlPerDayPaise * input.quantity * input.storageDays;
    const storagePerQtl = config.storageCostPerQtlPerDayPaise * input.storageDays;
    costs.push({
      category: CostCategory.STORAGE,
      label: `Storage (${input.storageDays} days)`,
      amountPerQtlPaise: storagePerQtl,
      totalAmountPaise: storageTotal,
      source: CostSource.CONFIG,
      calculationMethod: `${input.quantity} qtl × ₹${config.storageCostPerQtlPerDayPaise / 100}/qtl/day × ${input.storageDays} days`,
      confidence: CostConfidence.HIGH,
      inputs: {
        ratePerQtlPerDayPaise: config.storageCostPerQtlPerDayPaise,
        quantity: input.quantity,
        days: input.storageDays,
      },
    });
  }

  // --- Totals ---
  const totalCosts = costs.reduce((sum, c) => sum + c.totalAmountPaise, 0);
  let netTotal = grossTotal - totalCosts;

  // Invariant: net cannot be negative (warn instead)
  if (netTotal < 0) {
    netTotal = 0;
  }

  const netPerQtl = Math.round(netTotal / input.quantity);

  // margin as percentage with 2 decimal precision
  const marginPercent = grossTotal > 0
    ? Math.round((netTotal / grossTotal) * 10000) / 100
    : 0;

  return {
    grossPricePerQtlPaise: input.salePricePaise,
    grossTotalPaise: grossTotal,
    costs,
    totalCostsPaise: totalCosts,
    netRealisablePricePerQtlPaise: netPerQtl,
    netTotalValuePaise: netTotal,
    marginPercent,
    channelType: input.channelType,
    quantity: input.quantity,
  };
}

/**
 * Check if the NRP result indicates an economic warning
 * (costs exceed or nearly exceed gross value).
 */
export function hasEconomicWarning(result: NRPResult): boolean {
  return result.netTotalValuePaise === 0 && result.grossTotalPaise > 0;
}
