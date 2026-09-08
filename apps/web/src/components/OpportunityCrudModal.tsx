'use client';

import React, { useState } from 'react';
import { OpportunityItem } from './OpportunityCard';
import { api } from '../lib/api';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  CheckCircle2,
  Database,
  Truck,
  Building2,
  Coins,
  MapPin,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface OpportunityCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: OpportunityItem[];
  onRefresh: () => void;
}

export function OpportunityCrudModal({
  isOpen,
  onClose,
  opportunities,
  onRefresh,
}: OpportunityCrudModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [channelType, setChannelType] = useState<'DIRECT_BUYER' | 'MANDI_APMC'>('DIRECT_BUYER');
  const [buyerType, setBuyerType] = useState('Corporate Processor');
  const [location, setLocation] = useState('Chakan, Pune');
  const [distanceKm, setDistanceKm] = useState(35);
  const [providesPickup, setProvidesPickup] = useState(true);
  const [grossPriceRupees, setGrossPriceRupees] = useState(3000);
  const [loadingCostRupees, setLoadingCostRupees] = useState(20);
  const [transportCostRupees, setTransportCostRupees] = useState(0);
  const [paymentTerm, setPaymentTerm] = useState('Direct Bank Settlement (T+1)');
  const [recommendationReason, setRecommendationReason] = useState('');
  const [isEligible, setIsEligible] = useState(true);

  if (!isOpen) return null;

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const resetForm = () => {
    setName('');
    setChannelType('DIRECT_BUYER');
    setBuyerType('Corporate Processor');
    setLocation('Chakan, Pune');
    setDistanceKm(35);
    setProvidesPickup(true);
    setGrossPriceRupees(3000);
    setLoadingCostRupees(20);
    setTransportCostRupees(0);
    setPaymentTerm('Direct Bank Settlement (T+1)');
    setRecommendationReason('');
    setIsEligible(true);
    setEditingId(null);
    setIsCreating(false);
  };

  const handleStartEdit = (opp: OpportunityItem) => {
    setEditingId(opp.id);
    setName(opp.name);
    setChannelType(opp.channelType);
    setBuyerType(opp.buyerType || 'Agri Processor');
    setLocation(opp.location);
    setDistanceKm(opp.distanceKm);
    setProvidesPickup(opp.providesPickup);
    setGrossPriceRupees(Math.round(opp.grossPricePaise / 100));
    setLoadingCostRupees(Math.round((opp.deductions?.loadingPaise || 0) / 100));
    setTransportCostRupees(Math.round((opp.deductions?.transportPaise || 0) / 100));
    setPaymentTerm(opp.paymentTerm);
    setRecommendationReason(opp.recommendationReason || '');
    setIsEligible(opp.isEligible);
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Opportunity name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        channelType,
        buyerType: channelType === 'DIRECT_BUYER' ? buyerType : 'APMC Regulated Mandi',
        location: location.trim(),
        distanceKm: Number(distanceKm),
        providesPickup,
        grossPricePaise: Math.round(Number(grossPriceRupees) * 100),
        paymentTerm,
        isEligible,
        deductions: {
          transportPaise: Math.round(Number(transportCostRupees) * 100),
          loadingPaise: Math.round(Number(loadingCostRupees) * 100),
          weighingPaise: 0,
          mandiFeePaise: channelType === 'MANDI_APMC' ? 3100 : 0,
          commissionPaise: channelType === 'MANDI_APMC' ? 9000 : 0,
          transitLossPaise: providesPickup ? 1500 : 3000,
        },
        recommendationReason:
          recommendationReason.trim() ||
          `${providesPickup ? 'Direct pickup' : 'Farmer self-transport'} with ₹${grossPriceRupees}/qtl headline rate.`,
      };

      if (editingId) {
        await api.updateOpportunity(editingId, payload);
        showToast('success', `Updated "${name}" in database!`);
      } else {
        await api.createOpportunity(payload);
        showToast('success', `Created new opportunity "${name}" in database!`);
      }

      resetForm();
      onRefresh();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save opportunity in database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${itemTitle}" from the database?`)) return;

    try {
      await api.deleteOpportunity(id);
      showToast('success', `Deleted "${itemTitle}" from database.`);
      onRefresh();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete opportunity');
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all opportunities in the database back to original canonical records?')) return;

    try {
      await api.resetOpportunities();
      showToast('success', 'Database reset to canonical default opportunities.');
      onRefresh();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to reset database');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                Live Opportunity Database (CRUD)
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  PostgreSQL / Disk Store
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Create, inspect, update, or remove opportunities fetched in real-time by the platform.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Feedback */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isCreating) resetForm();
                  else setIsCreating(true);
                }}
                className="inline-flex items-center gap-2 bg-[#ef4d23] hover:bg-[#d83f18] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isCreating ? 'Cancel Form' : 'Add New Opportunity'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                title="Reset database to default seed opportunities"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="text-xs text-neutral-500 font-medium">
              Total Records in Database: <strong className="text-neutral-900">{opportunities.length}</strong>
            </div>
          </div>

          {/* Create / Edit Form */}
          {isCreating && (
            <form onSubmit={handleSave} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ef4d23]" />
                  <span>{editingId ? 'Edit Opportunity Record' : 'Create New Opportunity Record'}</span>
                </h3>
                <span className="text-[11px] text-neutral-400">Values auto-calculate Net Realizable Price</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Channel / Buyer Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sahyadri Agro Processor"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#ef4d23]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Channel Type</label>
                  <select
                    value={channelType}
                    onChange={(e) => setChannelType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#ef4d23]"
                  >
                    <option value="DIRECT_BUYER">DIRECT_BUYER (Private Processor / Hub)</option>
                    <option value="MANDI_APMC">MANDI_APMC (Regulated APMC Mandi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Location & Cluster</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Chakan Industrial Zone, Pune"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#ef4d23]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    min={1}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#ef4d23]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Gross Price (₹ / Quintal) *</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={grossPriceRupees}
                    onChange={(e) => setGrossPriceRupees(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#ef4d23] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Payment Settlement Terms</label>
                  <input
                    type="text"
                    value={paymentTerm}
                    onChange={(e) => setPaymentTerm(e.target.value)}
                    placeholder="e.g. Direct Bank Settlement (T+1 on Weighment)"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#ef4d23]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Loading Cost (₹ / Qtl)</label>
                  <input
                    type="number"
                    value={loadingCostRupees}
                    onChange={(e) => setLoadingCostRupees(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#ef4d23]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Transport Cost (₹ / Qtl)</label>
                  <input
                    type="number"
                    value={transportCostRupees}
                    onChange={(e) => setTransportCostRupees(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#ef4d23]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 font-medium">
                  <input
                    type="checkbox"
                    checked={providesPickup}
                    onChange={(e) => setProvidesPickup(e.target.checked)}
                    className="w-4 h-4 rounded text-[#ef4d23] focus:ring-[#ef4d23]"
                  />
                  <span>Provides Farmgate Pickup (Zero Transport Haulage)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 font-medium">
                  <input
                    type="checkbox"
                    checked={isEligible}
                    onChange={(e) => setIsEligible(e.target.checked)}
                    className="w-4 h-4 rounded text-[#ef4d23] focus:ring-[#ef4d23]"
                  />
                  <span>Currently Eligible for Individual Lot</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200/70 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Database...' : editingId ? 'Update Record' : 'Save to Database'}
                </button>
              </div>
            </form>
          )}

          {/* Database Items Table */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-600 font-bold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Rank / Name</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Gross Price</th>
                    <th className="py-3 px-4">Net In-Hand (NRP)</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4">Pickup</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-[10px] font-bold">
                            {opp.rank}
                          </span>
                          <div>
                            <div>{opp.name}</div>
                            <div className="text-[10px] text-neutral-400">{opp.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            opp.channelType === 'DIRECT_BUYER'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {opp.channelType === 'DIRECT_BUYER' ? 'Direct Buyer' : 'APMC Mandi'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        ₹{(opp.grossPricePaise / 100).toLocaleString('en-IN')}/qtl
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        ₹{(opp.nrpPaise / 100).toLocaleString('en-IN')}/qtl
                      </td>
                      <td className="py-3 px-4 text-rose-600 font-medium">
                        -₹{(opp.totalDeductionsPaise / 100).toLocaleString('en-IN')}/qtl
                      </td>
                      <td className="py-3 px-4">
                        {opp.providesPickup ? (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <Truck className="w-3 h-3 text-emerald-600" /> Yes
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400">Self</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(opp)}
                            className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Opportunity in Database"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(opp.id, opp.name)}
                            className="p-1.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Opportunity from Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Changes are committed directly to database storage.</span>
          </div>
          <button
            onClick={onClose}
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
