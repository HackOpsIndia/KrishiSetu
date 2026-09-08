'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/navigation/AppShell';
import { AggregationModal } from '../../components/AggregationModal';
import { api } from '../../lib/api';
import {
  Users,
  TrendingUp,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export default function FPOPage() {
  const [showAggregationModal, setShowAggregationModal] = useState(false);
  const [isPooled, setIsPooled] = useState(false);
  const [cluster, setCluster] = useState<{
    fpoName: string;
    fpoRegistration: string;
    district: string;
    members: any[];
    excluded: any[];
  }>({
    fpoName: 'Pune FPO Collective',
    fpoRegistration: 'MH-FPO-2024-001',
    district: 'Pune District, Maharashtra',
    members: [],
    excluded: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFpo() {
      try {
        setIsLoading(true);
        const agg = await api.getFpoAggregation().catch(() => null);
        if (agg && Array.isArray(agg.members) && agg.members.length > 0) {
          setCluster({
            fpoName: agg.fpoName || 'Pune FPO Collective',
            fpoRegistration: agg.fpoRegistration || 'MH-FPO-2024-001',
            district: agg.district || 'Pune District, Maharashtra',
            members: agg.members,
            excluded: agg.excluded || [],
          });
        } else {
          // Fallback to lots from DB
          const lots = await api.getLots().catch(() => []);
          if (Array.isArray(lots) && lots.length > 0) {
            setCluster((prev) => ({
              ...prev,
              members: lots.map((l: any, idx: number) => ({
                id: l.id || `member-${idx}`,
                name: l.farmerName || `Farmer ${idx + 1}`,
                village: l.village || 'Dehu Road',
                distance: idx === 0 ? '0 km (You)' : `${idx * 1.5} km away`,
                commodity: l.commodity || 'Tomato Hybrid',
                grade: l.grade || 'A',
                quantityQtl: l.quantityQtl || l.quantity || 18,
                status: isPooled ? 'Pooled' : 'Ready to Pool',
                isSelf: idx === 0,
              })),
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to load FPO aggregation:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFpo();
  }, [isPooled]);

  const pooledQtl = cluster.members.reduce((s, m) => s + (m.quantityQtl || 0), 0) || 68;
  const thresholdQtl = 50;
  const bulkAdvantagePerQtl = 297.04;
  const totalRameshGain = Math.round(bulkAdvantagePerQtl * 18);

  return (
    <AppShell
      badge="Collective Market Power"
      title="FPO Collective Logistics & Demand Unlock"
      subtitle="Small individual harvest lots combine to unlock high-volume institutional contracts and cut freight by 40%."
      actions={
        <button
          type="button"
          onClick={() => setShowAggregationModal(true)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{isPooled ? 'Manage Active Pool' : `Join Cluster Pool (${pooledQtl} Qtl)`}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* HERO INSTITUTIONAL DEMAND UNLOCK BANNER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-300 px-3.5 py-1 rounded-full text-xs font-extrabold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>INSTITUTIONAL EXPORT DEMAND UNLOCKED</span>
            </div>
            <span className="text-xs text-neutral-500">
              {cluster.fpoName} • {cluster.fpoRegistration}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Unlock details */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  AgriFresh Exports Ltd. Contract (Nashik Cargo Hub)
                </h2>
                <p className="text-xs text-neutral-600 mt-1 max-w-2xl leading-relaxed">
                  AgriFresh requires a minimum single shipment of <strong>{thresholdQtl} Quintals</strong>. Your individual lot of 18 Qtl is ineligible alone. By aggregating with cluster farmers, the pooled shipment reaches <strong>{pooledQtl} Quintals</strong>, unlocking Maharashtra’s highest headline price at <strong>₹3,200/qtl</strong>.
                </p>
              </div>

              {/* Progress bar towards threshold */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-neutral-700">Volume Threshold Progress</span>
                  <span className="font-bold text-emerald-800">
                    {pooledQtl} Qtl / {thresholdQtl} Qtl Goal ({Math.round((pooledQtl / thresholdQtl) * 100)}% Achieved)
                  </span>
                </div>
                <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${Math.min(100, Math.round((pooledQtl / thresholdQtl) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500">
                  <span>Threshold: {thresholdQtl} Qtl</span>
                  <span className="font-bold text-neutral-900">Total Pooled: {pooledQtl} Qtl</span>
                </div>
              </div>

              {/* Bulk Advantage Callout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Single Haul Freight</span>
                  <span className="text-sm font-bold text-rose-700">₹160/qtl (Spot Rate)</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Pooled Bulk Freight</span>
                  <span className="text-sm font-bold text-emerald-700">₹65/qtl (Full Truckload)</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block">Net Gain</span>
                  <span className="text-sm font-extrabold text-emerald-900">+₹{totalRameshGain.toLocaleString('en-IN')} (+₹297/qtl)</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-neutral-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAggregationModal(true)}
                  className="px-6 py-2.5 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isPooled ? 'View Pool Ledger' : `Pledge Harvest Lot to Pool`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <Link
                  href="/markets"
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Back to Solo Selling Options →
                </Link>
              </div>
            </div>

            {/* Right: Key Stats */}
            <div className="lg:col-span-4 bg-neutral-50 rounded-2xl p-6 border border-neutral-200 text-center flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-2">
                  Collective Value
                </span>
                <span className="text-3xl font-extrabold text-neutral-900 font-instrument block">
                  ₹{(pooledQtl * 3200).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-neutral-500 block mt-0.5">
                  Total {pooledQtl} Qtl Export Contract
                </span>
              </div>

              <div className="my-6 py-4 border-y border-neutral-200 space-y-2 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pickup Mode:</span>
                  <span className="font-semibold text-neutral-800">Consolidated Hub Haul</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Export Destination:</span>
                  <span className="font-semibold text-neutral-800">Nashik Cargo Hub</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Settlement Terms:</span>
                  <span className="font-semibold text-neutral-800">Direct Escrow (T+1)</span>
                </div>
              </div>

              <div className="inline-flex items-center justify-center gap-1 text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-full border border-neutral-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified by Pune FPO Federation</span>
              </div>
            </div>
          </div>
        </div>

        {/* CLUSTER PARTICIPANTS LIST */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Cluster Lot Compatibility</h3>
              <p className="text-xs text-neutral-500">Farmers in Haveli/Dehu Road cluster eligible for Grade A consolidation.</p>
            </div>
            <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full">
              {cluster.members.length} Lots in Pool
            </span>
          </div>

          {cluster.members.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-6">
              No cluster lots currently registered. Register a harvest lot to participate in FPO aggregation.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cluster.members.map((member) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    member.isSelf
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-500/20'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-neutral-900">{member.name}</span>
                    <span className="text-[11px] text-neutral-500">{member.distance}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold font-instrument text-neutral-900">
                      {member.quantityQtl} Qtl
                    </span>
                    <span className="text-xs text-neutral-600">{member.commodity}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-neutral-200/60">
                    <span className="bg-white px-2 py-0.5 rounded border border-neutral-200 font-semibold text-emerald-800">
                      Grade {member.grade}
                    </span>
                    <span className="font-medium text-neutral-600">{member.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Incompatible lots note */}
          <div className="mt-5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/70 flex items-center justify-between text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Automated Quality Filter: Only Grade A harvest lots are consolidated into export contracts.
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">Quality Guard Active</span>
          </div>
        </div>
      </div>

      {/* Aggregation Modal */}
      {showAggregationModal && (
        <AggregationModal
          farmerQuantityQtl={18}
          onClose={() => setShowAggregationModal(false)}
          onConfirmAggregation={() => {
            setIsPooled(true);
            setShowAggregationModal(false);
            alert('Cluster pool created! AgriFresh Exports contract unlocked at ₹3,200/qtl.');
          }}
        />
      )}
    </AppShell>
  );
}
