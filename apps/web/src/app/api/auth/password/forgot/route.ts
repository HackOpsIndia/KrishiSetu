import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normEmail = (email || '').toLowerCase().trim();

    return NextResponse.json({
      success: true,
      message: `If an account exists for ${normEmail}, a password reset code has been sent.`,
      email: normEmail,
      demoOtp: '123456',
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'Failed to process forgot password request' },
      { status: 400 },
    );
  }
}
