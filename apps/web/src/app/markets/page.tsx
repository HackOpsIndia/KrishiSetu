'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/navigation/AppShell';
import { OpportunityCard, OpportunityItem } from '../../components/OpportunityCard';
import { NRPBreakdownModal } from '../../components/NRPBreakdownModal';
import { NegotiationModal } from '../../components/NegotiationModal';
import { AggregationModal } from '../../components/AggregationModal';
import { OpportunityCrudModal } from '../../components/OpportunityCrudModal';
import { Search, Filter, Sparkles, CheckCircle2, ShieldCheck, Database, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export default function MarketsPage() {
  const { user, isDemoMode, isAuthenticated } = useAuth();
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDbCrudModal, setShowDbCrudModal] = useState(false);

  const [search, setSearch] = useState('');
  const [filterPickup, setFilterPickup] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [inspectingOpportunity, setInspectingOpportunity] = useState<OpportunityItem | null>(null);
  const [negotiatingOpportunity, setNegotiatingOpportunity] = useState<OpportunityItem | null>(null);
  const [showAggregationModal, setShowAggregationModal] = useState(false);

  const quantityQtl = 18;

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      const data = await api.getOpportunities();
      if (Array.isArray(data) && data.length > 0) {
        setOpportunities(data);
      }
    } catch (err) {
      console.warn('[MarketsPage] Failed to fetch opportunities from DB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const marketsSubtitle = isDemoMode
    ? 'Full opportunity ranking for Ramesh Kumar (18 Qtl Tomato Hybrid). Displayed price ≠ actual in-hand net realization.'
    : isAuthenticated && user?.name
    ? `Full opportunity ranking for ${user.name}. Displayed price = actual in-hand net realization.`
    : 'Real-time transparent market opportunities across Maharashtra. Displayed price = actual in-hand net realization after transport & deductions.';

  // Filter opportunities
  const filtered = opportunities.filter((item) => {
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDbCrudModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Manage Database (CRUD)</span>
          </button>
          <Link
            href="/fpo"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>FPO Pooling (Unlock AgriFresh)</span>
          </Link>
        </div>
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

      {/* Live Database CRUD Modal */}
      <OpportunityCrudModal
        isOpen={showDbCrudModal}
        onClose={() => setShowDbCrudModal(false)}
        opportunities={opportunities}
        onRefresh={loadOpportunities}
      />
    </AppShell>
  );
}
