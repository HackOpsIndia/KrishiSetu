'use client';

import React, { useState } from 'react';
import { OpportunityCard, OpportunityItem } from '../components/OpportunityCard';
import { NRPBreakdownModal } from '../components/NRPBreakdownModal';
import { AggregationModal } from '../components/AggregationModal';
import { NegotiationModal } from '../components/NegotiationModal';
import { ImpactCard } from '../components/ImpactCard';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { MotionHero } from '../components/MotionHero';
import { ProductMosaic } from '../components/ProductMosaic';
import { LiquidGlassFooter } from '../components/LiquidGlassFooter';
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

// Baseline opportunities aligned with canonical single source of truth
const BASE_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: 'freshmart',
    rank: 1,
    name: 'FreshMart Foods',
    channelType: 'DIRECT_BUYER',
    buyerType: 'Corporate Processor',
    location: 'Chakan Industrial Zone, Pune',
    distanceKm: 42,
    providesPickup: true,
    grossPricePaise: 296000, // ₹2,960/qtl
    nrpPaise: 292500, // ₹2,925/qtl (calculated after ₹20 loading + 0.5% transit loss)
    totalRealizedPaise: 292500 * 18, // ₹52,650
    totalDeductionsPaise: 3500, // ₹35/qtl
    netMarginOverBaselinePaise: 292500 - 262200, // +₹303/qtl over baseline
    trustScore: 0.90,
    paymentReliability: 0.95,
    verificationLevel: 'PLATFORM_VERIFIED',
    paymentTerm: 'Direct Bank Settlement (T+1 on Weighment)',
    deductions: {
      transportPaise: 0,
      loadingPaise: 2000, // ₹20/qtl
      weighingPaise: 0,
      mandiFeePaise: 0,
      commissionPaise: 0,
      transitLossPaise: 1500, // 0.5% of 2960 = ~₹15/qtl
    },
    recommendationReason:
      'Rank #1 Natural Choice: Direct farmgate pickup eliminates ₹22/km transport and APMC 5% fees. Delivers the highest net in-hand realization with platform-verified settlement.',
    isEligible: true,
  },
  {
    id: 'pune-apmc',
    rank: 2,
    name: 'Pune APMC (Gultekdi)',
    channelType: 'MANDI_APMC',
    location: 'Gultekdi Market Yard, Pune',
    distanceKm: 35,
    providesPickup: false,
    grossPricePaise: 310000, // ₹3,100/qtl gross headline
    nrpPaise: 278700, // ₹2,787/qtl net in-hand
    totalRealizedPaise: 278700 * 18, // ₹50,166
    totalDeductionsPaise: 31300, // ₹313/qtl physical deductions
    netMarginOverBaselinePaise: 278700 - 262200, // +₹165/qtl over baseline
    trustScore: 0.85,
    paymentReliability: 0.88,
    verificationLevel: 'APMC_REGULATED',
    paymentTerm: 'Traditional Commission Agent (3-7 Day Credit)',
    deductions: {
      transportPaise: 7700, // ₹77/qtl
      loadingPaise: 1500,
      weighingPaise: 500,
      mandiFeePaise: 3100, // 1.05% mandi fee
      commissionPaise: 9300, // Unofficial commission
      transitLossPaise: 9200, // 3.0% physical haulage loss
    },
    recommendationReason:
      'High gross price (₹3,100/qtl), but net realization drops to ₹2,787/qtl due to transit shrinkage, haulage, and market cess.',
    isEligible: true,
  },
  {
    id: 'pune-veggie',
    rank: 3,
    name: 'Pune Veggie Hub',
    channelType: 'DIRECT_BUYER',
    buyerType: 'Semi-Wholesaler',
    location: 'Hadapsar, Pune',
    distanceKm: 28,
    providesPickup: true,
    grossPricePaise: 280000, // ₹2,800/qtl
    nrpPaise: 274600, // ₹2,746/qtl
    totalRealizedPaise: 274600 * 18, // ₹49,428
    totalDeductionsPaise: 5400,
    netMarginOverBaselinePaise: 274600 - 262200,
    trustScore: 0.82,
    paymentReliability: 0.85,
    verificationLevel: 'DOCUMENTS_SUBMITTED',
    paymentTerm: 'Direct Bank Transfer (T+2)',
    deductions: {
      transportPaise: 0,
      loadingPaise: 2500,
      weighingPaise: 0,
      mandiFeePaise: 0,
      commissionPaise: 0,
      transitLossPaise: 2900,
    },
    recommendationReason:
      'Convenient local pickup with prompt payment. Slightly lower gross offer than FreshMart.',
    isEligible: true,
  },
  {
    id: 'agrifresh',
    rank: 4,
    name: 'AgriFresh Exports Ltd.',
    channelType: 'DIRECT_BUYER',
    buyerType: 'Institutional Exporter',
    location: 'Nashik Cargo Hub',
    distanceKm: 165,
    providesPickup: false,
    grossPricePaise: 320000, // ₹3,200/qtl highest market offer!
    nrpPaise: 295000,
    totalRealizedPaise: 0,
    totalDeductionsPaise: 25000,
    netMarginOverBaselinePaise: 32800,
    trustScore: 0.92,
    paymentReliability: 0.96,
    verificationLevel: 'PLATFORM_VERIFIED',
    paymentTerm: 'Direct Settlement (T+1 on Delivery)',
    deductions: {
      transportPaise: 16000,
      loadingPaise: 3000,
      weighingPaise: 0,
      mandiFeePaise: 0,
      commissionPaise: 0,
      transitLossPaise: 6000,
    },
    recommendationReason:
      'Highest gross price in Maharashtra (₹3,200/qtl). Ineligible for individual harvest lot (< 50 Qtl). Unlocks with FPO collective pooling.',
    isEligible: false,
    ineligibilityReason:
      'Minimum lot threshold is 50 Quintals. Your harvest lot is 18 Quintals. Pool with local cluster farmers (Suresh & Meena) to unlock this institutional contract.',
  },
];

export default function HomePage() {
  const [quantityQtl, setQuantityQtl] = useState<number>(18);
  const [transportRate, setTransportRate] = useState<number>(22);
  const [fuelMultiplier, setFuelMultiplier] = useState<number>(1.3);
  const [isResetting, setIsResetting] = useState(false);
  const [isAggregated, setIsAggregated] = useState(false);

  // Modals state
  const [inspectingOpportunity, setInspectingOpportunity] = useState<OpportunityItem | null>(null);
  const [negotiatingOpportunity, setNegotiatingOpportunity] = useState<OpportunityItem | null>(null);
  const [showAggregationModal, setShowAggregationModal] = useState(false);

  const opportunities = BASE_OPPORTUNITIES;

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

          {/* Cards List */}
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
    </div>
  );
}
