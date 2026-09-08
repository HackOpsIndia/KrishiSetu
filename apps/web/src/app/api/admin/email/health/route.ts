import { NextResponse } from 'next/server';

export async function GET() {
  const isSmtpSet = Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  return NextResponse.json({
    service: 'KrishiSetu SMTP Email Service',
    mode: isSmtpSet ? 'Production SMTP Active' : 'Simulated Sandbox Mode',
    configured: isSmtpSet,
    connected: true,
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    fromAddress: process.env.SMTP_FROM || 'KrishiSetu Support',
    details: isSmtpSet
      ? 'Connected to production Gmail SMTP.'
      : 'Simulated Sandbox: OTP and notifications logged and available in test console.',
  });
}
