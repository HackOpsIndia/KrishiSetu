import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== 'krishisetu-sync-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    postgresUrl: process.env.POSTGRES_URL,
    postgresPrismaUrl: process.env.POSTGRES_PRISMA_URL,
    postgresUrlNonPooling: process.env.POSTGRES_URL_NON_POOLING,
    databaseUrl: process.env.DATABASE_URL,
    databaseUrlUnpooled: process.env.DATABASE_URL_UNPOOLED,
  });
}
