import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/server/prisma';
import {
  DEMO_ACCOUNTS,
  DEMO_FARMER,
  DEMO_FPO,
  DEMO_COMMODITIES,
  DEMO_MARKETS,
  DEMO_MARKET_PRICES,
  DEMO_BUYERS,
  DEMO_BUYER_DEMANDS,
  DEMO_LOT,
  DEMO_NRP_CONFIG,
  DEMO_RANKING_WEIGHTS,
} from '@krishisetu/shared';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 1. Clean existing records safely
    await prisma.opportunityRecord.deleteMany({}).catch(() => null);
    await prisma.auditEvent.deleteMany({}).catch(() => null);
    await prisma.payment.deleteMany({}).catch(() => null);
    await prisma.logisticsBooking.deleteMany({}).catch(() => null);
    await prisma.transactionEvent.deleteMany({}).catch(() => null);
    await prisma.transaction.deleteMany({}).catch(() => null);
    await prisma.negotiationEvent.deleteMany({}).catch(() => null);
    await prisma.offer.deleteMany({}).catch(() => null);
    await prisma.buyerDemand.deleteMany({}).catch(() => null);
    await prisma.marketPrice.deleteMany({}).catch(() => null);
    await prisma.market.deleteMany({}).catch(() => null);
    await prisma.lot.deleteMany({}).catch(() => null);
    await prisma.fPOFarmer.deleteMany({}).catch(() => null);
    await prisma.fPOProfile.deleteMany({}).catch(() => null);
    await prisma.buyerProfile.deleteMany({}).catch(() => null);
    await prisma.farmerProfile.deleteMany({}).catch(() => null);
    await prisma.qualitySpecification.deleteMany({}).catch(() => null);
    await prisma.commodityVariety.deleteMany({}).catch(() => null);
    await prisma.commodity.deleteMany({}).catch(() => null);
    await prisma.user.deleteMany({}).catch(() => null);

    // 2. Users
    const farmerUser = await prisma.user.create({
      data: {
        email: DEMO_ACCOUNTS.farmer.email,
        name: DEMO_FARMER.name,
        phone: DEMO_FARMER.phone,
        role: 'FARMER',
      },
    });

    const buyerUser = await prisma.user.create({
      data: {
        email: DEMO_ACCOUNTS.buyer.email,
        name: 'FreshMart Procurement',
        role: 'BUYER',
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: DEMO_ACCOUNTS.admin.email,
        name: 'KrishiSetu Admin',
        role: 'ADMIN',
      },
    });

    const fpoUser = await prisma.user.create({
      data: {
        email: DEMO_ACCOUNTS.fpo.email,
        name: DEMO_FPO.name,
        role: 'FPO',
      },
    });

    // 3. Profiles
    const farmerProfile = await prisma.farmerProfile.create({
      data: {
        userId: farmerUser.id,
        village: DEMO_FARMER.village,
        district: DEMO_FARMER.district,
        state: DEMO_FARMER.state,
        latitude: DEMO_FARMER.location.latitude,
        longitude: DEMO_FARMER.location.longitude,
      },
    });

    const fpoProfile = await prisma.fPOProfile.create({
      data: {
        userId: fpoUser.id,
        organizationName: DEMO_FPO.name,
        registrationNumber: 'MH-FPO-2024-001',
        district: DEMO_FPO.district,
        state: DEMO_FPO.state,
        latitude: DEMO_FPO.location.latitude,
        longitude: DEMO_FPO.location.longitude,
      },
    });

    await prisma.fPOFarmer.create({
      data: {
        fpoId: fpoProfile.id,
        farmerId: farmerProfile.id,
      },
    });

    // 4. Lots
    const lot = await prisma.lot.create({
      data: {
        farmerId: farmerProfile.id,
        commodityName: DEMO_LOT.commodityName,
        varietyName: DEMO_LOT.varietyName,
        quantity: DEMO_LOT.quantity,
        harvestDate: new Date(DEMO_LOT.harvestDate),
        expectedSaleDate: new Date(DEMO_LOT.expectedSaleDate),
        qualityGrade: DEMO_LOT.qualityGrade,
        qualityParams: DEMO_LOT.qualityParams,
        minAcceptablePricePaise: DEMO_LOT.minAcceptablePricePaise,
        status: 'READY',
      },
    });

    // 5. Markets & Prices
    const marketMap: Record<string, string> = {};
    for (const m of DEMO_MARKETS) {
      const created = await prisma.market.create({
        data: {
          name: m.name,
          state: m.state,
          district: m.district,
          latitude: m.location.latitude,
          longitude: m.location.longitude,
          marketType: m.marketType,
        },
      });
      marketMap[m.name] = created.id;
    }

    for (const p of DEMO_MARKET_PRICES) {
      await prisma.marketPrice.create({
        data: {
          marketId: marketMap[p.marketName],
          commodityName: p.commodityName,
          varietyName: p.varietyName,
          date: new Date(p.date),
          minPricePaise: p.minPricePaise,
          maxPricePaise: p.maxPricePaise,
          modalPricePaise: p.modalPricePaise,
          arrivals: p.arrivals,
          priceTrend: p.priceTrend,
        },
      });
    }

    // 6. Buyers & Demands
    for (const b of DEMO_BUYERS) {
      const u = await prisma.user.create({
        data: {
          email: b.email,
          name: b.companyName,
          role: 'BUYER',
        },
      });

      const bp = await prisma.buyerProfile.create({
        data: {
          userId: u.id,
          companyName: b.companyName,
          buyerType: b.buyerType,
          latitude: b.location.latitude,
          longitude: b.location.longitude,
          serviceRadiusKm: b.serviceRadiusKm,
          providesPickup: b.providesPickup,
          verificationLevel: b.verificationLevel,
          completedTransactions: b.completedTransactions,
          paymentReliability: b.paymentReliability,
        },
      });

      const matchedDemands = DEMO_BUYER_DEMANDS.filter((d) => d.buyerCompanyName === b.companyName);
      for (const d of matchedDemands) {
        await prisma.buyerDemand.create({
          data: {
            buyerId: bp.id,
            commodityName: d.commodityName,
            varietyName: d.varietyName,
            quantity: d.quantity,
            minQualityGrade: d.minQualityGrade,
            offeredPricePaise: d.offeredPricePaise,
            priceLowPaise: d.priceLowPaise,
            priceHighPaise: d.priceHighPaise,
            deliveryWindowStart: new Date(d.deliveryWindowStart),
            deliveryWindowEnd: new Date(d.deliveryWindowEnd),
            minLotSize: d.minLotSize,
            qualityMatchScore: d.qualityMatchScore,
          },
        });
      }
    }

    // 7. Opportunity Records (Canonical Database Grounding)
    const canonicalOpportunities = [
      {
        id: 'freshmart',
        rank: 1,
        name: 'FreshMart Foods',
        channelType: 'DIRECT_BUYER',
        buyerType: 'Corporate Processor',
        location: 'Chakan Industrial Zone, Pune',
        distanceKm: 42,
        providesPickup: true,
        grossPricePaise: 296000,
        nrpPaise: 292500,
        totalRealizedPaise: 292500 * 18,
        totalDeductionsPaise: 3500,
        netMarginOverBaselinePaise: 292500 - 262200,
        trustScore: 0.90,
        paymentReliability: 0.95,
        verificationLevel: 'PLATFORM_VERIFIED',
        paymentTerm: 'Direct Bank Settlement (T+1 on Weighment)',
        deductions: {
          transportPaise: 0,
          loadingPaise: 2000,
          weighingPaise: 0,
          mandiFeePaise: 0,
          commissionPaise: 0,
          transitLossPaise: 1500,
        },
        recommendationReason:
          'Rank #1 Natural Choice: Direct farmgate pickup eliminates ₹22/km transport and APMC 5% fees. Delivers the highest net in-hand realization with platform-verified settlement.',
        isEligible: true,
      },
      {
        id: 'pune-apmc',
        rank: 2,
        name: 'Pune APMC (Gultekdi)',
        channelType: 'MANDI_APMC',
        location: 'Gultekdi Market Yard, Pune',
        distanceKm: 35,
        providesPickup: false,
        grossPricePaise: 310000,
        nrpPaise: 278700,
        totalRealizedPaise: 278700 * 18,
        totalDeductionsPaise: 31300,
        netMarginOverBaselinePaise: 278700 - 262200,
        trustScore: 0.85,
        paymentReliability: 0.88,
        verificationLevel: 'APMC_REGULATED',
        paymentTerm: 'Traditional Commission Agent (3-7 Day Credit)',
        deductions: {
          transportPaise: 7700,
          loadingPaise: 1500,
          weighingPaise: 500,
          mandiFeePaise: 3100,
          commissionPaise: 9300,
          transitLossPaise: 9200,
        },
        recommendationReason:
          'High gross price (₹3,100/qtl), but net realization drops to ₹2,787/qtl due to transit shrinkage, haulage, and market cess.',
        isEligible: true,
      },
      {
        id: 'pune-veggie',
        rank: 3,
        name: 'Pune Veggie Hub',
        channelType: 'DIRECT_BUYER',
        buyerType: 'Semi-Wholesaler',
        location: 'Hadapsar, Pune',
        distanceKm: 28,
        providesPickup: true,
        grossPricePaise: 280000,
        nrpPaise: 274600,
        totalRealizedPaise: 274600 * 18,
        totalDeductionsPaise: 5400,
        netMarginOverBaselinePaise: 274600 - 262200,
        trustScore: 0.82,
        paymentReliability: 0.85,
        verificationLevel: 'DOCUMENTS_SUBMITTED',
        paymentTerm: 'Direct Bank Transfer (T+2)',
        deductions: {
          transportPaise: 0,
          loadingPaise: 2500,
          weighingPaise: 0,
          mandiFeePaise: 0,
          commissionPaise: 0,
          transitLossPaise: 2900,
        },
        recommendationReason:
          'Convenient local pickup with prompt payment. Slightly lower gross offer than FreshMart.',
        isEligible: true,
      },
      {
        id: 'agrifresh',
        rank: 4,
        name: 'AgriFresh Exports Ltd.',
        channelType: 'DIRECT_BUYER',
        buyerType: 'Institutional Exporter',
        location: 'Nashik Cargo Hub',
        distanceKm: 165,
        providesPickup: false,
        grossPricePaise: 320000,
        nrpPaise: 295000,
        totalRealizedPaise: 0,
        totalDeductionsPaise: 25000,
        netMarginOverBaselinePaise: 32800,
        trustScore: 0.92,
        paymentReliability: 0.96,
        verificationLevel: 'PLATFORM_VERIFIED',
        paymentTerm: 'Direct Settlement (T+1 on Delivery)',
        deductions: {
          transportPaise: 16000,
          loadingPaise: 3000,
          weighingPaise: 0,
          mandiFeePaise: 0,
          commissionPaise: 0,
          transitLossPaise: 6000,
        },
        recommendationReason:
          'Highest gross price in Maharashtra (₹3,200/qtl). Ineligible for individual harvest lot (< 50 Qtl). Unlocks with FPO collective pooling.',
        isEligible: false,
        ineligibilityReason:
          'Minimum lot threshold is 50 Quintals. Your harvest lot is 18 Quintals. Pool with local cluster farmers to unlock this institutional contract.',
      },
    ];

    for (const opp of canonicalOpportunities) {
      await prisma.opportunityRecord.create({ data: opp });
    }

    // 8. Sample Confirmed Transaction
    await prisma.transaction.create({
      data: {
        lotId: lot.id,
        buyerUserId: buyerUser.id,
        farmerUserId: farmerUser.id,
        agreedPricePaise: 296000,
        quantity: 18,
        status: 'CONFIRMED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with rich demo market data, opportunities, lots, and buyers.',
      summary: {
        users: 4,
        opportunities: canonicalOpportunities.length,
        lots: 1,
        markets: DEMO_MARKETS.length,
        buyers: DEMO_BUYERS.length,
      },
    });
  } catch (err: any) {
    console.error('[API /api/admin/seed POST] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database seed failed' },
      { status: 500 },
    );
  }
}

