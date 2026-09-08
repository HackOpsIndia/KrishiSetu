// ============================================================
// Opportunities Service — The core intelligence endpoint.
// Assembles market + buyer data → NRP → ranking → explanation.
// ALL calculations done server-side. Frontend receives results.
// ============================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NRPService } from '../domain/nrp.service';
import { RankingService } from '../domain/ranking.service';
import { MatchingService } from '../domain/matching.service';
import { TrustService } from '../domain/trust.service';
import { ConfigService } from '../domain/config.service';
import {
  ChannelType,
  CostCategory,
  NRPInput,
  MarketOpportunity,
  BuyerOpportunity,
  Opportunity,
  EligibilityResult,
  RankedOpportunity,
  MatchResult,
  calculateAggregation,
  haversineDistance,
  haversineToRoadDistance,
} from '@krishisetu/shared';
import {
  DEMO_NRP_CONFIG,
  DEMO_RANKING_WEIGHTS,
  DEMO_MARKETS,
  DEMO_MARKET_PRICES,
  DEMO_BUYERS,
  DEMO_BUYER_DEMANDS,
  DEMO_LOT,
  DEMO_FPO_FARMERS,
  DEMO_DEFAULT_MARKET_RELIABILITY,
  DEMO_DEFAULT_MARKET_PAYMENT_RELIABILITY,
  DEMAND_STRENGTH_CONFIG,
  LOGISTICS_SCORE_CONFIG,
} from '@krishisetu/shared';
import { EligibilityInput, BuyerEligibilityData } from '@krishisetu/shared';

@Injectable()
export class OpportunitiesService {
  constructor(
    private prisma: PrismaService,
    private nrpService: NRPService,
    private rankingService: RankingService,
    private matchingService: MatchingService,
    private trustService: TrustService,
    private configService: ConfigService,
  ) {}

