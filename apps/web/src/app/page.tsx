'use client';

import React, { useState, useEffect } from 'react';
import { OpportunityCard, OpportunityItem } from '../components/OpportunityCard';
import { NRPBreakdownModal } from '../components/NRPBreakdownModal';
import { AggregationModal } from '../components/AggregationModal';
import { NegotiationModal } from '../components/NegotiationModal';
import { OpportunityCrudModal } from '../components/OpportunityCrudModal';
import { ImpactCard } from '../components/ImpactCard';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { MotionHero } from '../components/MotionHero';
import { ProductMosaic } from '../components/ProductMosaic';
import { LiquidGlassFooter } from '../components/LiquidGlassFooter';
import { api } from '../lib/api';
import { 
  SproutIcon, 
  UsersIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  MapPinIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  TruckIcon
} from '../components/icons';
import { Database, RefreshCw, Plus } from 'lucide-react';

export default function HomePage() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [isLoadingOpps, setIsLoadingOpps] = useState<boolean>(true);
  const [showDbCrudModal, setShowDbCrudModal] = useState<boolean>(false);

  const [quantityQtl, setQuantityQtl] = useState<number>(18);
  const [transportRate, setTransportRate] = useState<number>(22);
  const [fuelMultiplier, setFuelMultiplier] = useState<number>(1.3);
  const [isResetting, setIsResetting] = useState(false);
  const [isAggregated, setIsAggregated] = useState(false);

  // Modals state
  const [inspectingOpportunity, setInspectingOpportunity] = useState<OpportunityItem | null>(null);
  const [negotiatingOpportunity, setNegotiatingOpportunity] = useState<OpportunityItem | null>(null);
  const [showAggregationModal, setShowAggregationModal] = useState(false);

  // Fetch opportunities dynamically from database API
  const loadOpportunities = async () => {
    try {
      setIsLoadingOpps(true);
      const data = await api.getOpportunities();
      if (Array.isArray(data) && data.length > 0) {
        setOpportunities(data);
      }
    } catch (err) {
      console.warn('[HomePage] Failed to fetch opportunities from DB API:', err);
    } finally {
      setIsLoadingOpps(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const handleResetDemo = () => {
    setIsResetting(true);
    setTimeout(() => {
      setQuantityQtl(18);
      setTransportRate(22);
      setFuelMultiplier(1.3);
      setIsAggregated(false);
      setIsResetting(false);
    }, 500);
  };

  const handleNegotiationSuccess = (agreedPricePaise: number) => {
    alert(`Deal successfully locked at ₹${(agreedPricePaise / 100).toLocaleString('en-IN')}/qtl with FreshMart Foods! Digital contract generated.`);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#ededed] text-neutral-900 flex flex-col font-inter selection:bg-[#ef4d23]/20 selection:text-[#ef4d23]">
      
      {/* 1. MOTIONSITES FULL-VIEWPORT HERO SECTION */}
      <section id="hero">
        <MotionHero
          onExploreClick={() => scrollToSection('opportunities')}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          opportunities={opportunities}
          quantityQtl={quantityQtl}
          onQuantityChange={setQuantityQtl}
          onOpenAggregation={() => setShowAggregationModal(true)}
        />
      </section>

      {/* 2. MOTIONSITES 5-PANEL PRODUCT LANDING MOSAIC */}
      <ProductMosaic />

      {/* 3. CANONICAL HARVEST LOT & FPO POOLING SECTION */}
      <section id="aggregation" className="w-full bg-[#ededed] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-3.5 py-1 shadow-sm text-xs font-semibold text-neutral-700 border border-neutral-200 mb-2.5">
                <UsersIcon className="w-3.5 h-3.5 text-[#ef4d23]" />
                <span>Cluster Logistics &amp; High-Volume Unlock</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
                Collective Freight &amp; Institutional Export Pooling
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm mt-1 max-w-2xl">
                Pool compatible harvest lots across your local cluster to bypass individual quantity minimums and slash per-quintal freight.
              </p>
            </div>

            {/* Quick jump to opportunities */}
            <button
              type="button"
              onClick={() => scrollToSection('opportunities')}
              className="self-start md:self-auto inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-900 font-semibold bg-white px-4 py-2 rounded-full border border-neutral-200 shadow-sm transition-colors"
            >
              <span>View All 4 Ranked Channels</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Farmer Profile Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ef4d23] shrink-0">
                <SproutIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-neutral-900">Ramesh Kumar</h3>
                  <span className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-0.5 rounded-full border border-neutral-200 font-medium">
                    Smallholder Farmer
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3 text-emerald-600" /> Grade A Quality Verified
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                  <MapPinIcon className="w-3.5 h-3.5 text-neutral-400" /> Dehu Road Cluster, Haveli, Pune District, Maharashtra
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
              <div className="bg-neutral-50 px-4 py-2.5 rounded-2xl border border-neutral-200/70 text-center">
                <span className="text-neutral-500 block text-[10px]">Harvest Lot</span>
                <span className="text-base font-bold text-neutral-900">18 Quintals</span>
              </div>
              <div className="bg-neutral-50 px-4 py-2.5 rounded-2xl border border-neutral-200/70 text-center">
                <span className="text-neutral-500 block text-[10px]">Crop Variety</span>
                <span className="text-base font-bold text-neutral-900">Tomato Hybrid</span>
              </div>
              <div className="bg-neutral-50 px-4 py-2.5 rounded-2xl border border-neutral-200/70 text-center">
                <span className="text-neutral-500 block text-[10px]">Harvest Date</span>
                <span className="text-base font-bold text-neutral-900">Sep 6, 2026</span>
              </div>
            </div>
          </div>

          {/* FPO Pooling Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/20 text-left">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                  <SparklesIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Compatible Cluster Lot Found • Ready to Consolidate</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  Unlock AgriFresh Exports (₹3,200/qtl) by Pooling with Local Cluster
                </h3>

                <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
                  Suresh Patil (20 Qtl) and Meena Deshpande (30 Qtl) are harvesting compatible Grade A Tomato lots within 4.8 km. Combining into <strong>68 Qtl</strong> exceeds AgriFresh&apos;s 50 Qtl institutional minimum and slashes per-quintal freight from ₹160 to ₹65.
                </p>

                {/* Farmer Lot Tiles */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-neutral-900">Ramesh Kumar:</span>
                    <span className="text-neutral-600">18 Qtl (You)</span>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-semibold text-neutral-900">Suresh Patil:</span>
                    <span className="text-neutral-600">20 Qtl (3.2 km away)</span>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-semibold text-neutral-900">Meena Deshpande:</span>
                    <span className="text-neutral-600">30 Qtl (4.8 km away)</span>
                  </div>
                  <div className="bg-emerald-100 border border-emerald-300 rounded-xl px-3 py-1.5 text-xs flex items-center gap-1.5 font-bold text-emerald-900">
                    <span>Total: 68 Qtl (Exceeds 50 Qtl Threshold)</span>
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                <div className="text-left lg:text-right">
                  <span className="text-xs text-neutral-500 block">Total Net Realization Uplift</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-instrument">
                    +₹5,346 Gain
                  </span>
                  <span className="text-[11px] text-neutral-500 block">+₹297/qtl over local baseline</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAggregationModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ef4d23] hover:bg-[#d83f18] text-white px-6 py-3 rounded-full font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  <UsersIcon className="w-4 h-4" />
                  <span>Pool Lots &amp; Unlock AgriFresh</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 AI MARKET ASSISTANT SECTION (Section 29) */}
      <section className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8 border-y border-neutral-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1 text-xs font-semibold text-[#ef4d23] mb-3">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>AI-Powered Decision Layer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              From Market Data to Better Decisions
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
              KrishiSetu doesn&apos;t just show raw numbers. Our conversational market intelligence assistant translates complex APMC arrivals and buyer demand into clear, actionable advice.
            </p>
          </div>

          {/* 4-Step Visual Story Arc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Step 1 */}
            <div className="bg-[#fbfaf8] border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-100/80 text-[#ef4d23] flex items-center justify-center font-bold text-base mb-3">
                  🌾
                </div>
                <div className="text-[11px] font-bold text-[#ef4d23] uppercase tracking-wider mb-1">Step 1</div>
                <h3 className="font-bold text-neutral-900 text-sm mb-1">Market Data</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Real-time arrivals, modal prices, distance kilometers and buyer requirements across all active mandis.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200/60 text-[11px] text-neutral-400 font-mono">
                ↓ Feeds Intelligence
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#fbfaf8] border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold text-base mb-3">
                  ⚡
                </div>
                <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">Step 2</div>
                <h3 className="font-bold text-neutral-900 text-sm mb-1">AI Analysis</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Calculates freight deductions, moisture shrinkage risk, transit losses, and historical price trajectory.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200/60 text-[11px] text-neutral-400 font-mono">
                ↓ Generates Options
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#fbfaf8] border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-base mb-3">
                  💡
                </div>
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Step 3</div>
                <h3 className="font-bold text-neutral-900 text-sm mb-1">Simple Recommendation</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Provides side-by-side comparison, estimated net profit, and hold vs sell advice in clear Hindi or English.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200/60 text-[11px] text-neutral-400 font-mono">
                ↓ Empowers Grower
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#fbfaf8] border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold text-base mb-3">
                  🤝
                </div>
                <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">Step 4</div>
                <h3 className="font-bold text-neutral-900 text-sm mb-1">Farmer Decision</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Confident, informed selling with exact knowledge of net earnings, transport deductions, and FPO benefits.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200/60 text-[11px] text-neutral-400 font-mono">
                ✓ Maximum Net Return
              </div>
            </div>
          </div>

          {/* CTA Banner to Open Chatbot */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs text-amber-200 font-medium">
                <span>🤖</span>
                <span>Bilingual English / हिन्दी Voice & Text</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Try KrishiSetu AI Market Assistant Now
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
                Ask about wheat prices today, best nearby mandis, or calculate net returns for 20 quintals.
              </p>
            </div>

            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('open-krishisetu-ai', {
                    detail: { prompt: 'I have 20 quintals of wheat ready to sell. Which nearby mandi is offering the best price and whether I should sell now or wait?' },
                  }),
                );
              }}
              className="px-6 py-3.5 rounded-2xl bg-[#ef4d23] hover:bg-[#d84018] text-white font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Try KrishiSetu AI</span>
              <SparklesIcon className="w-4 h-4 text-amber-200" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. RANKED OPPORTUNITIES SECTION */}
      <section id="opportunities" className="w-full bg-[#ededed] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm text-xs font-semibold text-neutral-700 border border-neutral-200 mb-3">
              <SparklesIcon className="w-3.5 h-3.5 text-[#ef4d23]" />
              <span>Real-Time Net Realized Price (NRP) Ranking</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Ranked Market Selling Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
              Headline gross price is NOT what reaches your pocket. Our intelligence engine audits all deductions down to true in-hand realization.
            </p>
          </div>

          {/* Database CRUD & Management Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-neutral-800">
                Database Engine ({opportunities.length} active opportunities)
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                Live REST API
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadOpportunities}
                disabled={isLoadingOpps}
                className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                title="Refresh from Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOpps ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDbCrudModal(true)}
                className="inline-flex items-center gap-1.5 bg-[#ef4d23] hover:bg-[#d83f18] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Manage Database (CRUD)</span>
              </button>
            </div>
          </div>

          {/* Cards List */}
          {isLoadingOpps && opportunities.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500 flex flex-col items-center gap-3 bg-white rounded-3xl border border-neutral-200">
              <RefreshCw className="w-6 h-6 animate-spin text-[#ef4d23]" />
              <span>Fetching opportunities directly from database...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  quantityQtl={quantityQtl}
                  isTopRanked={opp.rank === 1}
                  onOpenBreakdown={(item) => setInspectingOpportunity(item)}
                  onOpenNegotiate={(item) => setNegotiatingOpportunity(item)}
                  onOpenAggregation={() => setShowAggregationModal(true)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. INTERACTIVE LOGISTICS SIMULATOR SECTION */}
      <section id="simulator" className="w-full bg-[#ededed] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScenarioSimulator
            quantity={quantityQtl}
            onQuantityChange={setQuantityQtl}
            transportRate={transportRate}
            onTransportRateChange={setTransportRate}
            fuelMultiplier={fuelMultiplier}
            onFuelMultiplierChange={setFuelMultiplier}
            onResetToDefaults={() => {
              setQuantityQtl(18);
              setTransportRate(22);
              setFuelMultiplier(1.3);
            }}
          />
        </div>
      </section>

      {/* 6. ECONOMIC IMPACT & VALUE REALIZATION SCORECARD */}
      <section id="impact" className="w-full bg-[#ededed] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ImpactCard quantityQtl={quantityQtl} />
        </div>
      </section>

      {/* 7. MOTIONSITES LIQUID GLASS FOOTER */}
      <LiquidGlassFooter />

      {/* MODALS */}
      {inspectingOpportunity && (
        <NRPBreakdownModal
          opportunity={inspectingOpportunity}
          lotQuantityQtl={quantityQtl}
          onClose={() => setInspectingOpportunity(null)}
        />
      )}

      {negotiatingOpportunity && (
        <NegotiationModal
          opportunity={negotiatingOpportunity}
          lotQuantityQtl={quantityQtl}
          onClose={() => setNegotiatingOpportunity(null)}
          onNegotiationComplete={handleNegotiationSuccess}
        />
      )}

      {showAggregationModal && (
        <AggregationModal
          farmerQuantityQtl={quantityQtl}
          onClose={() => setShowAggregationModal(false)}
          onConfirmAggregation={() => {
            setIsAggregated(true);
            setShowAggregationModal(false);
            alert('Cluster pool created! 68 Qtl aggregated. AgriFresh Exports contract unlocked at ₹3,200/qtl.');
          }}
        />
      )}

      {/* Live Database CRUD Modal */}
      <OpportunityCrudModal
        isOpen={showDbCrudModal}
        onClose={() => setShowDbCrudModal(false)}
        opportunities={opportunities}
        onRefresh={loadOpportunities}
      />
    </div>
  );
}
