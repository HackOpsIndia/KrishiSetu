import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/server/prisma';

// GET /api/opportunities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelType = searchParams.get('channelType') || undefined;
    const isEligibleParam = searchParams.get('isEligible');
    const isEligible = isEligibleParam !== null ? isEligibleParam === 'true' : undefined;
    const search = searchParams.get('search')?.toLowerCase() || undefined;

    const where: any = {};
    if (channelType) where.channelType = channelType;
    if (typeof isEligible === 'boolean') where.isEligible = isEligible;

    let records: any[] = [];
    try {
      records = await prisma.opportunityRecord.findMany({
        where,
        orderBy: { rank: 'asc' },
      });
    } catch (dbErr) {
      console.warn('[API /api/opportunities GET] DB query fallback:', dbErr);
      records = [];
    }

    if (search && records.length > 0) {
      records = records.filter(
        (r) =>
          r.name?.toLowerCase().includes(search) ||
          r.location?.toLowerCase().includes(search) ||
          r.buyerType?.toLowerCase().includes(search),
      );
    }

    return NextResponse.json(records);
  } catch (err: any) {
    console.error('[API /api/opportunities GET] Error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/opportunities (Admin CRUD)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.grossPricePaise) {
      return NextResponse.json(
        { error: 'Opportunity name and grossPricePaise are required.' },
        { status: 400 },
      );
    }

    const gross = Number(body.grossPricePaise) || 0;
    const deductions = body.deductions || {
      transportPaise: 0,
      loadingPaise: 2000,
      weighingPaise: 0,
      mandiFeePaise: 0,
      commissionPaise: 0,
      transitLossPaise: 1500,
    };
    const totalDeductions =
      (Number(deductions.transportPaise) || 0) +
      (Number(deductions.loadingPaise) || 0) +
      (Number(deductions.weighingPaise) || 0) +
      (Number(deductions.mandiFeePaise) || 0) +
      (Number(deductions.commissionPaise) || 0) +
      (Number(deductions.transitLossPaise) || 0);

    const nrp = gross - totalDeductions;
    const count = await prisma.opportunityRecord.count().catch(() => 0);

    const created = await prisma.opportunityRecord.create({
      data: {
        rank: count + 1,
        name: body.name,
        channelType: body.channelType || 'DIRECT_BUYER',
        buyerType: body.buyerType || 'Agri Processor',
        location: body.location || 'Pune Cluster',
        distanceKm: Number(body.distanceKm) || 30,
        providesPickup: Boolean(body.providesPickup),
        grossPricePaise: gross,
        nrpPaise: nrp,
        totalRealizedPaise: nrp * 18,
        totalDeductionsPaise: totalDeductions,
        netMarginOverBaselinePaise: nrp - 262200,
        trustScore: Number(body.trustScore) || 0.9,
        paymentReliability: Number(body.paymentReliability) || 0.95,
        verificationLevel: body.verificationLevel || 'PLATFORM_VERIFIED',
        paymentTerm: body.paymentTerm || 'Direct Bank Settlement (T+1)',
        deductions: deductions,
        recommendationReason:
          body.recommendationReason ||
          `Direct opportunity at ₹${(gross / 100).toLocaleString('en-IN')}/qtl`,
        isEligible: body.isEligible !== undefined ? Boolean(body.isEligible) : true,
        ineligibilityReason: body.ineligibilityReason || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('[API /api/opportunities POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to create opportunity' },
      { status: 500 },
    );
  }
}
