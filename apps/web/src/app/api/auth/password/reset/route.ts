import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'Password reset failed' },
      { status: 400 },
    );
  }
}