  /**
   * Analyze opportunities for a lot — the main intelligence endpoint.
   * Returns ranked markets + buyers with NRP, explanations, and comparisons.
   */
  async analyzeForLot(lotId: string) {
    if (!this.prisma.isConnected || lotId === 'demo-lot' || lotId === 'demo') {
      return this.analyzeCanonicalDemo();
    }

    try {
      const lot = await this.prisma.lot.findUnique({
        where: { id: lotId },
        include: { farmer: true },
      });
      if (!lot) return this.analyzeCanonicalDemo();

      // 1. Get market data
      const marketPrices = await this.prisma.marketPrice.findMany({
        where: {
          commodityName: lot.commodityName,
          varietyName: lot.varietyName,
        },
        orderBy: { date: 'desc' },
        include: { market: true },
        distinct: ['marketId'],
      });

      // 2. Get buyer demands
      const buyerDemands = await this.prisma.buyerDemand.findMany({
        where: {
          commodityName: lot.commodityName,
          varietyName: lot.varietyName,
          isActive: true,
        },
        include: { buyer: true },
      });

      // 3. Build market opportunities with NRP
      const marketOpps: MarketOpportunity[] = marketPrices.map(mp => {
        const distanceKm = mp.market.latitude && lot.farmer.latitude
          ? this.estimateDistance(lot.farmer.latitude, lot.farmer.longitude, mp.market.latitude, mp.market.longitude)
          : 30;

        const nrpInput: NRPInput = {
          salePricePaise: mp.modalPricePaise,
          quantity: lot.quantity,
          distanceKm,
          channelType: ChannelType.MARKET,
          buyerProvidesPickup: false,
          commodityId: lot.commodityName.toLowerCase(),
          storageDays: 0,
        };

        return {
          type: ChannelType.MARKET as const,
          marketId: mp.marketId,
          marketName: mp.market.name,
          modalPricePaise: mp.modalPricePaise,
          minPricePaise: mp.minPricePaise,
          maxPricePaise: mp.maxPricePaise,
          arrivals: mp.arrivals || 0,
          priceTrend: mp.priceTrend as any,
          distanceKm,
          nrp: this.nrpService.calculate(nrpInput),
        };
      });

      // 4. Eligibility check + build buyer opportunities
      const lotEligibility: EligibilityInput = {
        lotQuantity: lot.quantity,
        lotCommodity: lot.commodityName,
        lotVariety: lot.varietyName,
        lotGrade: lot.qualityGrade,
      };

      const eligibilityResults: EligibilityResult[] = [];
      const eligibleBuyerOpps: BuyerOpportunity[] = [];

      for (const demand of buyerDemands) {
        const buyer = demand.buyer;
        const distanceKm = buyer.latitude && lot.farmer.latitude
          ? this.estimateDistance(lot.farmer.latitude, lot.farmer.longitude, buyer.latitude, buyer.longitude)
          : 30;

        const buyerData: BuyerEligibilityData = {
          buyerId: buyer.id,
          buyerName: buyer.companyName,
          demandCommodity: demand.commodityName,
          demandVariety: demand.varietyName,
          minQualityGrade: demand.minQualityGrade,
          minLotSize: demand.minLotSize,
          serviceRadiusKm: buyer.serviceRadiusKm,
          distanceKm,
        };

        const eligibility = this.rankingService.checkEligibility(lotEligibility, buyerData);
        eligibilityResults.push(eligibility);

        if (!eligibility.eligible) continue;

        const trustScore = this.trustService.calculate({
          completedTransactions: buyer.completedTransactions,
          successfulTransactions: buyer.successfulTransactions,
          onTimePayments: buyer.onTimePayments,
          disputes: buyer.disputes,
          accountAgeDays: buyer.accountAgeDays,
          verificationLevel: buyer.verificationLevel as any,
        });

        const nrpInput: NRPInput = {
          salePricePaise: demand.offeredPricePaise,
          quantity: lot.quantity,
          distanceKm,
          channelType: ChannelType.BUYER,
          buyerProvidesPickup: buyer.providesPickup,
          commodityId: lot.commodityName.toLowerCase(),
          storageDays: 0,
        };

        eligibleBuyerOpps.push({
          type: ChannelType.BUYER as const,
          buyerId: buyer.id,
          buyerName: buyer.companyName,
          demandId: demand.id,
          offeredPricePaise: demand.offeredPricePaise,
          demandQuantity: demand.quantity,
          qualityMatch: demand.qualityMatchScore,
          trustScore,
          distanceKm,
          deliveryWindow: `${demand.deliveryWindowStart.toISOString().split('T')[0]} to ${demand.deliveryWindowEnd.toISOString().split('T')[0]}`,
          providesPickup: buyer.providesPickup,
          nrp: this.nrpService.calculate(nrpInput),
        });
      }

      // 5. Rank all eligible opportunities
      const allOpps: Opportunity[] = [...marketOpps, ...eligibleBuyerOpps];
      const ranked = this.rankingService.rank(allOpps, lot.quantity);

      // 6. Find baseline
      let baseline = null;
      if (marketOpps.length > 0) {
        const nearestMarket = marketOpps.reduce((prev, curr) =>
          curr.distanceKm < prev.distanceKm ? curr : prev
        );
        baseline = {
          type: 'NEAREST_MANDI_NRP',
          marketName: nearestMarket.marketName,
          nrpPerQtlPaise: nearestMarket.nrp.netRealisablePricePerQtlPaise,
          nrpTotalPaise: nearestMarket.nrp.netTotalValuePaise,
          distanceKm: nearestMarket.distanceKm,
        };
      }

      return {
        lotId: lot.id,
        lotSummary: {
          commodityName: lot.commodityName,
          varietyName: lot.varietyName,
          quantity: lot.quantity,
          qualityGrade: lot.qualityGrade,
        },
        ranked,
        ineligible: eligibilityResults.filter(e => !e.eligible),
        baseline,
        demoMode: process.env.DEMO_MODE !== 'false',
        dataProvenance: {
          source: 'LIVE_DB',
          refreshedAt: new Date().toISOString(),
          disclaimer: 'Live DB connected',
        },
      };
    } catch (err) {
      return this.analyzeCanonicalDemo();
    }
  }

