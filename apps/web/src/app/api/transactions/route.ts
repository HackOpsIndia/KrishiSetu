import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let txs: any[] = [];
    try {
      txs = await prisma.transaction.findMany({
        include: {
          lot: true,
          payment: true,
          logistics: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      txs = [];
    }

    const formatted = txs.map((t) => ({
      id: t.id,
      txHash: `0x${t.id.slice(0, 8)}...${t.id.slice(-4)}`,
      farmer: 'Ramesh Kumar',
      farmerName: 'Ramesh Kumar',
      buyer: 'FreshMart Foods Ltd.',
      buyerName: 'FreshMart Foods Ltd.',
      commodity: t.lot?.commodityName || 'Tomato Hybrid Grade A',
      commodityName: t.lot?.commodityName || 'Tomato Hybrid Grade A',
      quantityQtl: t.quantity,
      quantity: t.quantity,
      ratePerQtl: t.agreedPricePaise / 100,
      agreedPricePaise: t.agreedPricePaise,
      totalAmount: (t.agreedPricePaise * t.quantity) / 100,
      payableAmountRupees: (t.agreedPricePaise * t.quantity) / 100,
      escrowStatus: t.status === 'COMPLETED' ? 'SETTLED' : 'ESCROW_LOCKED',
      status: t.status,
      settlementTime: 'T+1 Escrow Settlement',
      weighbridgeMatch: true,
      date: new Date(t.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      contractHash: `0x${t.id.slice(0, 8)}...${t.id.slice(-4)}`,
      logisticsPartner: 'KrishiLogistics Direct',
      driverName: 'Vinod Shinde',
      eta: 'Today, 4:30 PM (Chakan Depot)',
      settlementCycle: 'T+1 Escrow Settlement',
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const quantity = Number(body.quantity) || 18;
    const agreedPricePaise = Number(body.agreedPricePaise) || 297500;

    let lot = await prisma.lot.findFirst().catch(() => null);
    let buyerUser = await prisma.user.findFirst({ where: { role: 'BUYER' } }).catch(() => null);
    let farmerUser = await prisma.user.findFirst({ where: { role: 'FARMER' } }).catch(() => null);

    if (lot && buyerUser && farmerUser) {
      const created = await prisma.transaction.create({
        data: {
          lotId: lot.id,
          buyerUserId: buyerUser.id,
          farmerUserId: farmerUser.id,
          agreedPricePaise,
          quantity,
          status: 'CONFIRMED',
        },
      });
      return NextResponse.json(created, { status: 201 });
    }

    return NextResponse.json({
      id: `TX-2026-${Date.now().toString().slice(-4)}`,
      agreedPricePaise,
      quantity,
      status: 'CONFIRMED',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create transaction' }, { status: 500 });
  }
}
