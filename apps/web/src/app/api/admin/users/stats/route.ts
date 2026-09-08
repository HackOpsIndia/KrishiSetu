import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: { role: true, status: true },
    });

    const stats = {
      totalUsers: users.length,
      farmers: users.filter((u) => u.role === 'FARMER').length,
      buyers: users.filter((u) => u.role === 'BUYER').length,
      fpos: users.filter((u) => u.role === 'FPO').length,
      admins: users.filter((u) => u.role === 'ADMIN').length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      suspended: users.filter((u) => u.status === 'SUSPENDED').length,
      pending: users.filter((u) => u.status === 'PENDING').length,
    };

    return NextResponse.json(stats);
  } catch (err: any) {
    console.error('[Admin Users Stats GET] Error:', err);
    return NextResponse.json({
      totalUsers: 0,
      farmers: 0,
      buyers: 0,
      fpos: 0,
      admins: 0,
      active: 0,
      suspended: 0,
      pending: 0,
    });
  }
}