  /**
   * Evaluates the canonical demo scenario directly with domain engines.
   */
  analyzeCanonicalDemo() {
    const lotQuantity = DEMO_LOT.quantity;

    // 1. Markets
    const marketOpps: MarketOpportunity[] = DEMO_MARKETS.map(market => {
      const price = DEMO_MARKET_PRICES.find(p => p.marketName === market.name)!;
      const nrpInput: NRPInput = {
        salePricePaise: price.modalPricePaise,
        quantity: lotQuantity,
        distanceKm: market.distanceFromFarmerKm,
        channelType: ChannelType.MARKET,
        buyerProvidesPickup: false,
        commodityId: 'tomato',
        storageDays: 0,
      };

      return {
        type: ChannelType.MARKET as const,
        marketId: market.name.toLowerCase().replace(/\s/g, '-'),
        marketName: market.name,
        modalPricePaise: price.modalPricePaise,
        minPricePaise: price.minPricePaise,
        maxPricePaise: price.maxPricePaise,
        arrivals: price.arrivals,
        priceTrend: price.priceTrend,
        distanceKm: market.distanceFromFarmerKm,
        nrp: this.nrpService.calculate(nrpInput),
      };
    });

    // 2. Buyer demands & eligibility
    const lotEligibility: EligibilityInput = {
      lotQuantity,
      lotCommodity: DEMO_LOT.commodityName,
      lotVariety: DEMO_LOT.varietyName,
      lotGrade: DEMO_LOT.qualityGrade,
    };

    const eligibilityResults: EligibilityResult[] = [];
    const eligibleBuyerOpps: BuyerOpportunity[] = [];

    for (const buyer of DEMO_BUYERS) {
      const demand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === buyer.companyName);
      if (!demand) continue;

      const buyerData: BuyerEligibilityData = {
        buyerId: buyer.companyName.toLowerCase().replace(/\s/g, '-'),
        buyerName: buyer.companyName,
        demandCommodity: demand.commodityName,
        demandVariety: demand.varietyName,
        minQualityGrade: demand.minQualityGrade,
        minLotSize: demand.minLotSize,
        serviceRadiusKm: buyer.serviceRadiusKm,
        distanceKm: buyer.distanceFromFarmerKm,
      };

      const eligibility = this.rankingService.checkEligibility(lotEligibility, buyerData);
      eligibilityResults.push(eligibility);

      if (!eligibility.eligible) continue;

      const trust = this.trustService.calculate({
        completedTransactions: buyer.completedTransactions,
        successfulTransactions: Math.round(buyer.completedTransactions * 0.95),
        onTimePayments: Math.round(buyer.completedTransactions * buyer.paymentReliability / 100),
        disputes: Math.max(0, Math.round(buyer.completedTransactions * 0.03)),
        accountAgeDays: buyer.accountAgeDays,
        verificationLevel: buyer.verificationLevel,
      });

      const nrpInput: NRPInput = {
        salePricePaise: demand.offeredPricePaise,
        quantity: lotQuantity,
        distanceKm: buyer.distanceFromFarmerKm,
        channelType: ChannelType.BUYER,
        buyerProvidesPickup: buyer.providesPickup,
        commodityId: 'tomato',
        storageDays: 0,
      };

      eligibleBuyerOpps.push({
        type: ChannelType.BUYER as const,
        buyerId: buyer.companyName.toLowerCase().replace(/\s/g, '-'),
        buyerName: buyer.companyName,
        demandId: `demand-${buyer.companyName.toLowerCase().replace(/\s/g, '-')}`,
        offeredPricePaise: demand.offeredPricePaise,
        demandQuantity: demand.quantity,
        qualityMatch: demand.qualityMatchScore,
        trustScore: trust,
        distanceKm: buyer.distanceFromFarmerKm,
        deliveryWindow: `${demand.deliveryWindowStart} to ${demand.deliveryWindowEnd}`,
        providesPickup: buyer.providesPickup,
        nrp: this.nrpService.calculate(nrpInput),
      });
    }

    // 3. Rank
    const allOpps: Opportunity[] = [...marketOpps, ...eligibleBuyerOpps];
    const ranked = this.rankingService.rank(allOpps, lotQuantity);

    // 4. Baseline
    const nearestMarket = marketOpps.reduce((prev, curr) =>
      curr.distanceKm < prev.distanceKm ? curr : prev
    );

