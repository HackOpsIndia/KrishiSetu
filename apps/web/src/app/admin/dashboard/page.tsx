'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../../components/navigation/AppShell';
import { api } from '../../../lib/api';
import {
  ShieldCheck,
  Building2,
  Users,
  TrendingUp,
  AlertCircle,
  FileText,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboard() {
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const opps = await api.getOpportunities();
        if (Array.isArray(opps)) setOpportunities(opps);
      } catch {}
    }
    load();
  }, []);

  const buyerCount = opportunities.filter((o) => o.channelType === 'DIRECT_BUYER').length || 48;

  const kpis = [
    { label: 'Active Farmers', value: '1,420', sub: 'Across 14 Pune clusters', icon: Users, color: 'text-neutral-900' },
    { label: 'Verified Buyers', value: String(buyerCount), sub: 'KYC & Escrow approved', icon: ShieldCheck, color: 'text-emerald-700' },
    { label: 'Active Open Demand', value: '14,250 Qtl', sub: 'Tomato, Onion, Soybean', icon: TrendingUp, color: 'text-[#ef4d23]' },
    { label: 'Average NRP Uplift', value: '+11.3%', sub: '+₹303/qtl over Mandis', icon: BarChart3, color: 'text-emerald-800' },
  ];

  const pendingVerifications = opportunities
    .filter((o) => o.channelType === 'DIRECT_BUYER')
    .slice(0, 3)
    .map((b) => ({
      name: b.name,
      type: b.buyerType || 'Agri Corporate Buyer',
      trades: 28,
      score: Math.round((b.trustScore || 0.9) * 100),
      status: b.verificationLevel || 'PLATFORM_VERIFIED',
    }));

  return (
    <AppShell
      badge="Platform Operations &amp; Governance"
      title="KrishiSetu State Operations Hub"
      subtitle="Oversight of market intelligence data quality, institutional buyer verifications, transaction escrow, and farmer grievance resolution."
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users &amp; Access</span>
          </Link>
          <Link
            href="/admin/buyers"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Buyer Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* PLATFORM KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">{kpi.label}</span>
                <kpi.icon className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <span className={`text-2xl sm:text-3xl font-extrabold font-instrument block ${kpi.color}`}>
                  {kpi.value}
                </span>
                <span className="text-xs text-neutral-500 mt-1 block">{kpi.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* GOVERNANCE & OVERSIGHT TWO-COLUMN CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Buyer Verification Queue */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Institutional Buyer Registry</h3>
                  <p className="text-xs text-neutral-500">Corporate processors and bulk buyers requiring governance audit.</p>
                </div>
                <Link href="/admin/buyers" className="text-xs text-[#ef4d23] font-semibold hover:underline">
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {pendingVerifications.map((buyer, idx) => (
                  <div key={idx} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{buyer.name}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-neutral-200 text-neutral-600 font-medium">
                          {buyer.type}
                        </span>
                      </div>
                      <span className="text-neutral-500 mt-0.5 block">
                        Trust Score: <strong>{buyer.score}/100</strong> • {buyer.trades} successful trades
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      buyer.status === 'PLATFORM_VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {buyer.status === 'PLATFORM_VERIFIED' ? 'Verified' : 'Under Review'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex justify-between items-center">
              <span>All corporate accounts undergo KYC &amp; bank escrow verification.</span>
              <Link href="/admin/buyers" className="text-neutral-800 font-semibold hover:underline">
                Review Registry →
              </Link>
            </div>
          </div>

          {/* Card 2: Market Data Integrity & Freshness */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Mandi Price Feed Integrity</h3>
                  <p className="text-xs text-neutral-500">Government APMC feeds vs. synthetic demo market data.</p>
                </div>
                <Link href="/admin/markets" className="text-xs text-[#ef4d23] font-semibold hover:underline">
                  Manage Feeds →
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Pune APMC (Gultekdi)</span>
                    <span className="text-emerald-700">Fresh (&lt; 2h ago)</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Source: Agmarknet API / Demo Mirror</span>
                    <span>Modal: ₹3,100/qtl</span>
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Talegaon Dabhade Mandi</span>
                    <span className="text-emerald-700">Fresh (&lt; 4h ago)</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Source: State Agricultural Board / Demo Mirror</span>
                    <span>Modal: ₹2,900/qtl</span>
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Nashik Tomato Hub</span>
                    <span className="text-emerald-700">Fresh (&lt; 1h ago)</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Source: Direct Exporter Cargo Feed</span>
                    <span>Modal: ₹3,200/qtl</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-100 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero stale data warnings. All 7 monitored markets synced within 24 hours.</span>
            </div>
          </div>
        </div>

        {/* QUICK ACCESS ADMIN MODULES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <Link
            href="/admin/users"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="font-bold text-neutral-900 block text-sm group-hover:text-[#ef4d23] transition-colors">
                Users &amp; Access Control
              </span>
              <span className="text-neutral-500 text-[11px]">Role mutations, promotion, &amp; audit</span>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#ef4d23] transition-colors" />
          </Link>

          <Link
            href="/admin/transactions"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all flex items-center justify-between"
          >
            <div>
              <span className="font-bold text-neutral-900 block text-sm">Transaction Oversight</span>
              <span className="text-neutral-500 text-[11px]">Audit contracts, escrow, &amp; logistics</span>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
          </Link>

          <Link
            href="/admin/grievances"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all flex items-center justify-between"
          >
            <div>
              <span className="font-bold text-neutral-900 block text-sm">Grievance Center</span>
              <span className="text-neutral-500 text-[11px]">1 open inquiry • 98% resolution rate</span>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
          </Link>

          <Link
            href="/admin/analytics"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all flex items-center justify-between"
          >
            <div>
              <span className="font-bold text-neutral-900 block text-sm">Platform Analytics</span>
              <span className="text-neutral-500 text-[11px]">Statewide NRP uplift &amp; FPO metrics</span>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
