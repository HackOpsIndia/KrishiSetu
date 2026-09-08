import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const grievances = await (prisma as any).grievance.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Resolve farmer and buyer names from User table
    const userIds = new Set<string>();
    for (const g of grievances) {
      if (g.farmerUserId) userIds.add(g.farmerUserId);
      if (g.buyerUserId) userIds.add(g.buyerUserId);
    }

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const formatted = grievances.map((g: any) => ({
      id: g.id,
      raisedBy: g.raisedBy,
      farmerName: userMap.get(g.farmerUserId)?.name || 'Unknown Farmer',
      buyerName: userMap.get(g.buyerUserId)?.name || 'Unknown Buyer',
      farmerUserId: g.farmerUserId,
      buyerUserId: g.buyerUserId,
      category: g.category,
      title: g.title,
      lotId: g.lotId || '',
      disputedAmount: g.disputedAmount / 100, // convert paise to rupees
      status: g.status,
      createdAt: new Date(g.createdAt).toISOString().split('T')[0],
      description: g.description,
      resolutionNote: g.resolutionNote || null,
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error('[Admin Grievances GET]', err?.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, resolutionNote } = body;

    if (!id) {
      return NextResponse.json({ error: 'Grievance ID required' }, { status: 400 });
    }

    const updated = await (prisma as any).grievance.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(resolutionNote && { resolutionNote }),
      },
    });

    return NextResponse.json({ success: true, grievance: updated });
  } catch (err: any) {
    console.error('[Admin Grievances PATCH]', err?.message);
    return NextResponse.json({ error: err?.message || 'Failed to update grievance' }, { status: 500 });
  }
}
