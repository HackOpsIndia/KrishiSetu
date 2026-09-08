'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/navigation/AppShell';
import { Gauge } from '../../components/Gauge';
import { NRPBreakdownModal } from '../../components/NRPBreakdownModal';
import { NegotiationModal } from '../../components/NegotiationModal';
import { api } from '../../lib/api';
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
  const [lot, setLot] = useState<any | null>(null);
  const [topOpportunity, setTopOpportunity] = useState<any | null>(null);
  const [baseline, setBaseline] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [lots, opps] = await Promise.all([
          api.getLots().catch(() => []),
          api.getOpportunities().catch(() => []),
        ]);

        if (Array.isArray(lots) && lots.length > 0) {
          const l = lots[0];
          setLot({
            id: l.id,
            farmerName: l.farmerName || user?.name || 'Verified Farmer',
            commodity: l.commodity || l.commodityName || 'Tomato',
            variety: l.variety || l.varietyName || 'Hybrid',
            grade: l.grade || l.qualityGrade || 'A',
            quantityQtl: l.quantityQtl || l.quantity || 18,
            harvestDate: l.harvestDate || 'Sep 6, 2026',
            location: l.location || (user?.district ? `${user.district}, Maharashtra` : 'Haveli, Pune'),
          });
        }

        if (Array.isArray(opps) && opps.length > 0) {
          const top = opps.find((o) => o.isEligible) || opps[0];
          setTopOpportunity(top);
          const mandi = opps.find((o) => o.channelType === 'MANDI_APMC') || opps[opps.length - 1];
          setBaseline({
            name: mandi?.name || 'Talegaon Mandi',
            distanceKm: mandi?.distanceKm || 18,
            grossPricePaise: mandi?.grossPricePaise || 290000,
            nrpPaise: mandi?.nrpPaise || 262200,
            totalRealizedPaise: mandi?.totalRealizedPaise || 4719600,
          });
        }
      } catch (err) {
        console.warn('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const dashboardTitle = isAuthenticated && user?.name
    ? `What should I do today, ${user.name.split(' ')[0]}?`
    : 'Farmer Command Center';

  const dashboardSubtitle =
    'Your harvest lots evaluated against real-time market channels across Pune & Maharashtra.';

  const netGainPaise =
    (topOpportunity?.totalRealizedPaise || 0) - (baseline?.totalRealizedPaise || 0);

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
            <span>All Channels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Active Lot Bar */}
        {lot ? (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 text-[#ef4d23] flex items-center justify-center font-bold text-sm shrink-0">
                {lot.quantityQtl}Q
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
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex items-center justify-between">
            <p className="text-xs text-neutral-500">No active harvest lot registered.</p>
            <Link
              href="/lots"
              className="text-xs font-semibold text-[#ef4d23] hover:underline flex items-center gap-1"
            >
              <span>Register Harvest Lot</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* HERO RECOMMENDATION CARD */}
        {topOpportunity && lot ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-sm relative overflow-hidden">
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
                      {topOpportunity.buyerType || topOpportunity.channelType}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {topOpportunity.location} • {topOpportunity.distanceKm} km transit
                  </p>
                </div>

                {/* Price Callout */}
                <div className="flex flex-wrap items-baseline gap-3 pt-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 font-instrument tracking-tight">
                    ₹{(topOpportunity.nrpPaise / 100).toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-neutral-500">/quintal Net Realized Price</span>
                  {topOpportunity.netMarginOverBaselinePaise > 0 && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-xs font-bold">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      +₹{(topOpportunity.netMarginOverBaselinePaise / 100).toFixed(2)}/qtl over Mandi
                    </span>
                  )}
                </div>

                {/* In-Hand Total */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-neutral-500 block">
                      Total Net Realized Payout ({lot.quantityQtl} Qtl)
                    </span>
                    <span className="text-2xl font-bold text-emerald-800 font-instrument">
                      ₹{(topOpportunity.totalRealizedPaise / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {netGainPaise > 0 && (
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-neutral-500 block">Net Gain Over Local Mandi</span>
                      <span className="text-base font-extrabold text-emerald-700">
                        +₹{(netGainPaise / 100).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Why Recommended bullet list */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                    Why KrishiSetu recommends {topOpportunity.name}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{topOpportunity.providesPickup ? 'Direct farmgate pickup' : 'Optimized transit corridor'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{topOpportunity.paymentTerm || 'Direct Bank Settlement (T+1)'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Trust Score: {Math.round((topOpportunity.trustScore || 0.9) * 100)}/100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero hidden deductions</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowNegotiateModal(true)}
                    className="px-6 py-2.5 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Negotiate / Accept Direct Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNRPModal(true)}
                    className="px-5 py-2.5 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Inspect Full Deductions Breakdown
                  </button>
                </div>
              </div>

              {/* Right: Gauge */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-neutral-50 rounded-2xl border border-neutral-200 text-center">
                <Gauge
                  value={Math.round((topOpportunity.trustScore || 0.9) * 100)}
                  color="#059669"
                  showLabels={false}
                />
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mt-2">
                  Trust Score: {Math.round((topOpportunity.trustScore || 0.9) * 100)}%
                </span>
                <span className="text-[11px] text-neutral-500 block">Verified Buyer</span>
                <p className="text-xs text-neutral-500 mt-3">
                  Score calculated from {topOpportunity.verificationLevel || 'PLATFORM_VERIFIED'} track record and on-time settlement.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* SECONDARY CARDS GRID */}
        {baseline && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Local Mandi Baseline */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                  <span className="font-bold text-neutral-700 uppercase">Local Mandi Baseline</span>
                  <span>{baseline.distanceKm} km away</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900">{baseline.name}</h3>
                <div className="mt-3">
                  <span className="text-xs text-neutral-500 block">
                    Headline Gross: ₹{Math.round(baseline.grossPricePaise / 100)}/qtl
                  </span>
                  <span className="text-2xl font-bold font-instrument text-neutral-800">
                    ₹{(baseline.nrpPaise / 100).toFixed(2)}/qtl
                  </span>
                  <span className="text-xs text-neutral-500 ml-1">in-hand NRP</span>
                </div>
                <p className="text-xs text-rose-600 mt-2 font-medium">
                  -₹{Math.round((baseline.grossPricePaise - baseline.nrpPaise) / 100)}/qtl lost in transit shrinkage, mandi loading, and fee.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-500 flex justify-between items-center">
                <span>Lot Realization: ₹{(baseline.totalRealizedPaise / 100).toLocaleString('en-IN')}</span>
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
                <h3 className="text-lg font-bold text-neutral-900">Collective Aggregation</h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Pool lots with local cluster farmers to unlock bulk procurement contracts and lower freight.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 text-xs flex justify-between items-center">
                <span className="text-neutral-500">Bulk Advantage</span>
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
                    Live Escrow
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Digital Settlement Desk</h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Automated weighbridge sync and T+1 direct bank disbursement guarantee.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 text-xs flex justify-between items-center">
                <span className="text-neutral-500">View Execution</span>
                <Link href="/transactions" className="text-[#ef4d23] font-semibold hover:underline">
                  View Timeline →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNRPModal && topOpportunity && lot && (
        <NRPBreakdownModal
          opportunity={topOpportunity as any}
          lotQuantityQtl={lot.quantityQtl}
          onClose={() => setShowNRPModal(false)}
        />
      )}

      {showNegotiateModal && topOpportunity && lot && (
        <NegotiationModal
          opportunity={topOpportunity as any}
          lotQuantityQtl={lot.quantityQtl}
          onClose={() => setShowNegotiateModal(false)}
          onNegotiationComplete={(agreedPaise) => {
            setShowNegotiateModal(false);
            alert(`Contract Locked at ₹${(agreedPaise / 100).toFixed(2)}/qtl with ${topOpportunity.name}!`);
          }}
        />
      )}
    </AppShell>
  );
}
