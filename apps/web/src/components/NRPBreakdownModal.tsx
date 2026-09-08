'use client';

import React from 'react';
import { OpportunityItem } from './OpportunityCard';
import { X, ShieldCheck, AlertCircle, Scale } from 'lucide-react';

interface NRPBreakdownModalProps {
  opportunity: OpportunityItem | null;
  lotQuantityQtl: number;
  onClose: () => void;
}

export function NRPBreakdownModal({ opportunity, lotQuantityQtl, onClose }: NRPBreakdownModalProps) {
  if (!opportunity) return null;

  const grossPerQtl = opportunity.grossPricePaise / 100;
  const nrpPerQtl = opportunity.nrpPaise / 100;
  const deductions = opportunity.deductions;

  const transportPerQtl = deductions.transportPaise / 100;
  const loadingPerQtl = deductions.loadingPaise / 100;
  const weighingPerQtl = deductions.weighingPaise / 100;
  const mandiFeePerQtl = deductions.mandiFeePaise / 100;
  const commissionPerQtl = deductions.commissionPaise / 100;
  const transitLossPerQtl = deductions.transitLossPaise / 100;
  const totalDeductionsPerQtl = opportunity.totalDeductionsPaise / 100;

  // Baseline benchmark
  const baselineNRP = 2628;
  const baselineTotal = baselineNRP * lotQuantityQtl;
  const selectedTotal = nrpPerQtl * lotQuantityQtl;
  const netGainTotal = selectedTotal - baselineTotal;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn text-left">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-neutral-200 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[92vh] text-neutral-900">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Rank #{opportunity.rank} Channel
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {opportunity.channelType === 'DIRECT_BUYER' ? 'Direct Institutional Buyer' : 'Regulated APMC Yard'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              {opportunity.name}
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Net Realized Price (NRP) Audit Ledger • Harvest Lot: {lotQuantityQtl} Quintals Tomato Hybrid
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Headline Summary Card */}
        <div className="my-5 p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-neutral-500 font-medium block mb-0.5">Offered Gross Quote</span>
              <span className="text-xl font-bold text-neutral-900">
                ₹{grossPerQtl.toFixed(0)}
              </span>
              <span className="text-[11px] text-neutral-500 block">per quintal</span>
            </div>

            <div>
              <span className="text-xs text-rose-600 font-medium block mb-0.5">Total Deductions</span>
              <span className="text-xl font-bold text-rose-600">
                -₹{totalDeductionsPerQtl.toFixed(0)}
              </span>
              <span className="text-[11px] text-neutral-500 block">freight, mandi, loss</span>
            </div>

            <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-xs text-emerald-800 font-extrabold block mb-0.5">
                TRUE IN-HAND NRP
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                ₹{nrpPerQtl.toFixed(0)}
              </span>
              <span className="text-[11px] text-neutral-600 font-medium block">per quintal</span>
            </div>
          </div>
        </div>

        {/* Line Item Deductions Table */}
        <div className="space-y-2.5 mb-6">
          <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Deduction Itemization (Per Quintal Breakdown)
          </h3>
          <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden text-xs bg-white shadow-xs">
            <div className="flex justify-between p-3.5 bg-neutral-50 font-bold text-neutral-800">
              <span>Gross Modal / Offer Price</span>
              <span className="text-emerald-700 font-extrabold">₹{grossPerQtl.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-3.5 hover:bg-neutral-50 transition-colors">
              <div>
                <span className="text-neutral-800 font-semibold">Transport &amp; Freight Charge</span>
                <span className="text-[11px] text-neutral-500 block mt-0.5">
                  {opportunity.providesPickup
                    ? '0 km (Buyer arranged farmgate pickup)'
                    : `${opportunity.distanceKm} km transit @ ₹22/km base rate`}
                </span>
              </div>
              <span className="text-rose-600 font-bold">
                {transportPerQtl > 0 ? `-₹${transportPerQtl.toFixed(2)}` : '₹0.00 (Farmgate Pickup)'}
              </span>
            </div>

            <div className="flex justify-between p-3.5 hover:bg-neutral-50 transition-colors">
              <div>
                <span className="text-neutral-800 font-semibold">Loading / Unloading Labor</span>
                <span className="text-[11px] text-neutral-500 block mt-0.5">
                  {opportunity.channelType === 'MANDI_APMC' ? 'Mandi Hamali fee' : 'Direct Buyer dock handling'}
                </span>
              </div>
              <span className="text-rose-600 font-bold">-₹{loadingPerQtl.toFixed(2)}</span>
            </div>

            {opportunity.channelType === 'MANDI_APMC' && (
              <>
                <div className="flex justify-between p-3.5 hover:bg-neutral-50 transition-colors">
                  <div>
                    <span className="text-neutral-800 font-semibold">Weighment Charge</span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">APMC electronic weighbridge</span>
                  </div>
                  <span className="text-rose-600 font-bold">-₹{weighingPerQtl.toFixed(2)}</span>
                </div>

                <div className="flex justify-between p-3.5 hover:bg-neutral-50 transition-colors">
                  <div>
                    <span className="text-neutral-800 font-semibold">APMC Mandi Cess / User Fee (1%)</span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">Regulated APMC market infrastructure fee</span>
                  </div>
                  <span className="text-rose-600 font-bold">-₹{mandiFeePerQtl.toFixed(2)}</span>
                </div>

                <div className="flex justify-between p-3.5 hover:bg-neutral-50 transition-colors">
                  <div>
                    <span className="text-neutral-800 font-semibold">Commission Agent Fee (4%)</span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">Adhatiya service commission</span>
                  </div>
                  <span className="text-rose-600 font-bold">-₹{commissionPerQtl.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between p-3.5 hover:bg-neutral-50 transition-colors">
              <div>
                <span className="text-neutral-800 font-semibold">Expected Spoilage &amp; Transit Loss</span>
                <span className="text-[11px] text-neutral-500 block mt-0.5">
                  {opportunity.channelType === 'MANDI_APMC' ? '2.0% (transit + yard wait)' : '0.5% (cold container pickup)'}
                </span>
              </div>
              <span className="text-rose-600 font-bold">-₹{transitLossPerQtl.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-emerald-50/80 font-bold border-t border-emerald-200 text-sm">
              <span className="text-emerald-950">Net Realized Price (True In-Hand)</span>
              <span className="text-emerald-800 text-base font-extrabold">
                ₹{nrpPerQtl.toFixed(2)} / qtl
              </span>
            </div>
          </div>
        </div>

        {/* Baseline Comparison */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 mb-6">
          <div className="flex items-center gap-2 text-xs text-neutral-700 mb-2 font-bold">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Comparison: Baseline Local Village Trader (Distress Sale)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-neutral-500 block">Talegaon Baseline Net</span>
              <span className="text-sm font-semibold text-neutral-800">
                ₹{baselineNRP.toLocaleString('en-IN')}/qtl • Total: ₹{baselineTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block">Net Pure Profit Added</span>
              <span className="text-base font-extrabold text-emerald-700">
                +₹{(nrpPerQtl - baselineNRP).toFixed(0)}/qtl • +₹{netGainTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#09090b] hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}
