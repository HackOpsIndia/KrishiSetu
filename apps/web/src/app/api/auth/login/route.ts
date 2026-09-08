import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normEmail = (email || '').toLowerCase().trim();

    const CANONICAL_USERS: Record<string, any> = {
      'ramesh@demo.in': {
        id: 'farmer-ramesh',
        name: 'Ramesh Kumar',
        email: 'ramesh@demo.in',
        role: 'FARMER',
        status: 'ACTIVE',
        authProvider: 'DEMO',
        phone: '+91 98765 43210',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        village: 'Dehu Road',
        district: 'Pune',
        state: 'Maharashtra',
      },
      'freshmart@demo.in': {
        id: 'buyer-freshmart',
        name: 'FreshMart Foods',
        email: 'freshmart@demo.in',
        role: 'BUYER',
        status: 'ACTIVE',
        authProvider: 'DEMO',
        phone: '+91 98220 55443',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
        companyName: 'FreshMart Foods Ltd.',
        buyerType: 'Corporate Processor',
        district: 'Pune',
        state: 'Maharashtra',
      },
      'admin@demo.in': {
        id: 'admin-krishi',
        name: 'KrishiSetu State Admin',
        email: 'admin@demo.in',
        role: 'ADMIN',
        status: 'ACTIVE',
        authProvider: 'DEMO',
        phone: '+91 91100 22334',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
        district: 'State Operations Hub',
        state: 'Maharashtra',
      },
      'fpo@demo.in': {
        id: 'fpo-pune',
        name: 'Pune FPO Collective',
        email: 'fpo@demo.in',
        role: 'FPO',
        status: 'ACTIVE',
        authProvider: 'DEMO',
        phone: '+91 98888 12345',
        district: 'Pune',
        state: 'Maharashtra',
      },
    };

    let user = CANONICAL_USERS[normEmail];
    if (!user) {
      const isAdmin = normEmail === 'admin@demo.in' || normEmail === 'admin@krishisetu.in';
      const isBuyer = normEmail.includes('buyer') || normEmail.includes('freshmart');
      const role = isAdmin ? 'ADMIN' : isBuyer ? 'BUYER' : 'FARMER';
      user = {
        id: `user-${Date.now()}`,
        name: normEmail.split('@')[0] || 'KrishiSetu User',
        email: normEmail,
        role,
        status: 'ACTIVE',
        authProvider: 'EMAIL',
        district: 'Pune',
        state: 'Maharashtra',
      };
    }

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
      { message: err?.message || 'Login failed' },
      { status: 400 },
    );
  }
}
