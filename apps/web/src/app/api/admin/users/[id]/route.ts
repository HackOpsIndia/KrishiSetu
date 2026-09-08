import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        farmerProfile: true,
        buyerProfile: true,
        auditEvents: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error('[Admin User Detail GET] Error:', err);
    return NextResponse.json({ message: err?.message || 'Failed to fetch user' }, { status: 500 });
  }
}
