import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/server/prisma';

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
    const updated = await prisma.opportunityRecord.update({
      where: { id: params.id },
      data: body,
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
