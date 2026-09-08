import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || undefined;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;
    const provider = searchParams.get('provider') || undefined;

    const where: any = {};
    if (role && role !== 'ALL') where.role = role;
    if (status && status !== 'ALL') where.status = status;
    if (provider && provider !== 'ALL') where.authProvider = provider;

    let users = await prisma.user.findMany({
      where,
      include: {
        farmerProfile: true,
        buyerProfile: true,
        auditEvents: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (search) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          (u.phone && u.phone.includes(search)),
      );
    }

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || undefined,
      avatarUrl: u.avatarUrl || undefined,
      role: u.role,
      status: u.status,
      authProvider: u.authProvider,
      verificationStatus: u.verificationStatus,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      village: u.farmerProfile?.village || undefined,
      district: u.farmerProfile?.district || undefined,
      state: u.farmerProfile?.state || undefined,
      companyName: u.buyerProfile?.companyName || undefined,
      buyerType: u.buyerProfile?.buyerType || undefined,
      auditEvents: u.auditEvents || [],
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error('[Admin Users GET] Error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