    const baseline = {
      type: 'NEAREST_MANDI_NRP',
      marketName: nearestMarket.marketName,
      nrpPerQtlPaise: nearestMarket.nrp.netRealisablePricePerQtlPaise,
      nrpTotalPaise: nearestMarket.nrp.netTotalValuePaise,
      distanceKm: nearestMarket.distanceKm,
    };

    return {
      lotId: 'demo-lot-ramesh-18qtl',
      lotSummary: {
        commodityName: DEMO_LOT.commodityName,
        varietyName: DEMO_LOT.varietyName,
        quantity: lotQuantity,
        qualityGrade: DEMO_LOT.qualityGrade,
      },
      ranked,
      ineligible: eligibilityResults.filter(e => !e.eligible),
      baseline,
      demoMode: true,
      dataProvenance: {
        source: 'CANONICAL_DEMO',
        refreshedAt: new Date().toISOString(),
        disclaimer: 'Deterministic canonical demonstration scenario',
      },
    };
  }

  /**
   * Recommendation explanation for a lot: "What should I do today?"
   */
  async getRecommendation(lotId: string) {
    const analysis = await this.analyzeForLot(lotId);
    const topOpportunity = analysis.ranked[0];

    const isDirectBuyer = topOpportunity.opportunity.type === ChannelType.BUYER;
    const opp = topOpportunity.opportunity;

    const oppName = isDirectBuyer 
      ? (opp as BuyerOpportunity).buyerName 
      : (opp as MarketOpportunity).marketName;

    const nrpPerQtl = opp.nrp.netRealisablePricePerQtlPaise;
    const baselineNrp = analysis.baseline ? analysis.baseline.nrpPerQtlPaise : nrpPerQtl;
    const advantagePerQtl = nrpPerQtl - baselineNrp;
    const totalAdvantage = advantagePerQtl * analysis.lotSummary.quantity;

    return {
      lotId,
      recommendedOpportunity: topOpportunity,
      headline: `Sell to ${oppName} for ₹${(nrpPerQtl / 100).toFixed(0)}/qtl net in-hand`,
      decisionRationale: [
        `Rank #1 with composite opportunity score of ${topOpportunity.score.toFixed(1)}/100`,
        `Expected net in-hand realization of ₹${(opp.nrp.netTotalValuePaise / 100).toLocaleString('en-IN')}`,
        advantagePerQtl > 0 
          ? `Generates +₹${(advantagePerQtl / 100).toFixed(0)}/qtl (+₹${(totalAdvantage / 100).toLocaleString('en-IN')}) more than ${analysis.baseline?.marketName}`
          : 'Highest realization among all accessible destinations',
        opp.nrp.costs.some(c => c.category === CostCategory.TRANSPORT && c.amountPerQtlPaise > 0) ? 'Optimized transport route' : 'Zero transport cost (buyer farmgate pickup included)',
        `Direct verified buyer settlement minimizes payment dispute risk`,
      ],
      aggregationAlert: {
        potentialGainPaise: 29700 * analysis.lotSummary.quantity,
        message: 'Pune FPO Collective has 2 neighbor lots available. Pooling freight unlocks institutional buyers at ₹3,200/qtl.',
      },
      actionSteps: [
        'Review transparent deduction breakdown',
        'Initiate negotiation or accept buyer contract',
        'Schedule digital dispatch / farmgate pickup note',
      ],
    };
  }

  /**
   * Buyer matches for a lot
   */
  async getBuyerMatches(lotId: string) {
    const analysis = await this.analyzeForLot(lotId);
    const buyerOpps = analysis.ranked.filter(
      r => r.opportunity.type === ChannelType.BUYER
    );

    return {
      lotId,
      matches: buyerOpps.map(b => {
        const opp = b.opportunity as BuyerOpportunity;
        return {
          buyerId: opp.buyerId,
          buyerName: opp.buyerName,
          demandId: opp.demandId,
          offeredPricePaise: opp.offeredPricePaise,
          nrpPaise: opp.nrp.netRealisablePricePerQtlPaise,
          trustScore: opp.trustScore,
          qualityMatchScore: opp.qualityMatch,
          score: b.score,
          providesPickup: opp.providesPickup,
          distanceKm: opp.distanceKm,
        };
      }),
      ineligible: analysis.ineligible,
    };
  }

  /**
   * FPO Aggregation opportunities
   */
  async getFpoAggregationOpportunities() {
    const talegaonPrice = DEMO_MARKET_PRICES.find(p => p.marketName === 'Talegaon Mandi')!;
    const freshmart = DEMO_BUYERS.find(b => b.companyName === 'FreshMart Foods')!;
    const freshmartDemand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === 'FreshMart Foods')!;
    const agriFresh = DEMO_BUYERS.find(b => b.companyName === 'AgriFresh Exports')!;
    const agriFreshDemand = DEMO_BUYER_DEMANDS.find(d => d.buyerCompanyName === 'AgriFresh Exports')!;

    const farmers = DEMO_FPO_FARMERS.map(f => ({
      farmerId: f.email,
      farmerName: f.name,
      quantity: f.lotQuantity,
      variety: f.variety,
      grade: f.grade,
      distanceToNearestMandiKm: 18,
      nearestMandiPricePaise: talegaonPrice.modalPricePaise,
    }));

    const result = calculateAggregation({
      commodityId: 'tomato',
      commodityName: 'Tomato',
      varietyId: 'hybrid',
      varietyName: 'Hybrid',
      targetVariety: 'Hybrid',
      targetGrade: 'A',
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
        minLotSize: freshmartDemand.minLotSize,
      },
      candidateBuyers: [
        {
          buyerName: agriFresh.companyName,
          minLotSize: agriFreshDemand.minLotSize,
          pricePaise: agriFreshDemand.offeredPricePaise,
          distanceKm: agriFresh.distanceFromFarmerKm,
          providesPickup: agriFresh.providesPickup,
        },
      ],
      config: DEMO_NRP_CONFIG,
    });

    const individualLots = result.eligibleFarmers.map(f => ({
      farmerName: f.farmerName,
      quantity: f.quantity,
    }));

    const demandUnlocked = result.totalQuantity >= agriFreshDemand.minLotSize &&
      !individualLots.some(f => f.quantity >= agriFreshDemand.minLotSize);

    return {
      fpoName: 'Pune FPO Collective',
      registrationNumber: 'MH-FPO-2024-001',
      totalFarmers: farmers.length,
      eligibleFarmers: result.eligibleFarmers,
      excludedFarmers: result.excludedFarmers,
      pooledQuantity: result.totalQuantity,
      buyerDemand: {
        demandId: 'demand-freshmart',
        buyerName: 'FreshMart Foods',
        quantity: freshmartDemand.quantity,
        pricePaise: freshmartDemand.offeredPricePaise,
      },
      minimumRequiredQuantity: agriFreshDemand.minLotSize,
      demandUnlocked,
      matchedBuyers: result.matchedBuyers,
      individualAverageNRP: result.individualAverageNRP,
      individualWeightedAvgNRPPaise: result.individualWeightedAvgNRPPaise,
      pooledNRP: result.pooledNRP,
      pooledNRPPaise: result.pooledNRPPaise,
      bulkAdvantage: result.bulkAdvantage,
      bulkAdvantagePaise: result.bulkAdvantagePaise,
      bulkAdvantagePercent: result.bulkAdvantagePercent,
      aggregation: result,
      bulkAdvantageRupeesPerQtl: result.estimatedBulkAdvantagePaise / 100,
      totalPledgedQuantity: result.totalQuantity,
      unlockedBuyer: 'AgriFresh Exports Ltd. (₹3,200/qtl offer)',
      demandUnlockExplanation: {
        beforePooling: {
          requiredMinimumQuantity: agriFreshDemand.minLotSize,
          individualFarmerLots: individualLots,
          summary: `No single farmer satisfies AgriFresh minimum requirement of ${agriFreshDemand.minLotSize} qtl (${individualLots.map(f => `${f.quantity} qtl`).join(', ')}).`,
        },
        afterPooling: {
          compatiblePooledQuantity: result.totalQuantity,
          summary: `AgriFresh demand unlocked through FPO aggregation (${result.totalQuantity} qtl >= ${agriFreshDemand.minLotSize} qtl).`,
        },
      },
    };
  }

  private estimateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const haversine = haversineDistance(lat1, lon1, lat2, lon2);
    return haversineToRoadDistance(haversine, this.configService.getRoadFactor());
  }
}
