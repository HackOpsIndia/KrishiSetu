import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const steps: any[] = [];
  try {
    steps.push({ step: 'checking_table' });
    const check: any = await prisma.$queryRawUnsafe(
      `SELECT to_regclass('public.opportunity_records') AS table_exists;`
    );
    steps.push({ step: 'check_result', check });

    // Test a simple CREATE TABLE
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "opportunity_records" (
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
        );
      `);
      steps.push({ step: 'create_opportunity_records_success' });
    } catch (createErr: any) {
      steps.push({ step: 'create_opportunity_records_error', error: createErr?.message });
    }

    const count = await prisma.opportunityRecord.count().catch((e: any) => ({ error: e?.message }));
    steps.push({ step: 'opportunityRecord_count', count });

    return NextResponse.json({ success: true, steps });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message, steps }, { status: 500 });
  }
}
