'use client';

import React, { useState } from 'react';
import { XIcon, UsersIcon, TruckIcon, SparklesIcon, CheckCircleIcon, ShieldCheckIcon } from './icons';

interface AggregationModalProps {
  farmerQuantityQtl: number;
  onClose: () => void;
  onConfirmAggregation: () => void;
}

export function AggregationModal({
  farmerQuantityQtl,
  onClose,
  onConfirmAggregation,
}: AggregationModalProps) {
  const [joined, setJoined] = useState(false);

  const neighbors = [
    {
      name: 'Suresh Patil',
      village: 'Dehu Road (1.2 km away)',
      quantity: 20,
      grade: 'Hybrid Grade A',
      status: 'Pledged to Pool',
      isSelf: false,
    },
    {
      name: 'Meena Deshpande',
      village: 'Talegaon Dabhade (4 km away)',
      quantity: 30,
      grade: 'Hybrid Grade A',
      status: 'Pledged to Pool',
      isSelf: false,
    },
    {
      name: 'Anita Shinde',
      village: 'Dehu (2 km away)',
      quantity: 25,
      grade: 'Hybrid Grade A',
      status: 'Pledged to Pool',
      isSelf: false,
    },
    {
      name: 'Ramesh Kumar (You)',
      village: 'Dehu Road, Pune',
      quantity: farmerQuantityQtl,
      grade: 'Hybrid Grade A',
      status: 'Ready for Pool Inclusion',
      isSelf: true,
    },
  ];

  const totalPooledQuantity = 20 + 30 + 25; // 75 quintals canonical cluster
  const minRequiredQuantity = 50; // AgriFresh minimum lot size

  // Economics from engine
  const individualWeightedNRP = 2628; // ₹2,628/qtl weighted average across Talegaon
  const pooledNRP = 2925; // ₹2,925/qtl pooled NRP
  const totalNrpAdvantagePerQtl = 297; // ₹297/qtl bulk advantage (+11.3%)
  const rameshTotalExtraProfit = totalNrpAdvantagePerQtl * farmerQuantityQtl; // ₹5,346 on 18 qtl

  // Institutional buyer unlock
  const institutionalBuyerName = 'AgriFresh Exports Ltd.';
  const institutionalOfferedPrice = 3200; // ₹3,200/qtl quote

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in text-left">
      <div className="liquid-glass-dark relative w-full max-w-2xl rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-gradient-to-r from-amber-400 to-emerald-400 text-black font-extrabold text-xs px-3 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                <SparklesIcon className="w-3.5 h-3.5 fill-black" />
                <span>FPO Collective Pooling</span>
              </span>
              <span className="text-xs text-emerald-400 font-mono">Pune FPO Cluster</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Aggregation Opportunity &amp; Institutional Export Unlock
            </h2>
            <p className="text-xs text-gray-400">
              3 compatible local farmers pooling 75 Qtl to satisfy institutional buyer minimum volume requirements.
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

        {/* Highlight Banner */}
        <div className="my-5 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-black to-black border border-emerald-500/40">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs text-gray-400 block mb-0.5">Compatible Pooled Lot</span>
              <span className="text-2xl sm:text-3xl font-bold font-instrument text-white">
                {totalPooledQuantity} Qtl
              </span>
              <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">
                3 Verified Farmers • Grade A
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-400 block mb-0.5">
                Unlocked (Min {minRequiredQuantity} Qtl)
              </span>
              <span className="text-sm font-bold text-white block">
                {institutionalBuyerName}
              </span>
              <span className="text-xs font-bold font-instrument text-emerald-300 block mt-0.5">
                ₹{institutionalOfferedPrice.toLocaleString('en-IN')}/qtl offer
              </span>
            </div>

            <div className="sm:border-l sm:border-white/10 sm:pl-4">
              <span className="text-xs text-emerald-400 font-bold block mb-0.5">
                Collective Bulk Advantage
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-instrument text-emerald-300">
                +₹{totalNrpAdvantagePerQtl}/qtl
              </span>
              <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">
                ₹{pooledNRP}/qtl vs ₹{individualWeightedNRP}/qtl individual
              </span>
            </div>
          </div>
        </div>

        {/* Demand Unlock Mechanism */}
        <div className="mb-5 p-4 rounded-2xl bg-blue-950/25 border border-blue-500/30 text-xs space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 text-blue-300 font-bold uppercase tracking-wider text-[11px]">
            <SparklesIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Demand Unlock Mechanism</span>
          </div>
          <p className="text-gray-300 text-xs">
            <strong>Before pooling:</strong> AgriFresh Exports requires <strong>50 Qtl minimum</strong>. Individual farmer lots (20 Qtl, 30 Qtl, 25 Qtl, 18 Qtl) are all individually restricted (&lt; 50 Qtl).
          </p>
          <p className="text-gray-300 text-xs">
            <strong>After pooling:</strong> Compatible pooled quantity reaches <strong>75 Qtl</strong> (&ge; 50 Qtl threshold).{' '}
            <strong className="text-emerald-300">AgriFresh demand is unlocked through smart FPO freight pooling.</strong>
          </p>
        </div>

        {/* Solo vs Aggregated Comparison */}
        <div className="mb-5 space-y-2.5">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Economic Impact Comparison (Engine-Validated)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="font-semibold text-gray-400 flex items-center justify-between">
                <span>Individual Distress Baseline</span>
                <span className="text-rose-400 font-medium">Mandi Deductions</span>
              </div>
              <div className="space-y-1 text-gray-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Weighted Average NRP:</span>
                  <span className="text-gray-200 font-medium font-instrument text-xs">₹{individualWeightedNRP}/qtl</span>
                </div>
                <div className="flex justify-between">
                  <span>AgriFresh Access:</span>
                  <span className="text-rose-400 font-medium">Restricted (&lt; 50 Qtl)</span>
                </div>
                <div className="flex justify-between">
                  <span>Logistics Efficiency:</span>
                  <span className="text-gray-400">Multiple partial vehicle trips</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="font-semibold text-emerald-300 flex items-center justify-between">
                <span>FPO Aggregated Sale</span>
                <span className="text-emerald-400 font-bold">+₹{totalNrpAdvantagePerQtl}/qtl Gain</span>
              </div>
              <div className="space-y-1 text-gray-300 text-[11px]">
                <div className="flex justify-between">
                  <span>Pooled Estimated NRP:</span>
                  <span className="text-emerald-300 font-bold font-instrument text-xs">₹{pooledNRP}/qtl</span>
                </div>
                <div className="flex justify-between">
                  <span>AgriFresh Access:</span>
                  <span className="text-emerald-400 font-bold">Unlocked &amp; Eligible (75 Qtl)</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Improvement:</span>
                  <span className="text-emerald-400 font-bold">+11.3% over individual baseline</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participating Farmers in the Pool */}
        <div className="mb-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider">
            <span>Aggregated Farmers in Cluster</span>
            <span className="text-[11px] font-normal text-emerald-400 flex items-center gap-1">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              <span>Verified FPO Members</span>
            </span>
          </div>

          <div className="border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden text-xs bg-black/30">
            {neighbors.map((n, i) => (
              <div
                key={i}
                className={`p-3.5 flex items-center justify-between ${
                  n.isSelf ? 'bg-emerald-950/40' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-emerald-300 font-instrument">
                    {n.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{n.name}</span>
                      {n.isSelf && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400">{n.village}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-white font-instrument text-sm">
                    {n.quantity} Qtl
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">{n.status}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-500 italic px-1">
            * Note: Neighbor Vijay Kulkarni (15 Qtl Tomato Grade B) was excluded automatically by the quality matching engine to protect buyer Grade A export specifications.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              setJoined(true);
              setTimeout(() => {
                onConfirmAggregation();
                onClose();
              }, 1000);
            }}
            disabled={joined}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-black font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {joined ? (
              <>
                <CheckCircleIcon className="w-4 h-4 text-black" />
                <span>Pledged to FPO Pool!</span>
              </>
            ) : (
              <>
                <UsersIcon className="w-4 h-4 text-black" />
                <span>Join Collective Pool (+₹{rameshTotalExtraProfit.toLocaleString('en-IN')} Extra Profit)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
