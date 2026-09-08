import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

function getUserIdFromRequest(req: NextRequest): { userId?: string; email?: string } {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        return { userId: payload.sub, email: payload.email };
      }
    } catch { }
  }
  const { searchParams } = new URL(req.url);
  const queryUserId = searchParams.get('userId') || undefined;
  const queryEmail = searchParams.get('email') || undefined;
  return { userId: queryUserId, email: queryEmail };
}

// GET /api/user/profile
export async function GET(req: NextRequest) {
  try {
    const { userId, email } = getUserIdFromRequest(req);

    if (!userId && !email) {
      return NextResponse.json({ message: 'User identification required' }, { status: 400 });
    }

    const where = userId ? { id: userId } : { email: email?.toLowerCase().trim() };

    const dbUser = await prisma.user.findUnique({
      where: where as any,
      include: {
        farmerProfile: true,
        buyerProfile: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const profile = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      status: dbUser.status,
      authProvider: dbUser.authProvider,
      phone: dbUser.phone || undefined,
      avatarUrl: dbUser.avatarUrl || undefined,
      village: dbUser.farmerProfile?.village || undefined,
      district: dbUser.farmerProfile?.district || 'Pune',
      state: dbUser.farmerProfile?.state || 'Maharashtra',
      companyName: dbUser.buyerProfile?.companyName || undefined,
      buyerType: dbUser.buyerProfile?.buyerType || undefined,
      createdAt: dbUser.createdAt,
    };

    return NextResponse.json({ user: profile });
  } catch (err: any) {
    console.error('[User Profile GET] Error:', err);
    return NextResponse.json({ message: err?.message || 'Failed to retrieve profile' }, { status: 500 });
  }
}

// PUT /api/user/profile
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId: reqUserId, email: reqEmail } = getUserIdFromRequest(req);
    const targetUserId = body.id || reqUserId;
    const targetEmail = (body.email || reqEmail || '').toLowerCase().trim();

    if (!targetUserId && !targetEmail) {
      return NextResponse.json({ message: 'User identification required' }, { status: 400 });
    }

    // Identify user
    const where = targetUserId ? { id: targetUserId } : { email: targetEmail };
    let existing = await prisma.user.findUnique({
      where: where as any,
      include: { farmerProfile: true, buyerProfile: true },
    });

    if (!existing) {
      // If user not found by ID, try finding by email
      if (targetEmail) {
        existing = await prisma.user.findUnique({
          where: { email: targetEmail },
          include: { farmerProfile: true, buyerProfile: true },
        });
      }
    }

    if (!existing) {
      return NextResponse.json({ message: 'User not found to update' }, { status: 404 });
    }

    // Role switching validation: regular users can only switch between FARMER and BUYER
    const updates: any = {};
    if (body.name) updates.name = body.name.trim();
    if (body.phone !== undefined) updates.phone = body.phone ? body.phone.trim() : null;
    if (body.avatarUrl) updates.avatarUrl = body.avatarUrl;

    if (body.role && ['FARMER', 'BUYER'].includes(body.role)) {
      // Users can self-switch between Seller (FARMER) and BUYER
      updates.role = body.role;
    } else if (body.role && existing.role === 'ADMIN' && body.role === 'ADMIN') {
      // Keep admin
      updates.role = 'ADMIN';
    }

    // Update base user
    const updatedUser = await prisma.user.update({
      where: { id: existing.id },
      data: updates,
    });

    // Update Farmer Profile if applicable
    if (body.village || body.district || body.state) {
      try {
        await prisma.farmerProfile.upsert({
          where: { userId: existing.id },
          create: {
            userId: existing.id,
            village: body.village || 'Pune Rural',
            district: body.district || 'Pune',
            state: body.state || 'Maharashtra',
          },
          update: {
            village: body.village || undefined,
            district: body.district || undefined,
            state: body.state || undefined,
          },
        });
      } catch (fErr: any) {
        console.warn('[User Profile PUT] Farmer profile upsert warning:', fErr?.message);
      }
    }

    // Update Buyer Profile if applicable
    if (body.companyName || body.buyerType) {
      try {
        const rawType = (body.buyerType || '').toUpperCase();
        let validBuyerType: 'TRADER' | 'PROCESSOR' | 'WHOLESALER' | 'RETAILER' | 'INSTITUTIONAL' | 'EXPORTER' = 'PROCESSOR';
        if (rawType.includes('WHOLESALE')) validBuyerType = 'WHOLESALER';
        else if (rawType.includes('RETAIL')) validBuyerType = 'RETAILER';
        else if (rawType.includes('EXPORT')) validBuyerType = 'EXPORTER';
        else if (rawType.includes('INSTITUT')) validBuyerType = 'INSTITUTIONAL';
        else if (rawType.includes('TRADE')) validBuyerType = 'TRADER';

        await prisma.buyerProfile.upsert({
          where: { userId: existing.id },
          create: {
            userId: existing.id,
            companyName: body.companyName || `${updatedUser.name} Procurement`,
            buyerType: validBuyerType,
          },
          update: {
            companyName: body.companyName || undefined,
            buyerType: validBuyerType,
          },
        });
      } catch (bErr: any) {
        console.warn('[User Profile PUT] Buyer profile upsert warning:', bErr?.message);
      }
    }

    // Reload with profiles
    const finalUser = await prisma.user.findUnique({
      where: { id: existing.id },
      include: { farmerProfile: true, buyerProfile: true },
    });

    const profile = {
      id: finalUser!.id,
      name: finalUser!.name,
      email: finalUser!.email,
      role: finalUser!.role,
      status: finalUser!.status,
      authProvider: finalUser!.authProvider,
      phone: finalUser!.phone || undefined,
      avatarUrl: finalUser!.avatarUrl || undefined,
      village: finalUser!.farmerProfile?.village || undefined,
      district: finalUser!.farmerProfile?.district || 'Pune',
      state: finalUser!.farmerProfile?.state || 'Maharashtra',
      companyName: finalUser!.buyerProfile?.companyName || undefined,
      buyerType: finalUser!.buyerProfile?.buyerType || undefined,
    };

    return NextResponse.json({ success: true, user: profile });
  } catch (err: any) {
    console.error('[User Profile PUT] Error:', err);
    return NextResponse.json({ message: err?.message || 'Failed to update profile' }, { status: 500 });
  }
}
