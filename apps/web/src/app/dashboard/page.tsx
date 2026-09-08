'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/navigation/AppShell';
import { Gauge } from '../../components/Gauge';
import { NRPBreakdownModal } from '../../components/NRPBreakdownModal';
import { NegotiationModal } from '../../components/NegotiationModal';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Truck,
  ShieldCheck,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  Scale,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FarmerDashboard() {
  const { user, isDemoMode, isAuthenticated } = useAuth();
  const [showNRPModal, setShowNRPModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);

  // Data from Domain Engine
  const lot = {
    id: 'demo-lot-ramesh-18qtl',
    farmerName: isDemoMode ? 'Ramesh Kumar' : (isAuthenticated && user?.name ? user.name : 'Verified Farmer'),
    commodity: 'Tomato',
    variety: 'Hybrid',
    grade: 'A',
    quantityQtl: 18,
    harvestDate: 'Sep 6, 2026',
    location: isDemoMode ? 'Dehu Road Cluster, Haveli, Pune' : (isAuthenticated && (user?.district || user?.village) ? `${user?.village ? user.village + ', ' : ''}${user?.district || 'Pune'}, Maharashtra` : 'Haveli, Pune'),
  };

  const topOpportunity = {
    id: 'freshmart',
    rank: 1,
    name: 'FreshMart Foods',
    buyerType: 'Corporate Processor',
    location: 'Chakan Industrial Zone, Pune',
    distanceKm: 42,
    providesPickup: true,
    grossPricePaise: 296000,
    nrpPaise: 292520, // ₹2,925.20/qtl
    totalRealizedPaise: 5265360, // ₹52,653.60 for 18 Qtl
    totalDeductionsPaise: 3480,
    netMarginOverBaselinePaise: 30320, // +₹303.20/qtl
    trustScore: 0.90,
    paymentReliability: 0.95,
    verificationLevel: 'PLATFORM_VERIFIED',
    paymentTerm: 'Direct Bank Settlement (T+1 on Weighment)',
    deductions: {
      transportPaise: 0,
      loadingPaise: 2000,
      weighingPaise: 0,
      mandiFeePaise: 0,
      commissionPaise: 0,
      transitLossPaise: 1480,
    },
    recommendationReason:
      'Rank #1 Natural Choice: Direct farmgate pickup eliminates ₹22/km transport and APMC 5% fees. Delivers the highest net in-hand realization with platform-verified settlement.',
    isEligible: true,
  };

  const baseline = {
    name: 'Talegaon Mandi',
    distanceKm: 18,
    grossPricePaise: 290000,
    nrpPaise: 262200, // ₹2,622.00/qtl
    totalRealizedPaise: 4719600, // ₹47,196
  };

  const netGainPaise = topOpportunity.totalRealizedPaise - baseline.totalRealizedPaise; // ₹5,457.60

  const dashboardTitle = isDemoMode
    ? 'What should I do today, Ramesh?'
    : isAuthenticated && user?.name
    ? `What should I do today, ${user.name.split(' ')[0]}?`
    : 'Farmer Command Center';

  const dashboardSubtitle = isDemoMode
    ? 'Your canonical 18 Quintal Tomato Hybrid harvest is evaluated against 7 market channels in real time.'
    : isAuthenticated
    ? 'Your harvest lots evaluated against real-time market channels across Pune & Maharashtra.'
    : 'Evaluating market opportunities and net practical returns across 7 verified channels in real time.';

  return (
    <AppShell
      badge="Farmer Command Center"
      title={dashboardTitle}
      subtitle={dashboardSubtitle}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/markets"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>All 7 Channels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Active Lot Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 text-[#ef4d23] flex items-center justify-center font-bold text-sm shrink-0">
              18Q
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-neutral-900 text-base">
                  {lot.quantityQtl} Quintals {lot.commodity} ({lot.variety})
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Grade {lot.grade} Verified
                </span>
                <span className="bg-neutral-100 text-neutral-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Harvested {lot.harvestDate}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{lot.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500">Lot Status:</span>
            <span className="bg-blue-50 text-blue-800 border border-blue-200 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" /> Ready for Sale
            </span>
          </div>
        </div>

        {/* HERO RECOMMENDATION CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-sm relative overflow-hidden">
          {/* Top Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-300 px-3.5 py-1 rounded-full text-xs font-extrabold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>BEST PRACTICAL OPPORTUNITY TODAY</span>
            </div>
            <span className="text-xs text-neutral-500">Algorithmically Ranked #1</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Numbers & Comparison */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                    {topOpportunity.name}
                  </h2>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-md font-semibold">
                    {topOpportunity.buyerType}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {topOpportunity.location} • {topOpportunity.distanceKm} km transit
                </p>
              </div>

              {/* Price Callout */}
              <div className="flex flex-wrap items-baseline gap-3 pt-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 font-instrument tracking-tight">
                  ₹2,925.20
                </span>
                <span className="text-sm font-semibold text-neutral-500">/quintal Net Realized Price</span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-xs font-bold">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  +₹303.20/qtl over Mandi
                </span>
              </div>

              {/* In-Hand Total */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-neutral-500 block">Total Net Realized Payout ({lot.quantityQtl} Qtl)</span>
                  <span className="text-2xl font-bold text-emerald-800 font-instrument">
                    ₹52,653.60
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-neutral-500 block">Net Gain Over Local Mandi</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    +₹5,457.60 (11.6% Uplift)
                  </span>
                </div>
              </div>

              {/* Why Recommended bullet list */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                  Why KrishiSetu recommends FreshMart:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct Farmgate Pickup (₹0 freight cost to you)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Zero APMC cess &amp; zero middleman commission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Minimal 0.5% post-harvest loss (vs. 2.0% mandi haulage)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>T+1 Bank Settlement directly into your account</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowNegotiateModal(true)}
                  className="px-6 py-2.5 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Negotiate / Lock Offer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowNRPModal(true)}
                  className="px-5 py-2.5 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-colors"
                >
                  Audit NRP Waterfall
                </button>
                <Link
                  href="/markets"
                  className="px-4 py-2.5 text-xs text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                >
                  Compare other 6 channels →
                </Link>
              </div>
            </div>

            {/* Right: Trust & Verification Gauge */}
            <div className="lg:col-span-4 bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Buyer Trust Score
              </span>
              <Gauge value={90} color="#10b981" showLabels={false} />
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-neutral-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Platform Verified Processor</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2">
                42 successful trades • 0 payment disputes • Average settlement: 18 hours
              </p>
            </div>
          </div>
        </div>

        {/* SECONDARY CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Local Mandi Baseline */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span className="font-bold text-neutral-700 uppercase">Local Mandi Baseline</span>
                <span>18 km away</span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900">{baseline.name}</h3>
              <div className="mt-3">
                <span className="text-xs text-neutral-500 block">Headline Gross: ₹2,900/qtl</span>
                <span className="text-2xl font-bold font-instrument text-neutral-800">
                  ₹2,622.00/qtl
                </span>
                <span className="text-xs text-neutral-500 ml-1">in-hand NRP</span>
              </div>
              <p className="text-xs text-rose-600 mt-2 font-medium">
                -₹278/qtl lost in transit shrinkage (2%), mandi loading, and 4% APMC fee.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-500 flex justify-between items-center">
              <span>Lot Realization: ₹47,196</span>
              <Link href="/markets" className="text-[#ef4d23] font-semibold hover:underline">
                Compare →
              </Link>
            </div>
          </div>

          {/* Card 2: FPO Aggregation Opportunity */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span className="font-bold text-neutral-700 uppercase">FPO Pooling</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Demand Unlocked
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900">AgriFresh Exports Ltd.</h3>
              <p className="text-xs text-neutral-600 mt-1">
                Minimum lot: 50 Qtl. Ramesh (18) + Suresh (20) + Meena (30) = <strong>68 Qtl pooled</strong>.
              </p>
              <div className="mt-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-xs">
                <span className="text-neutral-500 block">Bulk Logistics Advantage</span>
                <span className="text-base font-bold text-emerald-800">+₹297.04/qtl (+11.3%)</span>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-100 text-xs flex justify-between items-center">
              <span className="text-neutral-500">AgriFresh Offer: ₹3,200/qtl</span>
              <Link href="/fpo" className="text-[#ef4d23] font-semibold hover:underline flex items-center gap-1">
                <span>Join Pool</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Transaction Pipeline Status */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span className="font-bold text-neutral-700 uppercase">Active Trade Status</span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                  Pending Action
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Contract Negotiation</h3>
              <p className="text-xs text-neutral-600 mt-1">
                FreshMart Foods offer at ₹2,960/qtl gross. Counteroffer suggested at ₹3,000/qtl.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-neutral-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Next Step: Agree &amp; Book Logistics</span>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-100 text-xs flex justify-between items-center">
              <span className="text-neutral-500">Est. Payout: ₹53,550</span>
              <Link href="/transactions" className="text-[#ef4d23] font-semibold hover:underline">
                View Timeline →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNRPModal && (
        <NRPBreakdownModal
          opportunity={topOpportunity as any}
          lotQuantityQtl={lot.quantityQtl}
          onClose={() => setShowNRPModal(false)}
        />
      )}

      {showNegotiateModal && (
        <NegotiationModal
          opportunity={topOpportunity as any}
          lotQuantityQtl={lot.quantityQtl}
          onClose={() => setShowNegotiateModal(false)}
          onNegotiationComplete={(agreedPaise) => {
            setShowNegotiateModal(false);
            alert(`Contract Locked at ₹${(agreedPaise / 100).toFixed(2)}/qtl with FreshMart Foods!`);
          }}
        />
      )}
    </AppShell>
  );
}
