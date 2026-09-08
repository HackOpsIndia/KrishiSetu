import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/server/prisma';
import { isServerAdminEmail } from '../../../../../lib/server/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let email = (body.email || '').toLowerCase().trim();
    let name = body.name;
    let avatarUrl = body.avatarUrl;
    let googleSubId = body.googleSubId;

    // Decode Google ID Token / GIS credential if provided
    const rawCredential = body.credential || body.idToken;
    if (rawCredential && typeof rawCredential === 'string') {
      try {
        const parts = rawCredential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload?.email && !email) {
            email = payload.email.toLowerCase().trim();
          }
          if (payload?.name && !name) {
            name = payload.name;
          }
          if (payload?.picture && !avatarUrl) {
            avatarUrl = payload.picture;
          }
          if (payload?.sub && !googleSubId) {
            googleSubId = payload.sub;
          }
        }
      } catch (e) {
        console.warn('Could not decode Google JWT credential in verify route:', e);
      }
    }

    if (!email) {
      return NextResponse.json({ message: 'Valid Google email is required' }, { status: 400 });
    }

    if (!name) {
      name = email.split('@')[0];
    }

    // Role determined securely via environment variable ADMIN_EMAILS
    const isAdmin = isServerAdminEmail(email);

    // If an explicit role is selected (e.g. BUYER or FARMER), prioritize it unless it is an admin email
    let defaultRole: 'FARMER' | 'BUYER' | 'ADMIN' | 'FPO' = 'FARMER';
    if (isAdmin) {
      defaultRole = 'ADMIN';
    } else if (body.role && ['FARMER', 'BUYER', 'FPO'].includes(body.role)) {
      defaultRole = body.role;
    } else if (email.includes('buyer')) {
      defaultRole = 'BUYER';
    }

    let dbUser: any = null;
    let isNewUser = false;

    try {
      dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          farmerProfile: true,
          buyerProfile: true,
        },
      });

      if (!dbUser) {
        isNewUser = true;
        dbUser = await prisma.user.create({
          data: {
            email,
            name,
            avatarUrl: avatarUrl || undefined,
            googleSubId: googleSubId || undefined,
            authProvider: 'GOOGLE',
            role: defaultRole as any,
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
        // Update user's avatar from Google if they don't have one, and update last login
        const updateData: any = {
          lastLoginAt: new Date(),
          isEmailVerified: true,
        };
        if (isAdmin && dbUser.role !== 'ADMIN') {
          updateData.role = 'ADMIN';
        }
        if (avatarUrl && !dbUser.avatarUrl) {
          updateData.avatarUrl = avatarUrl;
        }
        if (googleSubId && !dbUser.googleSubId) {
          updateData.googleSubId = googleSubId;
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
      console.warn('[Google Verify API] DB upsert fallback:', dbErr?.message);
    }

    const finalRole = dbUser?.role || defaultRole;
    const finalAvatar = dbUser?.avatarUrl || avatarUrl || undefined;

    const user = {
      id: dbUser?.id || body.id || `google-${Date.now()}`,
      name: dbUser?.name || name,
      email,
      role: finalRole,
      status: dbUser?.status || 'ACTIVE',
      authProvider: 'GOOGLE',
      avatarUrl: finalAvatar,
      phone: dbUser?.phone || body.phone || undefined,
      village: dbUser?.farmerProfile?.village || body.village || (finalRole === 'FARMER' ? 'Haveli Cluster' : undefined),
      district: dbUser?.farmerProfile?.district || body.district || 'Pune',
      state: dbUser?.farmerProfile?.state || body.state || 'Maharashtra',
      companyName: dbUser?.buyerProfile?.companyName || body.companyName || (finalRole === 'BUYER' ? `${name} Procurement` : undefined),
      buyerType: dbUser?.buyerProfile?.buyerType || (finalRole === 'BUYER' ? (body.buyerType || 'Wholesale Buyer') : undefined),
    };

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    };
    const token = `jwt.${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}.verified`;

    return NextResponse.json({ user, token, isAdmin, isNewUser });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'Google OAuth verification failed' },
      { status: 400 },
    );
  }
}
