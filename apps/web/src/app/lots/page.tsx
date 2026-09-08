'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/navigation/AppShell';
import { api } from '../../lib/api';
import {
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';

export default function LotsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCrop, setNewCrop] = useState('Tomato');
  const [newVariety, setNewVariety] = useState('Hybrid');
  const [newGrade, setNewGrade] = useState('A');
  const [newQuantity, setNewQuantity] = useState('18');
  const [lots, setLots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLots = async () => {
    try {
      setIsLoading(true);
      const data = await api.getLots();
      if (Array.isArray(data)) {
        setLots(data);
      }
    } catch (err) {
      console.warn('Failed to load lots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLots();
  }, []);

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createLot({
        commodity: newCrop,
        variety: newVariety,
        grade: newGrade,
        quantityQtl: Number(newQuantity) || 10,
        minAcceptablePricePaise: 290000,
      });
      setLots([created, ...lots]);
      setShowCreateModal(false);
      alert('Harvest lot registered successfully!');
    } catch (err: any) {
      alert(`Error creating lot: ${err?.message || 'Server error'}`);
    }
  };

  const activeLot = lots.length > 0 ? lots[0] : null;

  return (
    <AppShell
      badge="Harvest Management"
      title="My Harvest Lots"
      subtitle="Manage your harvest lots, track quality grades, and evaluate buyer demand across Maharashtra."
      actions={
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Lot</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Active Lot Highlight Card */}
        {activeLot ? (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-500/80 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
                  Active Harvest Lot
                </span>
                <span className="text-xs text-neutral-500 font-mono">ID: {activeLot.id}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Ready for Sale • {activeLot.activeOffers || 1} Offers Received</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 mb-5">
              <div>
                <span className="text-[11px] text-neutral-500 block">Commodity & Grade</span>
                <span className="text-base font-bold text-neutral-900">
                  {activeLot.quantityQtl || activeLot.quantity} Qtl {activeLot.commodity || activeLot.commodityName} ({activeLot.variety || activeLot.varietyName || 'Hybrid'})
                </span>
                <span className="text-xs text-emerald-700 font-semibold block mt-0.5">
                  Grade {activeLot.grade || activeLot.qualityGrade || 'A'} Quality Verified
                </span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-500 block">Harvest Location</span>
                <span className="text-sm font-semibold text-neutral-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" /> {activeLot.location || 'Pune Cluster'}
                </span>
                <span className="text-xs text-neutral-500 block mt-0.5">{activeLot.harvestDate || 'Recent'}</span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-500 block">Optimal Match</span>
                <span className="text-sm font-bold text-neutral-900">{activeLot.bestOpportunity || 'Direct Buyer Hub'}</span>
                <span className="text-xs text-emerald-800 font-bold block mt-0.5">
                  NRP {activeLot.bestNRP || '₹2,925.20/qtl'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-500 block">Total Realization Value</span>
                <span className="text-xl font-bold font-instrument text-neutral-900">
                  {activeLot.expectedRealization || '₹52,653.60'}
                </span>
                <span className="text-xs text-emerald-700 font-bold block mt-0.5">
                  Top In-Hand Return
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-neutral-600">
                Matched with verified direct buyers and APMC mandis.
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/markets"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 text-white text-xs font-semibold transition-colors"
                >
                  <span>Find Ranked Buyers</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/fpo"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-colors"
                >
                  <span>Pool in FPO</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center text-neutral-500">
            <p className="text-sm font-semibold">No harvest lots currently recorded.</p>
            <p className="text-xs text-neutral-400 mt-1">
              Click "Create New Lot" to add your produce and discover verified buyers.
            </p>
          </div>
        )}

        {/* Lots List Table */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Lot History & Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Lot ID</th>
                  <th className="py-3 px-4">Commodity</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Quality Grade</th>
                  <th className="py-3 px-4">Harvest Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expected NRP</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {lots.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-neutral-500">
                      No harvest lots recorded yet. Click "Create New Lot" to add one.
                    </td>
                  </tr>
                ) : (
                  lots.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/60">
                      <td className="py-3 px-4 font-mono font-medium text-neutral-900">{item.id}</td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        {item.commodity || item.commodityName} ({item.variety || item.varietyName || 'Hybrid'})
                      </td>
                      <td className="py-3 px-4 font-bold">{item.quantityQtl || item.quantity} Qtl</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          Grade {item.grade || item.qualityGrade || 'A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">{item.harvestDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.status === 'LISTED' || item.status === 'READY'
                              ? 'bg-blue-50 text-blue-800'
                              : item.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900">{item.bestNRP || '₹2,925.20/qtl'}</td>
                      <td className="py-3 px-4 text-right">
                        <Link href="/markets" className="text-[#ef4d23] hover:underline font-semibold">
                          Compare →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Lot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-neutral-900">Register New Harvest Lot</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Commodity</label>
                <select
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs bg-neutral-50"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Potato">Potato</option>
                  <option value="Soybean">Soybean</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Variety</label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                    placeholder="e.g. Hybrid / Red"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Grade</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs bg-neutral-50"
                  >
                    <option value="A">Grade A (Export / Processing)</option>
                    <option value="B">Grade B (Domestic Wholesale)</option>
                    <option value="C">Grade C (Local Retail)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Harvest Quantity (Quintals)</label>
                <input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                  placeholder="e.g. 18"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white font-semibold"
                >
                  Publish Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
