'use client';

import React, { useState } from 'react';
import { TrendingUpIcon, ScaleIcon, SparklesIcon, ShieldCheckIcon } from './icons';

interface ImpactCardProps {
  quantityQtl: number;
}

export function ImpactCard({ quantityQtl }: ImpactCardProps) {
  const baselineNrp = 2622; // Engine calculated Talegaon Mandi baseline

  const tiers = [
    {
      id: 'talegaon',
      name: 'Talegaon Mandi',
      tag: 'Local Baseline (18 km)',
      short: 'Talegaon',
      grossPrice: 2900,
      nrp: 2622,
      total: 2622 * quantityQtl,
      delta: 0,
      gradient: 'linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)',
      isSpecial: false,
    },
    {
      id: 'pune-apmc',
      name: 'Pune APMC (Gultekdi)',
      tag: 'Regulated Mandi (35 km)',
      short: 'Pune APMC',
      grossPrice: 3100,
      nrp: 2787,
      total: 2787 * quantityQtl,
      delta: (2787 - baselineNrp) * quantityQtl,
      gradient: 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)',
      isSpecial: false,
    },
    {
      id: 'freshmart',
      name: 'FreshMart Foods',
      tag: 'Platform Direct Buyer',
      short: 'FreshMart',
      grossPrice: 2960,
      nrp: 2925,
      total: 2925 * quantityQtl,
      delta: (2925 - baselineNrp) * quantityQtl,
      gradient: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
      isSpecial: false,
    },
    {
      id: 'freshmart-neg',
      name: 'FreshMart (Negotiated @ ₹2,975)',
      tag: 'Agreed Final Contract',
      short: 'Negotiated',
      grossPrice: 2975,
      nrp: 2940,
      total: 2940 * quantityQtl,
      delta: (2940 - baselineNrp) * quantityQtl,
      gradient: 'linear-gradient(180deg, #14b8a6 0%, #0f766e 100%)',
      isSpecial: false,
    },
    {
      id: 'fpo-pool',
      name: 'Pune FPO Collective (75 Qtl Bulk)',
      tag: 'Pooled Logistics & Export Unlock',
      short: 'FPO Bulk Pool',
      grossPrice: 2960,
      nrp: 2925,
      total: 2925 * quantityQtl,
      delta: 297 * quantityQtl,
      gradient: 'linear-gradient(180deg, #ef4d23 0%, #f59e0b 50%, #10b981 100%)',
      isSpecial: true,
    },
  ];

  const [activeTier, setActiveTier] = useState(tiers[2]); // Default FreshMart
  const maxNetGain = (2940 - baselineNrp) * quantityQtl;

  // Chart scaling
  const minChartNrp = 2500;
  const maxChartNrp = 3000;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#ef4d23]">
              <TrendingUpIcon className="w-5 h-5" />
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Value Realization &amp; Economic Impact Scorecard
            </h3>
          </div>
          <p className="text-xs text-neutral-500">
            Comparative Net In-Hand Revenue for Ramesh Kumar ({quantityQtl} Quintals Tomato Hybrid)
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto">
          <SparklesIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Maximum In-Hand Uplift: +₹{maxNetGain.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Ascending Vertical Gradient Bar Chart */}
      <div className="bg-neutral-50 rounded-2xl p-4 sm:p-6 border border-neutral-200/70 mb-6">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-6 pb-2 border-b border-neutral-200">
          <span className="font-semibold text-neutral-800">Ascending Net Realized Price Comparison (₹/qtl)</span>
          <span className="text-[11px]">Click any bar to audit channel metrics</span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-4 h-56 items-end px-2">
          {tiers.map((tier) => {
            const heightPercent = Math.max(
              20,
              Math.min(100, Math.round(((tier.nrp - minChartNrp) / (maxChartNrp - minChartNrp)) * 100))
            );
            const isSelected = activeTier.id === tier.id;

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setActiveTier(tier)}
                className={`group flex flex-col items-center h-full justify-end cursor-pointer transition-all duration-200 focus:outline-none ${
                  isSelected ? 'scale-[1.02]' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <span
                  className={`text-[11px] sm:text-xs font-bold mb-1.5 transition-colors ${
                    isSelected ? 'text-neutral-900 font-extrabold' : 'text-neutral-500'
                  }`}
                >
                  ₹{tier.nrp}
                </span>

                <div
                  style={{
                    height: `${heightPercent}%`,
                    background: tier.gradient,
                  }}
                  className={`w-full max-w-[72px] rounded-t-xl transition-all duration-300 shadow-sm relative ${
                    isSelected ? 'ring-2 ring-neutral-900 ring-offset-2' : ''
                  }`}
                >
                  {tier.delta > 0 && (
                    <span className="hidden sm:inline-block absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                      +₹{tier.delta.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-center w-full">
                  <span
                    className={`block text-[11px] sm:text-xs font-semibold truncate ${
                      isSelected ? 'text-neutral-900 font-bold' : 'text-neutral-600'
                    }`}
                  >
                    {tier.short}
                  </span>
                  <span className="block text-[10px] text-neutral-500 font-mono">
                    ₹{tier.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Channel Deep Dive */}
      <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-neutral-900">{activeTier.name}</h4>
            <span className="text-xs bg-white text-neutral-700 px-2 py-0.5 rounded-full border border-neutral-200 font-medium">
              {activeTier.tag}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Offered Gross Price: ₹{activeTier.grossPrice}/qtl • Net Realized: ₹{activeTier.nrp}/qtl (Deductions: ₹{activeTier.grossPrice - activeTier.nrp}/qtl)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 text-center">
            <span className="text-neutral-500 block text-[10px]">Total Lot Revenue</span>
            <span className="text-sm font-bold text-neutral-900">
              ₹{activeTier.total.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 text-center">
            <span className="text-neutral-500 block text-[10px]">In-Hand Rate</span>
            <span className="text-sm font-bold text-emerald-700">
              ₹{activeTier.nrp}/qtl
            </span>
          </div>

          <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 text-center">
            <span className="text-neutral-500 block text-[10px]">Profit Uplift</span>
            <span className="text-sm font-bold text-emerald-800">
              {activeTier.delta > 0 ? `+₹${activeTier.delta.toLocaleString('en-IN')}` : 'Baseline (₹0)'}
            </span>
          </div>
        </div>
      </div>

      {/* Narrative Impact Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
          <div className="flex items-center gap-2 mb-1.5 text-neutral-900 font-bold">
            <ScaleIcon className="w-4 h-4 text-[#ef4d23]" />
            <span>Eliminating Mandi Cuts</span>
          </div>
          <p className="text-neutral-600 leading-relaxed text-[11px]">
            Direct institutional channels eliminate the traditional 6% unofficial commission, cess, and arbitrary weighment cuts.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
          <div className="flex items-center gap-2 mb-1.5 text-neutral-900 font-bold">
            <TrendingUpIcon className="w-4 h-4 text-emerald-600" />
            <span>Transport Pooling Gains</span>
          </div>
          <p className="text-neutral-600 leading-relaxed text-[11px]">
            Pooling harvest lots with Suresh & Meena brings freight from ₹125/qtl down to ₹65/qtl, adding ₹1,080 to your pocket.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
          <div className="flex items-center gap-2 mb-1.5 text-neutral-900 font-bold">
            <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
            <span>Guaranteed T+1 Settlements</span>
          </div>
          <p className="text-neutral-600 leading-relaxed text-[11px]">
            Escrow-backed direct bank transfers ensure verified payout within 24 hours of delivery, ending 30-day payment delays.
          </p>
        </div>
      </div>
    </div>
  );
}
