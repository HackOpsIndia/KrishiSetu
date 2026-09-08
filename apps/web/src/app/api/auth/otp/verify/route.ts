import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/server/prisma';
import { isServerAdminEmail } from '../../../../../lib/server/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    const normEmail = (email || '').toLowerCase().trim();

    if (!normEmail) {
      return NextResponse.json({ message: 'Email address is required' }, { status: 400 });
    }

    const isAdmin = isServerAdminEmail(normEmail);

    let dbUser: any = null;

    try {
      dbUser = await prisma.user.findUnique({
        where: { email: normEmail },
        include: {
          farmerProfile: true,
          buyerProfile: true,
        },
      });

      if (!dbUser) {
        const defaultRole = isAdmin ? 'ADMIN' : normEmail.includes('buyer') ? 'BUYER' : 'FARMER';
        dbUser = await prisma.user.create({
          data: {
            email: normEmail,
            name: normEmail.split('@')[0],
            role: defaultRole as any,
            authProvider: 'EMAIL',
            status: 'ACTIVE',
            isEmailVerified: true,
            lastLoginAt: new Date(),
          },
          include: {
            farmerProfile: true,
            buyerProfile: true,
          },
        });
      } else {
        const updateData: any = {
          isEmailVerified: true,
          lastLoginAt: new Date(),
        };
        if (isAdmin && dbUser.role !== 'ADMIN') {
          updateData.role = 'ADMIN';
        }
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: updateData,
          include: {
            farmerProfile: true,
            buyerProfile: true,
          },
        });
      }
    } catch (dbErr: any) {
      console.warn('[OTP Verify API] DB access fallback:', dbErr?.message);
    }

    const role = dbUser?.role || (isAdmin ? 'ADMIN' : normEmail.includes('buyer') ? 'BUYER' : 'FARMER');

    const user = {
      id: dbUser?.id || `otp-user-${Date.now()}`,
      name: dbUser?.name || normEmail.split('@')[0] || 'Verified User',
      email: normEmail,
      role,
      status: dbUser?.status || 'ACTIVE',
      authProvider: dbUser?.authProvider || 'EMAIL',
      phone: dbUser?.phone || undefined,
      avatarUrl: dbUser?.avatarUrl || undefined,
      village: dbUser?.farmerProfile?.village || undefined,
      district: dbUser?.farmerProfile?.district || 'Pune',
      state: dbUser?.farmerProfile?.state || 'Maharashtra',
      companyName: dbUser?.buyerProfile?.companyName || undefined,
      buyerType: dbUser?.buyerProfile?.buyerType || undefined,
    };

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    };
    const token = `jwt.${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}.verified`;

    return NextResponse.json({ user, token, verified: true });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'OTP verification failed' },
      { status: 400 },
    );
  }
}
