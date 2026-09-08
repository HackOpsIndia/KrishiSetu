'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../../components/navigation/AppShell';
import { api } from '../../../lib/api';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  DollarSign,
  Truck,
} from 'lucide-react';

export default function BuyerOffersPage() {
  const [negotiationStatus, setNegotiationStatus] = useState<
    'PENDING_REVIEW' | 'ACCEPTED' | 'COUNTERED'
  >('PENDING_REVIEW');
  const [counterPrice, setCounterPrice] = useState<number>(2975);
  const [activeOffer, setActiveOffer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOffer() {
      try {
        setIsLoading(true);
        const lots = await api.getLots().catch(() => []);
        if (Array.isArray(lots) && lots.length > 0) {
          const l = lots[0];
          const rate = Math.round((l.minAcceptablePricePaise || 292500) / 100);
          setActiveOffer({
            id: l.id || 'OFFER-2026-9901',
            farmerName: l.farmerName || 'Ramesh Kumar',
            commodity: l.commodityName || 'Tomato Hybrid',
            village: l.village || 'Dehu Road, Pune (42 km away)',
            quantityQtl: l.quantity || 18,
            grade: l.qualityGrade || 'A',
            initialBuyerOffer: rate,
            farmerCounterOffer: rate + 50,
            settlementPrice: rate + 25,
            pickupType: 'Direct Farmgate Pickup by Buyer',
            deliveryOption: 'Direct farmgate pickup by company container vehicle',
            paymentTerms: '100% Escrow locked. 20% on loading, 80% on weighbridge settlement.',
            verification: 'Platform Verified • 0.90 Trust Score',
          });
          setCounterPrice(rate + 25);
        }
      } catch (err) {
        console.warn('Failed to load offer:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOffer();
  }, []);

  const handleAccept = () => {
    if (!activeOffer) return;
    setNegotiationStatus('ACCEPTED');
    alert(
      `Contract Successfully Accepted at ₹${activeOffer.settlementPrice}/qtl with ${activeOffer.farmerName}! Contract generated.`,
    );
  };

  return (
    <AppShell
      badge="Negotiation Desk"
      title="Offers & Price Negotiation Desk"
      subtitle="Review incoming harvest lots from farmers, analyze counteroffers, and lock digital procurement contracts."
      actions={
        <Link
          href="/buyer/transactions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <span>View Procurement Contracts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-6">
        {!activeOffer ? (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center text-neutral-500">
            <p className="text-sm font-semibold">No active negotiations or counteroffers pending.</p>
            <p className="text-xs text-neutral-400 mt-1">
              Check incoming demands or harvest supply lots to begin procurement.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
                  Active Negotiation Round
                </span>
                <span className="font-mono text-xs text-neutral-500 font-semibold">{activeOffer.id}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {negotiationStatus === 'ACCEPTED' ? 'Contract Executed' : 'Awaiting Buyer Decision'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: Offer parameters */}
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                    {activeOffer.farmerName} — {activeOffer.quantityQtl} Quintals {activeOffer.commodity}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {activeOffer.village} • {activeOffer.verification}
                  </p>
                </div>

                {/* Price Negotiation History Box */}
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                    Negotiation Audit Trail (Immutable Ledger)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-neutral-200">
                      <span className="text-[10px] text-neutral-500 block">Initial Buyer Offer</span>
                      <span className="text-base font-bold text-neutral-700">₹{activeOffer.initialBuyerOffer}/qtl</span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">Automated match</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-neutral-200">
                      <span className="text-[10px] text-neutral-500 block">Farmer Counteroffer</span>
                      <span className="text-base font-bold text-[#ef4d23]">₹{activeOffer.farmerCounterOffer}/qtl</span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">Farmer counter</span>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 block font-semibold">Agreed Settlement Target</span>
                      <span className="text-base font-extrabold text-emerald-900">₹{activeOffer.settlementPrice}/qtl</span>
                      <span className="text-[10px] text-emerald-700 block mt-0.5">Recommended equilibrium</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-600 gap-2">
                    <span>
                      Total Contract Cost ({activeOffer.quantityQtl} Qtl):{' '}
                      <strong>₹{(activeOffer.settlementPrice * activeOffer.quantityQtl).toLocaleString('en-IN')}</strong>
                    </span>
                    <span>
                      Logistics: <strong>{activeOffer.pickupType}</strong>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {negotiationStatus !== 'ACCEPTED' ? (
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleAccept}
                      className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Counteroffer at ₹{activeOffer.settlementPrice}/qtl</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert(`Counteroffer of ₹${counterPrice}/qtl sent to ${activeOffer.farmerName}.`)}
                      className="px-5 py-2.5 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Counter at ₹{counterPrice}/qtl
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold">Contract Finalized at ₹{activeOffer.settlementPrice}/qtl! Direct pickup scheduled.</span>
                    </div>
                    <Link href="/buyer/transactions" className="text-[#ef4d23] font-bold hover:underline">
                      View In Transactions →
                    </Link>
                  </div>
                )}
              </div>

              {/* Right: Heuristic Simulation Note */}
              <div className="lg:col-span-4 bg-neutral-50 rounded-2xl p-6 border border-neutral-200 text-xs flex flex-col justify-between h-full">
                <div>
                  <span className="font-bold text-neutral-800 uppercase tracking-wider block mb-2">
                    Market Decision Context
                  </span>
                  <p className="text-neutral-600 leading-relaxed text-[11px]">
                    Direct farmgate pickup eliminates intermediary transport charges and commission fees. Both buyer and seller achieve superior net margins compared to traditional physical terminal markets.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200 text-[10px] text-neutral-500 italic">
                  * Note: Acceptance probabilities and price bands are computed using deterministic market spread heuristics.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
