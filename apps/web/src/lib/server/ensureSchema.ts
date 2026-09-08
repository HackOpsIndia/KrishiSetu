let isSchemaEnsured = false;
let isEnsuring = false;

// Standard Postgres DDL statements (NO custom DO blocks or ENUM types so PgBouncer transactions never abort)
const DDL_STATEMENTS = [
  // 1. Opportunity Records
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

  // 2. Users
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "googleSubId" TEXT UNIQUE,
    "authProvider" TEXT NOT NULL DEFAULT 'EMAIL',
    "role" TEXT NOT NULL DEFAULT 'FARMER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // 3. Farmer Profiles
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

  // 4. FPO Profiles
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

  // 5. FPO Farmers
  `CREATE TABLE IF NOT EXISTS "fpo_farmers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fpoId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // 6. Buyer Profiles
  `CREATE TABLE IF NOT EXISTS "buyer_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "companyName" TEXT NOT NULL,
    "buyerType" TEXT NOT NULL DEFAULT 'PROCESSOR',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "serviceRadiusKm" INTEGER NOT NULL DEFAULT 50,
    "providesPickup" BOOLEAN NOT NULL DEFAULT false,
    "verificationLevel" TEXT NOT NULL DEFAULT 'PROFILE_COMPLETE',
    "completedTransactions" INTEGER NOT NULL DEFAULT 0,
    "successfulTransactions" INTEGER NOT NULL DEFAULT 0,
    "onTimePayments" INTEGER NOT NULL DEFAULT 0,
    "disputes" INTEGER NOT NULL DEFAULT 0,
    "accountAgeDays" INTEGER NOT NULL DEFAULT 0,
    "paymentReliability" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // 7. Lots
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
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // 8. Markets
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

  // 9. Market Prices
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
    "priceTrend" TEXT NOT NULL DEFAULT 'STABLE',
    "dataOrigin" TEXT NOT NULL DEFAULT 'DEMO',
    "sourceTimestamp" TIMESTAMP(3),
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // 10. Transactions
  `CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lotId" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "farmerUserId" TEXT NOT NULL,
    "agreedPricePaise" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // 11. Transaction Events
  `CREATE TABLE IF NOT EXISTS "transaction_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
];

export async function ensureDatabaseSchema(prisma: any): Promise<void> {
  if (isSchemaEnsured || isEnsuring) return;
  isEnsuring = true;

  try {
    // Idempotently create tables
    for (const sql of DDL_STATEMENTS) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (stmtErr: any) {
        console.warn('[ensureDatabaseSchema] DDL warning:', stmtErr?.message);
      }
    }

    isSchemaEnsured = true;
  } catch (err: any) {
    console.error('[ensureDatabaseSchema] Error:', err?.message);
  } finally {
    isEnsuring = false;
  }
}

