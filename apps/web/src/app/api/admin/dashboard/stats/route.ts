import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // User counts by role
    const [farmerCount, buyerCount, fpoCount, adminCount, totalUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.user.count({ where: { role: 'FPO' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count(),
    ]);

    // Lot stats
    const lots = await prisma.lot.findMany({ select: { quantity: true, status: true, commodityName: true } });
    const totalLotsQtl = lots.reduce((s, l) => s + l.quantity, 0);
    const activeLots = lots.filter((l) => ['READY', 'MATCHED', 'OFFER_RECEIVED', 'NEGOTIATING'].includes(l.status));
    const activeLotsQtl = activeLots.reduce((s, l) => s + l.quantity, 0);

    // Top commodities
    const commodityCounts: Record<string, number> = {};
    for (const l of lots) {
      commodityCounts[l.commodityName] = (commodityCounts[l.commodityName] || 0) + l.quantity;
    }
    const topCommodities = Object.entries(commodityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name)
      .join(', ');

    // Demand stats
    const demands = await prisma.buyerDemand.findMany({
      where: { isActive: true },
      select: { quantity: true },
    });
    const totalDemandQtl = demands.reduce((s, d) => s + d.quantity, 0);

    // Transaction stats
    const transactions = await prisma.transaction.findMany({
      select: { agreedPricePaise: true, quantity: true, status: true },
    });
    const completedTxs = transactions.filter((t) => t.status === 'COMPLETED');
    const totalTxVolumePaise = transactions.reduce((s, t) => s + t.agreedPricePaise * t.quantity, 0);

    // Opportunity stats for NRP uplift
    const opportunities = await (prisma as any).opportunityRecord.findMany({
      select: { nrpPaise: true, channelType: true, grossPricePaise: true },
    }).catch(() => []);

    const directBuyers = opportunities.filter((o: any) => o.channelType === 'DIRECT_BUYER');
    const mandis = opportunities.filter((o: any) => o.channelType === 'MANDI_APMC');
    const avgDirectNrp = directBuyers.length > 0 ? directBuyers.reduce((s: number, o: any) => s + o.nrpPaise, 0) / directBuyers.length : 0;
    const avgMandiNrp = mandis.length > 0 ? mandis.reduce((s: number, o: any) => s + o.nrpPaise, 0) / mandis.length : 0;
    const nrpUpliftPercent = avgMandiNrp > 0 ? (((avgDirectNrp - avgMandiNrp) / avgMandiNrp) * 100).toFixed(1) : '0.0';
    const nrpUpliftRupees = avgMandiNrp > 0 ? Math.round((avgDirectNrp - avgMandiNrp) / 100) : 0;

    // Market feed freshness
    const recentPrices = await prisma.marketPrice.findMany({
      include: { market: { select: { name: true, district: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const marketFeeds = recentPrices.slice(0, 3).map((p) => ({
      marketName: p.market.name,
      district: p.market.district,
      commodity: `${p.commodityName} ${p.varietyName}`,
      modalPrice: p.modalPricePaise / 100,
      source: p.dataOrigin === 'GOVERNMENT_SOURCE' ? 'Agmarknet API' : 'Demo Mirror',
      hoursAgo: Math.round((Date.now() - new Date(p.createdAt).getTime()) / 3600000),
    }));

    // Grievance stats
    let grievanceStats = { open: 0, underReview: 0, resolved: 0 };
    try {
      const gOpen = await (prisma as any).grievance.count({ where: { status: 'OPEN' } });
      const gReview = await (prisma as any).grievance.count({ where: { status: 'UNDER_REVIEW' } });
      const gResolved = await (prisma as any).grievance.count({ where: { status: 'RESOLVED' } });
      grievanceStats = { open: gOpen, underReview: gReview, resolved: gResolved };
    } catch {}

    return NextResponse.json({
      users: { total: totalUsers, farmers: farmerCount, buyers: buyerCount, fpos: fpoCount, admins: adminCount },
      lots: { totalQtl: totalLotsQtl, activeQtl: activeLotsQtl, count: lots.length, topCommodities },
      demands: { totalQtl: totalDemandQtl, count: demands.length },
      transactions: { count: transactions.length, completed: completedTxs.length, totalVolumePaise: totalTxVolumePaise },
      nrp: { upliftPercent: nrpUpliftPercent, upliftRupees: nrpUpliftRupees, avgDirectNrpPaise: Math.round(avgDirectNrp), avgMandiNrpPaise: Math.round(avgMandiNrp) },
      verifiedBuyers: directBuyers.length,
      marketFeeds,
      grievances: grievanceStats,
    });
  } catch (err: any) {
    console.error('[Admin Dashboard Stats]', err?.message);
    return NextResponse.json({
      users: { total: 0, farmers: 0, buyers: 0, fpos: 0, admins: 0 },
      lots: { totalQtl: 0, activeQtl: 0, count: 0, topCommodities: '' },
      demands: { totalQtl: 0, count: 0 },
      transactions: { count: 0, completed: 0, totalVolumePaise: 0 },
      nrp: { upliftPercent: '0.0', upliftRupees: 0, avgDirectNrpPaise: 0, avgMandiNrpPaise: 0 },
      verifiedBuyers: 0,
      marketFeeds: [],
      grievances: { open: 0, underReview: 0, resolved: 0 },
    });
  }
}
