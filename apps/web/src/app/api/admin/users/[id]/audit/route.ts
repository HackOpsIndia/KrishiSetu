import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const auditEvents = await prisma.auditEvent.findMany({
      where: {
        OR: [
          { userId: id },
          { entityId: id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(auditEvents);
  } catch (err: any) {
    console.error('[Admin User Audit GET] Error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
