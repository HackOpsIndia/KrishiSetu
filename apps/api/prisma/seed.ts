// ============================================================
// KrishiSetu — Database Seed Script
// Seeds the canonical demo scenario from the SINGLE source of truth.
// Run: npx ts-node prisma/seed.ts
// ============================================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {
  DEMO_ACCOUNTS,
  DEMO_FARMER,
  DEMO_FPO,
  DEMO_FPO_FARMERS,
  DEMO_COMMODITIES,
  DEMO_MARKETS,
  DEMO_MARKET_PRICES,
  DEMO_BUYERS,
  DEMO_BUYER_DEMANDS,
  DEMO_LOT,
  DEMO_NEGOTIATION,
  DEMO_NRP_CONFIG,
  DEMO_RANKING_WEIGHTS,
} from '@krishisetu/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KrishiSetu demo data...\n');

  // --- Clean existing data ---
  await prisma.auditEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.logisticsBooking.deleteMany();
  await prisma.transactionEvent.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.negotiationEvent.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.buyerDemand.deleteMany();
  await prisma.marketPrice.deleteMany();
  await prisma.market.deleteMany();
  await prisma.lot.deleteMany();
  await prisma.fPOFarmer.deleteMany();
  await prisma.fPOProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.qualitySpecification.deleteMany();
  await prisma.commodityVariety.deleteMany();
  await prisma.commodity.deleteMany();
  await prisma.platformConfig.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✓ Cleaned existing data');

  // --- Platform Config ---
  await prisma.platformConfig.create({
    data: { key: 'nrp_config', value: DEMO_NRP_CONFIG as any },
  });
  await prisma.platformConfig.create({
    data: { key: 'ranking_weights', value: DEMO_RANKING_WEIGHTS as any },
  });
  console.log('  ✓ Platform config seeded');

  // --- Users ---
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const farmerUser = await prisma.user.create({
    data: {
      email: DEMO_ACCOUNTS.farmer.email,
      passwordHash,
      name: DEMO_FARMER.name,
      phone: DEMO_FARMER.phone,
      role: 'FARMER',
    },
  });

  const fpoUser = await prisma.user.create({
    data: {
      email: DEMO_ACCOUNTS.fpo.email,
      passwordHash,
      name: DEMO_FPO.name,
      role: 'FPO',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: DEMO_ACCOUNTS.admin.email,
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('  ✓ Users created');

  // --- Farmer Profile ---
  const farmerProfile = await prisma.farmerProfile.create({
    data: {
      userId: farmerUser.id,
      village: DEMO_FARMER.village,
      district: DEMO_FARMER.district,
      state: DEMO_FARMER.state,
      latitude: DEMO_FARMER.location.latitude,
      longitude: DEMO_FARMER.location.longitude,
      preferredRadius: DEMO_FARMER.preferredRadiusKm,
      preferredPayment: DEMO_FARMER.preferredPayment,
    },
  });

  // --- FPO Profile ---
  const fpoProfile = await prisma.fPOProfile.create({
    data: {
      userId: fpoUser.id,
      organizationName: DEMO_FPO.name,
      registrationNumber: DEMO_FPO.registrationNumber,
      district: DEMO_FPO.district,
      state: DEMO_FPO.state,
      latitude: DEMO_FPO.location.latitude,
      longitude: DEMO_FPO.location.longitude,
    },
  });

  // --- FPO Farmers ---
  const fpoFarmerProfiles = [];
  for (const fpoFarmer of DEMO_FPO_FARMERS) {
    const user = await prisma.user.create({
      data: {
        email: fpoFarmer.email,
        passwordHash,
        name: fpoFarmer.name,
        role: 'FARMER',
      },
    });

    const profile = await prisma.farmerProfile.create({
      data: {
        userId: user.id,
        village: fpoFarmer.village,
        district: 'Pune',
        state: 'Maharashtra',
        latitude: fpoFarmer.location.latitude,
        longitude: fpoFarmer.location.longitude,
      },
    });

    await prisma.fPOFarmer.create({
      data: {
        fpoId: fpoProfile.id,
        farmerId: profile.id,
      },
    });

    fpoFarmerProfiles.push({ ...fpoFarmer, profile });
  }
  console.log('  ✓ Farmer and FPO profiles created');

  // --- Buyers ---
  const buyerProfiles: Record<string, any> = {};
  for (const buyer of DEMO_BUYERS) {
    const user = await prisma.user.create({
      data: {
        email: buyer.email,
        passwordHash,
        name: buyer.companyName,
        role: 'BUYER',
      },
    });

    const profile = await prisma.buyerProfile.create({
      data: {
        userId: user.id,
        companyName: buyer.companyName,
        buyerType: buyer.buyerType,
        latitude: buyer.location.latitude,
        longitude: buyer.location.longitude,
        serviceRadiusKm: buyer.serviceRadiusKm,
        providesPickup: buyer.providesPickup,
        verificationLevel: buyer.verificationLevel,
        completedTransactions: buyer.completedTransactions,
        successfulTransactions: Math.round(buyer.completedTransactions * 0.95),
        onTimePayments: Math.round(buyer.completedTransactions * buyer.paymentReliability / 100),
        disputes: Math.max(0, Math.round(buyer.completedTransactions * 0.03)),
        accountAgeDays: buyer.accountAgeDays,
        paymentReliability: buyer.paymentReliability,
      },
    });

    buyerProfiles[buyer.companyName] = { user, profile };
  }
  console.log('  ✓ Buyer profiles created');

  // --- Commodities ---
  for (const commodity of DEMO_COMMODITIES) {
    const created = await prisma.commodity.create({
      data: {
        name: commodity.name,
        category: commodity.category,
        defaultUnit: commodity.defaultUnit,
        mspPaise: commodity.mspPaise,
      },
    });

    for (const variety of commodity.varieties) {
      await prisma.commodityVariety.create({
        data: {
          commodityId: created.id,
          name: variety.name,
        },
      });
    }

    for (const spec of commodity.qualitySpecs) {
      await prisma.qualitySpecification.create({
        data: {
          commodityId: created.id,
          parameterName: spec.parameterName,
          dataType: spec.dataType,
          unit: spec.unit,
          options: spec.options || [],
          minValue: (spec as any).min,
          maxValue: (spec as any).max,
        },
      });
    }
  }
  console.log('  ✓ Commodities seeded');

  // --- Markets ---
  const marketMap: Record<string, string> = {};
  for (const market of DEMO_MARKETS) {
    const created = await prisma.market.create({
      data: {
        name: market.name,
        state: market.state,
        district: market.district,
        latitude: market.location.latitude,
        longitude: market.location.longitude,
        marketType: market.marketType,
      },
    });
    marketMap[market.name] = created.id;
  }

  // --- Market Prices ---
  for (const price of DEMO_MARKET_PRICES) {
    await prisma.marketPrice.create({
      data: {
        marketId: marketMap[price.marketName],
        commodityName: price.commodityName,
        varietyName: price.varietyName,
        date: new Date(price.date),
        minPricePaise: price.minPricePaise,
        maxPricePaise: price.maxPricePaise,
        modalPricePaise: price.modalPricePaise,
        arrivals: price.arrivals,
        priceTrend: price.priceTrend,
        dataOrigin: price.dataOrigin,
        sourceTimestamp: new Date(price.date),
      },
    });
  }
  console.log('  ✓ Markets and prices seeded');

  // --- Buyer Demands ---
  for (const demand of DEMO_BUYER_DEMANDS) {
    const buyerData = buyerProfiles[demand.buyerCompanyName];
    if (!buyerData) continue;

    await prisma.buyerDemand.create({
      data: {
        buyerId: buyerData.profile.id,
        commodityName: demand.commodityName,
        varietyName: demand.varietyName,
        quantity: demand.quantity,
        minQualityGrade: demand.minQualityGrade,
        offeredPricePaise: demand.offeredPricePaise,
        priceLowPaise: demand.priceLowPaise,
        priceHighPaise: demand.priceHighPaise,
        deliveryWindowStart: new Date(demand.deliveryWindowStart),
        deliveryWindowEnd: new Date(demand.deliveryWindowEnd),
        minLotSize: demand.minLotSize,
        qualityMatchScore: demand.qualityMatchScore,
      },
    });
  }
  console.log('  ✓ Buyer demands seeded');

  // --- Demo Lot (Ramesh's lot) ---
  const lot = await prisma.lot.create({
    data: {
      farmerId: farmerProfile.id,
      commodityName: DEMO_LOT.commodityName,
      varietyName: DEMO_LOT.varietyName,
      quantity: DEMO_LOT.quantity,
      qualityGrade: DEMO_LOT.qualityGrade,
      qualityParams: DEMO_LOT.qualityParams,
      harvestDate: new Date(DEMO_LOT.harvestDate),
      expectedSaleDate: new Date(DEMO_LOT.expectedSaleDate),
      minAcceptablePricePaise: DEMO_LOT.minAcceptablePricePaise,
      status: 'READY',
    },
  });
  console.log('  ✓ Demo lot created');

  // --- Audit ---
  await prisma.auditEvent.create({
    data: {
      userId: adminUser.id,
      action: 'SEED',
      entityType: 'SYSTEM',
      details: { seededAt: new Date().toISOString(), version: '1.0.0' },
    },
  });

  console.log('\n🌾 Demo seed complete!');
  console.log(`   Farmer: ${DEMO_ACCOUNTS.farmer.email} / ${DEMO_ACCOUNTS.farmer.password}`);
  console.log(`   FPO:    ${DEMO_ACCOUNTS.fpo.email} / ${DEMO_ACCOUNTS.fpo.password}`);
  console.log(`   Buyer:  ${DEMO_ACCOUNTS.buyer.email} / ${DEMO_ACCOUNTS.buyer.password}`);
  console.log(`   Admin:  ${DEMO_ACCOUNTS.admin.email} / ${DEMO_ACCOUNTS.admin.password}`);
  console.log(`   Lot ID: ${lot.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
