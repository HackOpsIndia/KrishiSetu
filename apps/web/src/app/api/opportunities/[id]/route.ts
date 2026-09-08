import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

// GET /api/opportunities/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const opp = await prisma.opportunityRecord.findUnique({
      where: { id: params.id },
    });
    if (!opp) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }
    return NextResponse.json(opp);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

// PUT /api/opportunities/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();

    const data: any = { ...body };
    if (data.grossPricePaise !== undefined) data.grossPricePaise = Math.round(Number(data.grossPricePaise));
    if (data.nrpPaise !== undefined) data.nrpPaise = Math.round(Number(data.nrpPaise));
    if (data.totalRealizedPaise !== undefined) data.totalRealizedPaise = Math.round(Number(data.totalRealizedPaise));
    if (data.totalDeductionsPaise !== undefined) data.totalDeductionsPaise = Math.round(Number(data.totalDeductionsPaise));
    if (data.netMarginOverBaselinePaise !== undefined) data.netMarginOverBaselinePaise = Math.round(Number(data.netMarginOverBaselinePaise));
    if (data.rank !== undefined) data.rank = Math.round(Number(data.rank));
    if (data.distanceKm !== undefined) data.distanceKm = Number(data.distanceKm);
    if (data.trustScore !== undefined) data.trustScore = Number(data.trustScore);
    if (data.paymentReliability !== undefined) data.paymentReliability = Number(data.paymentReliability);

    const updated = await prisma.opportunityRecord.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/opportunities/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.opportunityRecord.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete' }, { status: 500 });
  }
}
