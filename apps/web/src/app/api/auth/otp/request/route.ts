import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normEmail = (email || '').toLowerCase().trim();

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${normEmail}.`,
      email: normEmail,
      expiresInMinutes: 10,
      cooldownSeconds: 60,
      demoOtp: '123456',
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'Failed to dispatch OTP' },
      { status: 400 },
    );
  }
}
