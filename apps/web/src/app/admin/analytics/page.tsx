'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { api } from '../../../lib/api';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Scale,
  DollarSign,
  Download,
} from 'lucide-react';
import { formatCurrency, formatQuintal } from '../../../lib/format';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await api.getOpportunities();
        if (Array.isArray(data) && data.length > 0) {
          setOpportunities(data);
        }
      } catch (err) {
        console.warn('Failed to load opportunities for analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const directBuyers = opportunities.filter((o) => o.channelType === 'DIRECT_BUYER');
  const mandis = opportunities.filter((o) => o.channelType === 'MANDI_APMC');

  const channels = [
    {
      name: 'Direct Food Processors & Retail',
      share: directBuyers.length > 0 ? `${Math.round((directBuyers.length / (opportunities.length || 1)) * 60)}%` : '42%',
      uplift: '+11.5%',
      avgNRP: directBuyers.length > 0 ? directBuyers.reduce((s, b) => s + b.nrpPaise, 0) / directBuyers.length / 100 : 2925.20,
      color: 'bg-emerald-500',
    },
    {
      name: 'FPO Aggregation & Institutional Bulk',
      share: '32%',
      uplift: '+17.4%',
      avgNRP: 3080.00,
      color: 'bg-[#ef4d23]',
    },
    {
      name: 'Regulated APMC Mandis',
      share: mandis.length > 0 ? `${Math.round((mandis.length / (opportunities.length || 1)) * 40)}%` : '26%',
      uplift: 'Baseline (0%)',
      avgNRP: mandis.length > 0 ? mandis.reduce((s, b) => s + b.nrpPaise, 0) / mandis.length / 100 : 2680.00,
      color: 'bg-neutral-400',
    },
  ];

  const mandiSpreads = (opportunities.length > 0 ? opportunities : [
    { name: 'FreshMart Foods Ltd.', nrpPaise: 292520 },
    { name: 'Hotel Grand Residency', nrpPaise: 299728 },
    { name: 'Pune APMC (Gultekdi)', nrpPaise: 278722 },
    { name: 'Pune Veggie Hub', nrpPaise: 274600 },
    { name: 'Talegaon Dabhade Mandi', nrpPaise: 262200 },
  ]).map((opp) => {
    const nrp = opp.nrpPaise / 100;
    const baseline = 2622.00;
    const diff = nrp - baseline;
    return {
      market: opp.name,
      nrp,
      spread: diff >= 0 ? `+₹${diff.toFixed(2)}/qtl` : `-₹${Math.abs(diff).toFixed(2)}/qtl`,
      trend: diff >= 0 ? 'up' : 'down',
    };
  });



  return (
    <AppShell
      badge="Market Economics &amp; Welfare Analytics"
      title="Macro Agricultural Intelligence"
      subtitle="Cross-market price spread analysis, NRP welfare uplift curves, and FPO aggregation economics across Maharashtra."
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-neutral-200 shadow-xs text-xs">
            {(['7D', '30D', '90D', '1Y'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${timeRange === t
                    ? 'bg-[#0b0f1a] text-white'
                    : 'text-neutral-600 hover:text-neutral-900'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => alert('Generating State Macro Report PDF...')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* TOP MACRO METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Farmer Net Welfare Uplift
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-emerald-800 block">
              +₹303.20/qtl
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">Avg gain over local mandi floor</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Logistics Savings via Pooling
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-[#ef4d23] block">
              ₹297.04/qtl
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">Full truckload FPO efficiency</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Escrow Settlement Velocity
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-neutral-900 block">
              1.8 Hours
            </span>
            <span className="text-xs text-emerald-700 font-medium mt-1 block">
              vs. 14–21 days traditional credit
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Traceability Index
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-neutral-900 block">
              98.4%
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">Farm gate to destination weighbridge</span>
          </div>
        </div>

        {/* TWO COLUMN CHARTS & BREAKDOWNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Channel Volume & Welfare Share */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Procurement Channel Market Share</h3>
              <p className="text-xs text-neutral-500">Distribution of trade volume and average realized farmer price.</p>
            </div>

            <div className="space-y-4 pt-2">
              {channels.map((ch, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800">{ch.name}</span>
                    <span className="font-bold text-neutral-900">{ch.share} ({ch.uplift})</span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full ${ch.color} rounded-full`} style={{ width: ch.share }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>Average NRP: ₹{ch.avgNRP.toFixed(2)}/qtl</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
              <strong className="block mb-0.5">Policy Insight:</strong>
              Farmers aggregating with FPOs capture an average ₹3080/qtl for bulk lots, overcoming individual lot minimums.
            </div>
          </div>

          {/* Card 2: Inter-Market Price Spreads (Canonical Data) */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Canonical Inter-Market Price Spreads</h3>
              <p className="text-xs text-neutral-500">
                Live Net Realized Price across 7 channels for Ramesh Kumar (18 Qtl Tomato Hybrid).
              </p>
            </div>

            <div className="divide-y divide-neutral-100">
              {mandiSpreads.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900 block">{item.market}</span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Net: ₹{item.nrp.toFixed(2)}/qtl
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold ${item.trend === 'up' ? 'text-emerald-800' : 'text-neutral-500'
                        }`}
                    >
                      {item.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                      {item.spread}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">vs Talegaon baseline</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
