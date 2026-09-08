'use client';

import React from 'react';
import { OpportunityItem } from './OpportunityCard';
import { XIcon, ShieldCheckIcon, AlertCircleIcon, ScaleIcon } from './icons';

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

  // Talegaon local baseline (engine validated benchmark)
  const baselineNRP = 2622;
  const baselineTotal = baselineNRP * lotQuantityQtl;
  const selectedTotal = nrpPerQtl * lotQuantityQtl;
  const netGainTotal = selectedTotal - baselineTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in text-left">
      <div className="liquid-glass-dark relative w-full max-w-2xl rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Rank #{opportunity.rank}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {opportunity.name}
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Net Realized Price (NRP) Audit Ledger • Harvest Lot: {lotQuantityQtl} Quintals Tomato Hybrid
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Headline Summary Card */}
        <div className="my-5 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-black to-black border border-emerald-500/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-gray-400 block mb-0.5">Offered Gross Quote</span>
              <span className="text-xl font-bold font-instrument text-white">
                ₹{grossPerQtl.toFixed(0)}
              </span>
              <span className="text-[10px] text-gray-500 block">per quintal</span>
            </div>

            <div>
              <span className="text-xs text-rose-400 block mb-0.5">Total Deductions</span>
              <span className="text-xl font-bold font-instrument text-rose-400">
                -₹{totalDeductionsPerQtl.toFixed(0)}
              </span>
              <span className="text-[10px] text-gray-500 block">freight, mandi, loss</span>
            </div>

            <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-xs text-emerald-400 font-bold block mb-0.5">
                TRUE IN-HAND NRP
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-emerald-300">
                ₹{nrpPerQtl.toFixed(0)}
              </span>
              <span className="text-[10px] text-gray-400 block">per quintal</span>
            </div>
          </div>
        </div>

        {/* Line Item Deductions Table */}
        <div className="space-y-2.5 mb-6">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Deduction Itemization (Per Quintal Breakdown)
          </h3>
          <div className="divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden text-xs bg-black/30">
            <div className="flex justify-between p-3.5 bg-white/[0.04] font-semibold text-gray-200">
              <span>Gross Modal / Offer Price</span>
              <span className="text-emerald-300 font-bold">₹{grossPerQtl.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-3.5 hover:bg-white/[0.02]">
              <div>
                <span className="text-gray-200 font-medium">Transport &amp; Freight Charge</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  {opportunity.providesPickup
                    ? '0 km (Buyer arranged farmgate pickup)'
                    : `${opportunity.distanceKm} km transit @ ₹22/km base rate`}
                </span>
              </div>
              <span className="text-rose-400 font-semibold">
                {transportPerQtl > 0 ? `-₹${transportPerQtl.toFixed(2)}` : '₹0.00 (Farmgate Pickup)'}
              </span>
            </div>

            <div className="flex justify-between p-3.5 hover:bg-white/[0.02]">
              <div>
                <span className="text-gray-200 font-medium">Loading / Unloading Labor</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  {opportunity.channelType === 'MANDI_APMC' ? 'Mandi Hamali fee' : 'Direct Buyer dock handling'}
                </span>
              </div>
              <span className="text-rose-400 font-semibold">-₹{loadingPerQtl.toFixed(2)}</span>
            </div>

            {opportunity.channelType === 'MANDI_APMC' && (
              <>
                <div className="flex justify-between p-3.5 hover:bg-white/[0.02]">
                  <div>
                    <span className="text-gray-200 font-medium">Weighment Charge</span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">APMC electronic weighbridge</span>
                  </div>
                  <span className="text-rose-400 font-semibold">-₹{weighingPerQtl.toFixed(2)}</span>
                </div>

                <div className="flex justify-between p-3.5 hover:bg-white/[0.02]">
                  <div>
                    <span className="text-gray-200 font-medium">APMC Mandi Cess / User Fee (1%)</span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">Regulated APMC market infrastructure fee</span>
                  </div>
                  <span className="text-rose-400 font-semibold">-₹{mandiFeePerQtl.toFixed(2)}</span>
                </div>

                <div className="flex justify-between p-3.5 hover:bg-white/[0.02]">
                  <div>
                    <span className="text-gray-200 font-medium">Commission Agent Fee (4%)</span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">Adhatiya service commission</span>
                  </div>
                  <span className="text-rose-400 font-semibold">-₹{commissionPerQtl.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between p-3.5 hover:bg-white/[0.02]">
              <div>
                <span className="text-gray-200 font-medium">Expected Spoilage &amp; Transit Loss</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  {opportunity.channelType === 'MANDI_APMC' ? '2.0% (transit + yard wait)' : '0.5% (cold container pickup)'}
                </span>
              </div>
              <span className="text-rose-400 font-semibold">-₹{transitLossPerQtl.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-emerald-950/60 font-bold border-t border-emerald-500/30 text-sm">
              <span className="text-emerald-200">Net Realized Price (True In-Hand)</span>
              <span className="text-emerald-300 font-instrument text-base font-bold">
                ₹{nrpPerQtl.toFixed(2)} / qtl
              </span>
            </div>
          </div>
        </div>

        {/* Baseline Comparison Value Added */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 font-semibold">
            <ScaleIcon className="w-4 h-4 text-emerald-400" />
            <span>Comparison: Baseline Local Village Trader (Distress Sale)</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 block">Talegaon Baseline Net</span>
              <span className="text-sm font-semibold text-gray-300 font-instrument">
                ₹{baselineNRP.toLocaleString('en-IN')}/qtl • Total: ₹{baselineTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Net Pure Profit Added</span>
              <span className="text-base font-bold text-emerald-400 font-instrument">
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
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}
