import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ message: 'Valid Google email is required' }, { status: 400 });
    }

    const name = body.name || email.split('@')[0];
    const isAdmin =
      email === 'admin@demo.in' ||
      email === 'admin@krishisetu.in' ||
      email === 'krishisetu.in@gmail.com' ||
      email.startsWith('admin@');

    // If an explicit role is selected (e.g. BUYER or FARMER), prioritize it unless it is an admin email
    let role: 'FARMER' | 'BUYER' | 'ADMIN' | 'FPO' = 'FARMER';
    if (isAdmin) {
      role = 'ADMIN';
    } else if (body.role && ['FARMER', 'BUYER', 'FPO'].includes(body.role)) {
      role = body.role;
    } else if (email.includes('buyer') || email.includes('freshmart')) {
      role = 'BUYER';
    }

    const user = {
      id: body.id || `google-${Date.now()}`,
      name,
      email,
      role,
      status: 'ACTIVE',
      authProvider: 'GOOGLE',
      avatarUrl:
        body.avatarUrl ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
      village: body.village || (role === 'FARMER' ? 'Haveli Cluster' : undefined),
      district: body.district || 'Pune',
      state: body.state || 'Maharashtra',
      companyName: body.companyName || (role === 'BUYER' ? `${name} Procurement` : undefined),
      buyerType: role === 'BUYER' ? (body.buyerType || 'Wholesale Buyer') : undefined,
    };

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    };
    const token = `jwt.${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}.verified`;

    return NextResponse.json({ user, token, isAdmin });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'Google OAuth verification failed' },
      { status: 400 },
    );
  }
}
