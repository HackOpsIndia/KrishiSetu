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
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await api.getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        console.warn('Failed to load dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const kpis = [
    {
      label: 'Active Farmers',
      value: stats ? stats.users.farmers.toLocaleString('en-IN') : '—',
      sub: stats ? `Across ${stats.users.total} total accounts` : 'Loading...',
      icon: Users,
      color: 'text-neutral-900',
    },
    {
      label: 'Verified Buyers',
      value: stats ? String(stats.users.buyers) : '—',
      sub: 'KYC & Escrow approved',
      icon: ShieldCheck,
      color: 'text-emerald-700',
    },
    {
      label: 'Active Open Demand',
      value: stats ? `${stats.demands.totalQtl.toLocaleString('en-IN')} Qtl` : '—',
      sub: stats?.lots.topCommodities || 'Loading...',
      icon: TrendingUp,
      color: 'text-[#ef4d23]',
    },
    {
      label: 'Average NRP Uplift',
      value: stats ? `+${stats.nrp.upliftPercent}%` : '—',
      sub: stats ? `+₹${stats.nrp.upliftRupees}/qtl over Mandis` : 'Loading...',
      icon: BarChart3,
      color: 'text-emerald-800',
    },
  ];

  const marketFeeds = stats?.marketFeeds || [];

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
          {/* Card 1: Transaction Summary */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Transaction Overview</h3>
                  <p className="text-xs text-neutral-500">Platform-wide escrow transaction summary from database.</p>
                </div>
                <Link href="/admin/transactions" className="text-xs text-[#ef4d23] font-semibold hover:underline">
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900">Total Transactions</span>
                    <span className="text-neutral-500 block mt-0.5">{stats?.transactions.count || 0} contracts recorded</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {stats?.transactions.completed || 0} Completed
                  </span>
                </div>
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900">Active Lots</span>
                    <span className="text-neutral-500 block mt-0.5">{stats?.lots.count || 0} lots ({stats?.lots.totalQtl || 0} Qtl total)</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                    {stats?.lots.activeQtl || 0} Qtl Active
                  </span>
                </div>
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900">Grievance Status</span>
                    <span className="text-neutral-500 block mt-0.5">{stats?.grievances.open || 0} open • {stats?.grievances.underReview || 0} under review</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    {stats?.grievances.resolved || 0} Resolved
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex justify-between items-center">
              <span>All contracts undergo KYC &amp; bank escrow verification.</span>
              <Link href="/admin/transactions" className="text-neutral-800 font-semibold hover:underline">
                Audit Contracts →
              </Link>
            </div>
          </div>

          {/* Card 2: Market Data Integrity & Freshness */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Mandi Price Feed Integrity</h3>
                  <p className="text-xs text-neutral-500">Market price data from PostgreSQL database.</p>
                </div>
                <Link href="/admin/markets" className="text-xs text-[#ef4d23] font-semibold hover:underline">
                  Manage Feeds →
                </Link>
              </div>

              <div className="space-y-3">
                {marketFeeds.length > 0 ? marketFeeds.map((feed: any, idx: number) => (
                  <div key={idx} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{feed.marketName}</span>
                      <span className="text-emerald-700">
                        {feed.hoursAgo <= 24 ? `Fresh (${feed.hoursAgo}h ago)` : `Stale (${feed.hoursAgo}h)`}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-500 text-[11px]">
                      <span>Source: {feed.source} • {feed.district}</span>
                      <span>Modal: ₹{feed.modalPrice.toLocaleString('en-IN')}/qtl</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-500 text-center">
                    {isLoading ? 'Loading market feeds...' : 'No market price data in database yet.'}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-100 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All data sourced from PostgreSQL database.</span>
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
              <span className="text-neutral-500 text-[11px]">
                {stats ? `${stats.grievances.open} open • ${stats.grievances.resolved} resolved` : 'Loading...'}
              </span>
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
