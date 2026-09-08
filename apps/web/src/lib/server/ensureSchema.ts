import { PrismaClient } from '@prisma/client';

let isSchemaEnsured = false;
let isEnsuring = false;

const DDL_STATEMENTS = [
  // Enums
  `DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('FARMER', 'FPO', 'BUYER', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "LoginProvider" AS ENUM ('EMAIL', 'GOOGLE', 'DEMO'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "BuyerType" AS ENUM ('TRADER', 'PROCESSOR', 'WHOLESALER', 'RETAILER', 'INSTITUTIONAL', 'EXPORTER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "VerificationLevel" AS ENUM ('PROFILE_COMPLETE', 'DOCUMENTS_SUBMITTED', 'PLATFORM_VERIFIED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "LotStatus" AS ENUM ('DRAFT', 'READY', 'MATCHED', 'OFFER_RECEIVED', 'NEGOTIATING', 'ACCEPTED', 'LOGISTICS_BOOKED', 'IN_TRANSIT', 'DELIVERED', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "PriceTrend" AS ENUM ('RISING', 'STABLE', 'FALLING'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "DataOrigin" AS ENUM ('DEMO', 'GOVERNMENT_SOURCE', 'MANUAL', 'PROVIDER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "OfferStatus" AS ENUM ('ACTIVE', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'EXPIRED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "NegotiationAction" AS ENUM ('OFFER', 'COUNTER', 'ACCEPT', 'REJECT', 'EXPIRE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "TransactionStatus" AS ENUM ('CONFIRMED', 'LOGISTICS_BOOKED', 'IN_TRANSIT', 'DELIVERED', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "AuthChallengePurpose" AS ENUM ('LOGIN', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'SENSITIVE_ACTION'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  // Core Tables
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "googleSubId" TEXT UNIQUE,
    "authProvider" TEXT NOT NULL DEFAULT 'EMAIL',
    "role" "UserRole" NOT NULL DEFAULT 'FARMER',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "farmer_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "preferredRadius" INTEGER NOT NULL DEFAULT 100,
    "preferredPayment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "fpo_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "organizationName" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "fpo_farmers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fpoId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "buyer_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "companyName" TEXT NOT NULL,
    "buyerType" "BuyerType" NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "serviceRadiusKm" INTEGER NOT NULL DEFAULT 50,
    "providesPickup" BOOLEAN NOT NULL DEFAULT false,
    "verificationLevel" "VerificationLevel" NOT NULL DEFAULT 'PROFILE_COMPLETE',
    "completedTransactions" INTEGER NOT NULL DEFAULT 0,
    "successfulTransactions" INTEGER NOT NULL DEFAULT 0,
    "onTimePayments" INTEGER NOT NULL DEFAULT 0,
    "disputes" INTEGER NOT NULL DEFAULT 0,
    "accountAgeDays" INTEGER NOT NULL DEFAULT 0,
    "paymentReliability" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "commodities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "category" TEXT NOT NULL,
    "defaultUnit" TEXT NOT NULL DEFAULT 'quintal',
    "mspPaise" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "commodity_varieties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commodityId" TEXT NOT NULL,
    "name" TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "lots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "commodityName" TEXT NOT NULL,
    "varietyName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'quintal',
    "harvestDate" TIMESTAMP(3),
    "expectedSaleDate" TIMESTAMP(3),
    "qualityGrade" TEXT NOT NULL,
    "qualityParams" JSONB,
    "minAcceptablePricePaise" INTEGER,
    "status" "LotStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "markets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "marketType" TEXT NOT NULL DEFAULT 'APMC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "market_prices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketId" TEXT NOT NULL,
    "commodityName" TEXT NOT NULL,
    "varietyName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "minPricePaise" INTEGER NOT NULL,
    "maxPricePaise" INTEGER NOT NULL,
    "modalPricePaise" INTEGER NOT NULL,
    "arrivals" INTEGER,
    "priceTrend" "PriceTrend" NOT NULL DEFAULT 'STABLE',
    "dataOrigin" "DataOrigin" NOT NULL DEFAULT 'DEMO',
    "sourceTimestamp" TIMESTAMP(3),
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "buyer_demands" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "commodityName" TEXT NOT NULL,
    "varietyName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "minQualityGrade" TEXT NOT NULL,
    "offeredPricePaise" INTEGER NOT NULL,
    "priceLowPaise" INTEGER NOT NULL,
    "priceHighPaise" INTEGER NOT NULL,
    "deliveryWindowStart" TIMESTAMP(3) NOT NULL,
    "deliveryWindowEnd" TIMESTAMP(3) NOT NULL,
    "minLotSize" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "qualityMatchScore" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "offers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lotId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "negotiation_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerId" TEXT NOT NULL,
    "action" "NegotiationAction" NOT NULL,
    "pricePaise" INTEGER,
    "actorId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lotId" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "farmerUserId" TEXT NOT NULL,
    "agreedPricePaise" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "transaction_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "fromStatus" "TransactionStatus" NOT NULL,
    "toStatus" "TransactionStatus" NOT NULL,
    "actorId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "opportunity_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "buyerType" TEXT,
    "location" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "providesPickup" BOOLEAN NOT NULL DEFAULT false,
    "grossPricePaise" INTEGER NOT NULL,
    "nrpPaise" INTEGER NOT NULL,
    "totalRealizedPaise" INTEGER NOT NULL,
    "totalDeductionsPaise" INTEGER NOT NULL,
    "netMarginOverBaselinePaise" INTEGER NOT NULL,
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "paymentReliability" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "verificationLevel" TEXT NOT NULL DEFAULT 'PLATFORM_VERIFIED',
    "paymentTerm" TEXT NOT NULL,
    "deductions" JSONB NOT NULL,
    "recommendationReason" TEXT NOT NULL,
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "ineligibilityReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
];

export async function ensureDatabaseSchema(prisma: any): Promise<void> {
  if (isSchemaEnsured || isEnsuring) return;
  isEnsuring = true;

  try {
    // Check if core table exists using information_schema (supported by Prisma queryRaw)
    const res: any[] = await prisma.$queryRawUnsafe(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'opportunity_records') AS table_exists;`
    );

    const exists = Boolean(res && res[0] && res[0].table_exists);

    if (!exists) {
      console.log('[ensureDatabaseSchema] Tables missing. Initializing database schema in Neon Postgres...');
      for (const sql of DDL_STATEMENTS) {
        try {
          await prisma.$executeRawUnsafe(sql);
        } catch (stmtErr: any) {
          console.warn('[ensureDatabaseSchema] DDL warning on statement:', stmtErr?.message);
        }
      }
      console.log('[ensureDatabaseSchema] Schema successfully created.');
    }

    // Now verify if initial data exists in database. If database is brand new and empty, seed initial records directly into DB
    const oppCount = await prisma.opportunityRecord.count().catch(() => 0);
    if (oppCount === 0) {
      console.log('[ensureDatabaseSchema] Database is empty. Seeding initial baseline data into Neon Postgres...');
      await seedInitialDatabaseData(prisma);
      console.log('[ensureDatabaseSchema] Initial data seeded successfully in database.');
    }

    isSchemaEnsured = true;
  } catch (err: any) {
    console.error('[ensureDatabaseSchema] Schema check/creation failed:', err?.message);
  } finally {
    isEnsuring = false;
  }
}

