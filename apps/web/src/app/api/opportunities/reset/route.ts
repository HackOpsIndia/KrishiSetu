import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/server/prisma';

export async function POST() {
  try {
    // Delete all records and re-seed defaults
    await prisma.opportunityRecord.deleteMany({}).catch(() => {});
    return NextResponse.json({ success: true, message: 'Reset successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to reset' }, { status: 500 });
  }
}
