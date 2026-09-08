import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || 'meena.d@demo.in').toLowerCase().trim();
    const name = body.name || email.split('@')[0];
    const isAdmin = email === 'admin@demo.in' || email === 'admin@krishisetu.in';
    const isBuyer = email.includes('buyer') || email.includes('freshmart');
    const role = isAdmin ? 'ADMIN' : isBuyer ? 'BUYER' : 'FARMER';

    const user = {
      id: `google-${Date.now()}`,
      name,
      email,
      role,
      status: 'ACTIVE',
      authProvider: 'GOOGLE',
      avatarUrl:
        body.avatarUrl ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
      village: 'Haveli Cluster',
      district: 'Pune',
      state: 'Maharashtra',
    };

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    };
    const token = `jwt.${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}.verified`;

    return NextResponse.json({ user, token });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'Google OAuth verification failed' },
      { status: 400 },
    );
  }
}