async function seedInitialDatabaseData(prisma: any) {
  // 1. Opportunities
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
        'Minimum lot threshold is 50 Quintals. Your harvest lot is 18 Quintals. Pool with local cluster farmers (Suresh & Meena) to unlock this institutional contract.',
    },
  ];

  for (const opp of canonicalOpportunities) {
    await prisma.opportunityRecord.upsert({
      where: { id: opp.id },
      create: opp,
      update: opp,
    }).catch((e: any) => console.warn('[seedInitialDatabaseData] opp insert warning:', e?.message));
  }

  // 2. Demo Users & Profiles
  const users = [
    { id: 'user-farmer-1', email: 'ramesh.kumar@gmail.com', name: 'Ramesh Kumar', role: 'FARMER' },
    { id: 'user-fpo-1', email: 'pune.fpo@gmail.com', name: 'Pune Farmers Collective', role: 'FPO' },
    { id: 'user-buyer-1', email: 'freshmart.procure@gmail.com', name: 'FreshMart Procurement', role: 'BUYER' },
    { id: 'user-admin-1', email: 'krishisetu.in@gmail.com', name: 'Platform Admin', role: 'ADMIN' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: u,
      update: {},
    }).catch(() => {});
  }

  // Farmer Profile
  await prisma.farmerProfile.upsert({
    where: { userId: 'user-farmer-1' },
    create: {
      id: 'profile-farmer-1',
      userId: 'user-farmer-1',
      village: 'Talegaon Dabhade',
      district: 'Pune',
      state: 'Maharashtra',
      latitude: 18.73,
      longitude: 73.68,
      preferredRadius: 50,
    },
    update: {},
  }).catch(() => {});

  // Demo Lot
  await prisma.lot.upsert({
    where: { id: 'lot-tomato-18' },
    create: {
      id: 'lot-tomato-18',
      farmerId: 'profile-farmer-1',
      commodityName: 'Tomato Hybrid',
      varietyName: 'Abhinav Hybrid',
      quantity: 18,
      unit: 'quintal',
      qualityGrade: 'Grade A',
      qualityParams: { firmness: 'Firm', colorCoverage: '85% Red', brix: 4.8 },
      status: 'READY',
      minAcceptablePricePaise: 270000,
    },
    update: {},
  }).catch(() => {});

  // Demo Markets
  const markets = [
    { id: 'market-talegaon', name: 'Talegaon Mandi', state: 'Maharashtra', district: 'Pune', latitude: 18.73, longitude: 73.68 },
    { id: 'market-pune', name: 'Pune APMC (Gultekdi)', state: 'Maharashtra', district: 'Pune', latitude: 18.49, longitude: 73.86 },
    { id: 'market-nashik', name: 'Pimpalgaon APMC', state: 'Maharashtra', district: 'Nashik', latitude: 20.17, longitude: 73.98 },
  ];

  for (const m of markets) {
    await prisma.market.upsert({
      where: { name: m.name },
      create: m,
      update: {},
    }).catch(() => {});
  }

  // Demo Market Prices
  const today = new Date();
  const prices = [
    { id: 'price-talegaon-tomato', marketId: 'market-talegaon', commodityName: 'Tomato Hybrid', varietyName: 'Abhinav Hybrid', date: today, minPricePaise: 260000, maxPricePaise: 310000, modalPricePaise: 290000, arrivals: 420 },
    { id: 'price-pune-tomato', marketId: 'market-pune', commodityName: 'Tomato Hybrid', varietyName: 'Abhinav Hybrid', date: today, minPricePaise: 280000, maxPricePaise: 330000, modalPricePaise: 310000, arrivals: 1250 },
    { id: 'price-nashik-tomato', marketId: 'market-nashik', commodityName: 'Tomato Hybrid', varietyName: 'Abhinav Hybrid', date: today, minPricePaise: 250000, maxPricePaise: 295000, modalPricePaise: 275000, arrivals: 890 },
  ];

  for (const p of prices) {
    await prisma.marketPrice.upsert({
      where: { id: p.id },
      create: p,
      update: {},
    }).catch(() => {});
  }
}
