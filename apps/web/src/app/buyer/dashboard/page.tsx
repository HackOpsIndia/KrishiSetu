'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../../components/navigation/AppShell';
import { Gauge } from '../../../components/Gauge';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import {
  Building2,
  Layers,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
} from 'lucide-react';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [incomingSupplies, setIncomingSupplies] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [lots, buyerDemands] = await Promise.all([
          api.getLots().catch(() => []),
          api.getDemands().catch(() => []),
        ]);

        if (Array.isArray(lots)) {
          setIncomingSupplies(
            lots.map((l: any) => ({
              farmer: l.farmerName || 'Ramesh Kumar',
              village: l.village || 'Haveli Cluster Hub',
              commodity: l.commodityName || 'Tomato Hybrid',
              grade: l.qualityGrade || 'A',
              quantityQtl: l.quantity || 18,
              status: l.status || 'Ready for Sourcing',
              currentOffer: `₹${((l.minAcceptablePricePaise || 292500) / 100).toLocaleString('en-IN')}/qtl`,
              href: '/buyer/offers',
            }))
          );
        }

        if (Array.isArray(buyerDemands)) {
          setDemands(buyerDemands);
        }
      } catch (err) {
        console.warn('Failed to load buyer dashboard data from database:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalDemandQtl = demands.reduce((s, d) => s + (d.totalQuantityQtl || 0), 0) || 200;
  const fulfilledQtl = demands.reduce((s, d) => s + (d.fulfilledQuantityQtl || 0), 0) || 75;

  const buyer = {
    name: user?.name || 'FreshMart Foods Ltd.',
    buyerType: 'Corporate Food Processor',
    location: 'Chakan Industrial Zone, Pune',
    trustScore: 90,
    activeDemandQtl: totalDemandQtl,
    fulfilledQtl: fulfilledQtl,
    targetPriceRange: demands[0]?.targetPriceRange || '₹2,900 – ₹3,100/qtl',
    pendingOffersCount: incomingSupplies.length || 2,
    activeContractsCount: 1,
  };


  return (
    <AppShell
      badge="B2B Procurement Workspace"
      title="FreshMart Foods — Sourcing Command"
      subtitle="Manage corporate raw material procurement, review incoming farmer supply lots, and track farmgate pickup logistics."
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/buyer/demand"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Sourcing Demand</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI OVERVIEW GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Active Sourcing Demand
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-instrument">
                {buyer.activeDemandQtl} Qtl
              </span>
              <span className="text-xs text-neutral-500">Tomato</span>
            </div>
            <span className="text-xs text-emerald-700 font-semibold mt-1 block">
              37.5% Fulfilled (75 Qtl committed)
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Target Price Band
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-instrument">
                {buyer.targetPriceRange}
              </span>
            </div>
            <span className="text-xs text-neutral-500 mt-1 block">
              Direct farmgate procurement
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Pending Offers
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#ef4d23] font-instrument">
                {buyer.pendingOffersCount} Lots
              </span>
              <span className="text-xs text-neutral-500">Awaiting Response</span>
            </div>
            <Link href="/buyer/offers" className="text-xs text-[#ef4d23] font-semibold hover:underline mt-1 block">
              Review Offers Desk →
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Buyer Trust Rating
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-instrument">
                {buyer.trustScore}/100
              </span>
            </div>
            <span className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Platform Verified
            </span>
          </div>
        </div>

        {/* HERO DEMAND PROGRESS & LOGISTICS FLEET */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-neutral-900 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-800 px-3 py-1 rounded-full text-xs font-bold">
                <Layers className="w-3.5 h-3.5 text-[#ef4d23]" />
                <span>Primary Sourcing Target • Chakan Processing Unit</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Processing Grade A Hybrid Tomato: 200 Quintals Required
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Direct procurement with company-provided refrigerated transport for harvest lots within 60 km radius of Pune. 10 Quintal minimum lot size.
              </p>

              <div className="pt-2">
                <div className="flex justify-between text-xs font-semibold mb-1.5 text-neutral-700">
                  <span>Procurement Progress</span>
                  <span>75 Qtl / 200 Qtl (37.5%)</span>
                </div>
                <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full w-[37.5%]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/buyer/offers"
                className="px-6 py-3 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white text-xs font-semibold shadow-sm transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <span>Negotiate Ramesh&apos;s 18 Qtl Lot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/buyer/demand"
                className="px-6 py-3 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-colors text-center"
              >
                Adjust Procurement Specs
              </Link>
            </div>
          </div>
        </div>

        {/* INCOMING MATCHED SUPPLY LOTS */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Incoming Matched Farmer Supply</h3>
              <p className="text-xs text-neutral-500">Quality-checked harvest lots within pickup reach.</p>
            </div>
            <Link href="/buyer/offers" className="text-xs text-[#ef4d23] font-semibold hover:underline">
              View All Offers Desk →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingSupplies.map((supply, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-neutral-900 text-sm">{supply.farmer}</span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {supply.status}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 block">{supply.village}</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-neutral-900 font-instrument">
                      {supply.quantityQtl} Qtl
                    </span>
                    <span className="text-xs text-neutral-600">
                      {supply.commodity} (Grade {supply.grade})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-200 text-xs">
                  <span className="font-semibold text-neutral-800">
                    Negotiation Price: <strong className="text-emerald-800">{supply.currentOffer}</strong>
                  </span>
                  <Link
                    href={supply.href}
                    className="inline-flex items-center gap-1 text-[#ef4d23] hover:underline font-bold"
                  >
                    <span>Counter / Accept</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
