'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/navigation/AppShell';
import { OpportunityCard, OpportunityItem } from '../../components/OpportunityCard';
import { NRPBreakdownModal } from '../../components/NRPBreakdownModal';
import { NegotiationModal } from '../../components/NegotiationModal';
import { AggregationModal } from '../../components/AggregationModal';
import { Search, Filter, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Exact Canonical Ranked Opportunities from backend /api/opportunities/demo-lot-ramesh-18qtl
const CANONICAL_MARKETS_DATA: OpportunityItem[] = [
  {
    id: 'freshmart',
    rank: 1,
    name: 'FreshMart Foods',
    channelType: 'DIRECT_BUYER',
    buyerType: 'Corporate Processor',
    location: 'Chakan Industrial Zone, Pune',
    distanceKm: 42,
    providesPickup: true,
    grossPricePaise: 296000,
    nrpPaise: 292520, // ₹2,925.20/qtl
    totalRealizedPaise: 5265360,
    totalDeductionsPaise: 3480,
    netMarginOverBaselinePaise: 30320,
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
  },
  {
    id: 'hotel-grand',
    rank: 2,
    name: 'Hotel Grand Residency',
    channelType: 'DIRECT_BUYER',
    buyerType: 'Hospitality Chain',
    location: 'Shivajinagar, Pune',
    distanceKm: 55,
    providesPickup: false,
    grossPricePaise: 310000,
    nrpPaise: 299728, // ₹2,997.28/qtl
    totalRealizedPaise: 5395100,
    totalDeductionsPaise: 10272,
    netMarginOverBaselinePaise: 37528,
    trustScore: 0.66,
    paymentReliability: 0.70,
    verificationLevel: 'DOCUMENTS_SUBMITTED',
    paymentTerm: 'Bank Transfer (T+7 Days)',
    deductions: {
      transportPaise: 6722,
      loadingPaise: 2000,
      weighingPaise: 0,
      mandiFeePaise: 0,
      commissionPaise: 0,
      transitLossPaise: 1550,
    },
    recommendationReason:
      'Higher gross price, but farmer must arrange 55km transport and credit cycle is 7 days with lower buyer trust rating.',
    isEligible: true,
  },
  {
    id: 'pune-veggie',
    rank: 3,
    name: 'Pune Veggie Hub',
    channelType: 'DIRECT_BUYER',
    buyerType: 'Semi-Wholesaler',
    location: 'Hadapsar, Pune',
    distanceKm: 22,
    providesPickup: true,
    grossPricePaise: 285000,
    nrpPaise: 281575, // ₹2,815.75/qtl
    totalRealizedPaise: 5068350,
    totalDeductionsPaise: 3425,
    netMarginOverBaselinePaise: 19375,
    trustScore: 0.78,
    paymentReliability: 0.85,
    verificationLevel: 'DOCUMENTS_SUBMITTED',
    paymentTerm: 'Direct Bank Transfer (T+2)',
    deductions: {
      transportPaise: 0,
      loadingPaise: 2000,
      weighingPaise: 0,
      mandiFeePaise: 0,
      commissionPaise: 0,
      transitLossPaise: 1425,
    },
    recommendationReason:
      'Convenient local farmgate pickup with prompt settlement, but gross price is ₹110/qtl lower than FreshMart.',
    isEligible: true,
  },
  {
    id: 'rk-traders',
    rank: 4,
    name: 'RK Traders',
    channelType: 'DIRECT_BUYER',
    buyerType: 'Local Commission Agent',
    location: 'Nigdi, Pune',
    distanceKm: 15,
    providesPickup: true,
    grossPricePaise: 280000,
    nrpPaise: 276600, // ₹2,766.00/qtl
    totalRealizedPaise: 4978800,
    totalDeductionsPaise: 3400,
    netMarginOverBaselinePaise: 14400,
    trustScore: 0.73,
    paymentReliability: 0.75,
    verificationLevel: 'DOCUMENTS_SUBMITTED',
    paymentTerm: 'Cash on Weighment (T+0)',
    deductions: {
      transportPaise: 0,
      loadingPaise: 2000,
      weighingPaise: 0,
      mandiFeePaise: 0,
      commissionPaise: 0,
      transitLossPaise: 1400,
    },
    recommendationReason:
      'Fast same-day cash payment, but lower price realization.',
    isEligible: true,
  },
  {
    id: 'pune-apmc',
    rank: 5,
    name: 'Pune APMC (Gultekdi)',
    channelType: 'MANDI_APMC',
    buyerType: 'Physical Mandi Yard',
    location: 'Gultekdi Market Yard, Pune',
    distanceKm: 35,
    providesPickup: false,
    grossPricePaise: 310000,
    nrpPaise: 278722, // ₹2,787.22/qtl
    totalRealizedPaise: 5017000,
    totalDeductionsPaise: 31278,
    netMarginOverBaselinePaise: 16522,
    trustScore: 0.60,
    paymentReliability: 0.70,
    verificationLevel: 'APMC_REGULATED',
    paymentTerm: 'Commission Agent Credit (3-7 Days)',
    deductions: {
      transportPaise: 4278,
      loadingPaise: 4500,
      weighingPaise: 800,
      mandiFeePaise: 3100,
      commissionPaise: 12400,
      transitLossPaise: 6200,
    },
    recommendationReason:
      'High gross headline price (₹3,100), but net realization drops to ₹2,787/qtl due to 4% commission, transport, and 2% physical transit loss.',
    isEligible: true,
  },
  {
    id: 'talegaon',
    rank: 6,
    name: 'Talegaon Mandi',
    channelType: 'MANDI_APMC',
    buyerType: 'Physical Mandi Yard',
    location: 'Talegaon Dabhade, Pune',
    distanceKm: 18,
    providesPickup: false,
    grossPricePaise: 290000,
    nrpPaise: 262200, // ₹2,622.00/qtl (Baseline)
    totalRealizedPaise: 4719600,
    totalDeductionsPaise: 27800,
    netMarginOverBaselinePaise: 0,
    trustScore: 0.60,
    paymentReliability: 0.70,
    verificationLevel: 'APMC_REGULATED',
    paymentTerm: 'Commission Agent Credit (3-5 Days)',
    deductions: {
      transportPaise: 2200,
      loadingPaise: 4500,
      weighingPaise: 800,
      mandiFeePaise: 2900,
      commissionPaise: 11600,
      transitLossPaise: 5800,
    },
    recommendationReason:
      'Local baseline market. Closest proximity (18 km), but heavy mandi deductions leave only ₹2,622/qtl in-hand.',
    isEligible: true,
  },
  {
    id: 'pimpri',
    rank: 7,
    name: 'Pimpri Market',
    channelType: 'MANDI_APMC',
    buyerType: 'Physical Mandi Yard',
    location: 'Pimpri-Chinchwad, Pune',
    distanceKm: 28,
    providesPickup: false,
    grossPricePaise: 295000,
    nrpPaise: 265628, // ₹2,656.28/qtl
    totalRealizedPaise: 4781300,
    totalDeductionsPaise: 29372,
    netMarginOverBaselinePaise: 3428,
    trustScore: 0.60,
    paymentReliability: 0.70,
    verificationLevel: 'APMC_REGULATED',
    paymentTerm: 'Commission Agent Credit',
    deductions: {
      transportPaise: 3422,
      loadingPaise: 4500,
      weighingPaise: 800,
      mandiFeePaise: 2950,
      commissionPaise: 11800,
      transitLossPaise: 5900,
    },
    recommendationReason:
      'Falling price trend and moderate net realization.',
    isEligible: true,
  },
  {
    id: 'agrifresh',
    rank: 8,
    name: 'AgriFresh Exports Ltd.',
    channelType: 'DIRECT_BUYER',
    buyerType: 'Institutional Exporter',
    location: 'Nashik Cargo Hub',
    distanceKm: 165,
    providesPickup: false,
    grossPricePaise: 320000, // ₹3,200/qtl highest market offer
    nrpPaise: 313819,
    totalRealizedPaise: 0,
    totalDeductionsPaise: 6181,
    netMarginOverBaselinePaise: 51619,
    trustScore: 0.92,
    paymentReliability: 0.96,
    verificationLevel: 'PLATFORM_VERIFIED',
    paymentTerm: 'Direct Settlement (T+1 on Delivery)',
    deductions: {
      transportPaise: 6500,
      loadingPaise: 2000,
      weighingPaise: 0,
      mandiFeePaise: 0,
      commissionPaise: 0,
      transitLossPaise: 1600,
    },
    recommendationReason:
      'Highest gross price in Maharashtra (₹3,200/qtl). Ineligible for individual 18 Qtl harvest lot. Unlocks with FPO collective pooling.',
    isEligible: false,
    ineligibilityReason:
      'Minimum lot threshold is 50 Quintals. Your harvest lot is 18 Quintals. Pool with local cluster farmers (Suresh & Meena) to unlock this institutional contract.',
  },
];

export default function MarketsPage() {
  const { user, isDemoMode, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [filterPickup, setFilterPickup] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [inspectingOpportunity, setInspectingOpportunity] = useState<OpportunityItem | null>(null);
  const [negotiatingOpportunity, setNegotiatingOpportunity] = useState<OpportunityItem | null>(null);
  const [showAggregationModal, setShowAggregationModal] = useState(false);

  const quantityQtl = 18;

  const marketsSubtitle = isDemoMode
    ? 'Full opportunity ranking for Ramesh Kumar (18 Qtl Tomato Hybrid). Displayed price ≠ actual in-hand net realization.'
    : isAuthenticated && user?.name
    ? `Full opportunity ranking for ${user.name}. Displayed price = actual in-hand net realization.`
    : 'Real-time transparent market opportunities across Maharashtra. Displayed price = actual in-hand net realization after transport & deductions.';

  // Filter opportunities
  const filtered = CANONICAL_MARKETS_DATA.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.location.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterPickup && !item.providesPickup) return false;
    if (filterVerified && item.verificationLevel !== 'PLATFORM_VERIFIED') return false;
    return true;
  });

  return (
    <AppShell
      badge="Market Discovery &amp; Ranking"
      title="Markets &amp; Verified Buyers"
      subtitle={marketsSubtitle}
      actions={
        <Link
          href="/fpo"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <span>FPO Pooling (Unlock AgriFresh)</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Station */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search buyer name, mandi yard, or location..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-neutral-200 text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterPickup(!filterPickup)}
              className={`px-3.5 py-1.5 rounded-full border transition-colors ${
                filterPickup
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              Farmgate Pickup Only
            </button>
            <button
              type="button"
              onClick={() => setFilterVerified(!filterVerified)}
              className={`px-3.5 py-1.5 rounded-full border transition-colors ${
                filterVerified
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              Platform Verified Only
            </button>
            <span className="text-neutral-400">|</span>
            <span className="text-neutral-500 font-medium">Showing {filtered.length} Channels</span>
          </div>
        </div>

        {/* Explainability Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Transparent Ranking Invariant:</strong> Headline gross prices mislead farmers. Pune APMC offers ₹3,100/qtl gross, but after transport (-₹43), loading (-₹45), weighing (-₹8), APMC cess (-₹31), commission (-₹124), and transit loss (-₹62), net realization is only <strong>₹2,787.22/qtl</strong>. FreshMart’s direct farmgate offer nets <strong>₹2,925.20/qtl</strong> in-hand.
          </p>
        </div>

        {/* Ranked Cards List */}
        <div className="space-y-4">
          {filtered.map((opp) => (
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

      {/* Modals */}
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
          onNegotiationComplete={(agreedPaise) => {
            setNegotiatingOpportunity(null);
            alert(`Contract Locked at ₹${(agreedPaise / 100).toFixed(2)}/qtl with FreshMart Foods!`);
          }}
        />
      )}

      {showAggregationModal && (
        <AggregationModal
          farmerQuantityQtl={quantityQtl}
          onClose={() => setShowAggregationModal(false)}
          onConfirmAggregation={() => {
            setShowAggregationModal(false);
            alert('Cluster pool created! 68 Qtl aggregated. AgriFresh Exports contract unlocked at ₹3,200/qtl.');
          }}
        />
      )}
    </AppShell>
  );
}
