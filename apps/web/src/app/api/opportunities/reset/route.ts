import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await prisma.opportunityRecord.deleteMany({});
    return NextResponse.json({
      success: true,
      message: 'Reset successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to reset' }, { status: 500 });
  }
}
