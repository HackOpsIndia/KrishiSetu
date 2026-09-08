'use client';

import React from 'react';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  ArrowRightIcon, 
  AlertCircleIcon, 
  SparklesIcon 
} from './icons';
import { Gauge } from './Gauge';

export interface OpportunityItem {
  id: string;
  rank: number;
  name: string;
  channelType: 'DIRECT_BUYER' | 'MANDI_APMC';
  buyerType?: string;
  location: string;
  distanceKm: number;
  providesPickup: boolean;
  grossPricePaise: number;
  nrpPaise: number;
  totalRealizedPaise: number;
  totalDeductionsPaise: number;
  netMarginOverBaselinePaise: number;
  trustScore: number;
  paymentReliability: number;
  verificationLevel: string;
  paymentTerm: string;
  deductions: {
    transportPaise: number;
    loadingPaise: number;
    weighingPaise: number;
    mandiFeePaise: number;
    commissionPaise: number;
    transitLossPaise: number;
  };
  recommendationReason: string;
  isEligible: boolean;
  ineligibilityReason?: string;
}

interface OpportunityCardProps {
  opportunity: OpportunityItem;
  quantityQtl: number;
  isTopRanked?: boolean;
  onOpenBreakdown: (opportunity: OpportunityItem) => void;
  onOpenNegotiate: (opportunity: OpportunityItem) => void;
  onOpenAggregation?: () => void;
}

export function OpportunityCard({
  opportunity,
  quantityQtl,
  isTopRanked = false,
  onOpenBreakdown,
  onOpenNegotiate,
  onOpenAggregation,
}: OpportunityCardProps) {
  const grossPriceRupees = opportunity.grossPricePaise / 100;
  const nrpRupees = opportunity.nrpPaise / 100;
  const totalRealizedRupees = (opportunity.nrpPaise * quantityQtl) / 100;
  const deductionsRupees = opportunity.totalDeductionsPaise / 100;
  const netGainRupees = ((opportunity.nrpPaise - 262200) * quantityQtl) / 100;

  // Ineligible / Minimum Lot Volume Restricted Card (e.g. AgriFresh 50 Qtl)
  if (!opportunity.isEligible) {
    return (
      <div className="relative rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-6 sm:p-7 transition-all hover:border-amber-400 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-3 py-1 rounded-full font-bold">
              Volume Restricted
            </span>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">{opportunity.name}</h3>
            <span className="text-xs text-neutral-500">({opportunity.buyerType || 'Exporter'})</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold">
            <AlertCircleIcon className="w-3.5 h-3.5 shrink-0 text-amber-700" />
            <span>Min lot: 50 Qtl • Current: {quantityQtl} Qtl</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-white border border-amber-200/80 mb-4 text-xs">
          <div>
            <span className="text-neutral-500 block mb-0.5 font-medium">Offered Gross Price</span>
            <span className="text-xl font-bold font-instrument text-neutral-900">
              ₹{grossPriceRupees.toLocaleString('en-IN')}/qtl
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
              Highest Market Offer in Pune
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block mb-0.5 font-medium">Logistics & Location</span>
            <span className="text-sm font-semibold text-neutral-800">
              {opportunity.distanceKm} km ({opportunity.location})
            </span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              {opportunity.providesPickup ? 'Direct Farmgate Pickup' : 'Farmer arranges delivery'}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block mb-0.5 font-medium">Potential Harvest Value</span>
            <span className="text-xl font-bold text-emerald-700">
              ₹{((320000 - 6500) * quantityQtl / 100).toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-800 font-bold block mt-0.5">
              +₹5,346 Gain over Mandi
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-amber-900 text-xs font-medium max-w-xl">
            {opportunity.ineligibilityReason ||
              'Minimum lot threshold is 50 Quintals. Pool your 18 Qtl lot with nearby cluster farmers (Suresh & Meena) to unlock.'}
          </p>
          {onOpenAggregation && (
            <button
              onClick={onOpenAggregation}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white font-semibold text-xs transition-colors shadow-sm shrink-0"
            >
              <span>Pool Lots (Unlock 68 Qtl)</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active / Eligible Card
  const netPercentage = Math.round((opportunity.nrpPaise / opportunity.grossPricePaise) * 100);
  const erosionPercentage = 100 - netPercentage;

  return (
    <div
      className={`relative rounded-3xl transition-all duration-300 p-6 sm:p-7 text-left shadow-sm ${
        isTopRanked
          ? 'bg-white border-2 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/20'
          : 'bg-white border border-neutral-200/90 hover:border-neutral-300'
      }`}
    >
      {/* Top Badges & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              isTopRanked
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            #{opportunity.rank}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">{opportunity.name}</h3>
              {opportunity.channelType === 'DIRECT_BUYER' ? (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  Direct Buyer
                </span>
              ) : (
                <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  APMC Mandi
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              {opportunity.buyerType || (opportunity.channelType === 'DIRECT_BUYER' ? 'Corporate Processor' : 'Physical Mandi')} • {opportunity.location} ({opportunity.distanceKm} km)
            </p>
          </div>
        </div>

        {/* Top Right Badges */}
        <div className="flex items-center gap-2">
          {isTopRanked && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">
              <SparklesIcon className="w-3.5 h-3.5 text-emerald-700" />
              Highest Net In-Hand
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 text-xs font-medium">
            <TruckIcon className="w-3.5 h-3.5 text-neutral-500" />
            {opportunity.providesPickup ? 'Farmgate Pickup' : 'Self-Haul'}
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mb-5">
        {/* Realized Price Column (sm:col-span-5) */}
        <div className="sm:col-span-5 bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span className="font-semibold text-emerald-800">Net Realized Price (NRP)</span>
              <span>In-Hand</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-neutral-900 font-instrument tracking-tight">
                ₹{nrpRupees.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-neutral-500 font-medium">/quintal</span>
            </div>

            <div className="mt-2 text-xs text-neutral-600 space-y-0.5">
              <div className="flex justify-between">
                <span>Headline Gross:</span>
                <span className="font-semibold text-neutral-800">₹{grossPriceRupees.toLocaleString('en-IN')}/qtl</span>
              </div>
              <div className="flex justify-between text-rose-700 font-medium">
                <span>Total Deductions:</span>
                <span>-₹{deductionsRupees.toLocaleString('en-IN')}/qtl</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Lot Revenue ({quantityQtl} Qtl):</span>
            <span className="text-base font-extrabold text-emerald-800">
              ₹{totalRealizedRupees.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Deductions & Erosion Column (sm:col-span-4) */}
        <div className="sm:col-span-4 bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
              <span className="font-semibold">Value Retention</span>
              <span className="font-bold text-neutral-900">{netPercentage}% Retained</span>
            </div>

            {/* Erosion Comparison Bar */}
            <div className="w-full h-3 bg-rose-100 rounded-full overflow-hidden flex mb-2">
              <div
                style={{ width: `${netPercentage}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Net Realized: ${netPercentage}%`}
              />
              <div
                style={{ width: `${erosionPercentage}%` }}
                className="bg-rose-400 h-full transition-all duration-500"
                title={`Deductions: ${erosionPercentage}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 mt-2">
              <div>
                <span className="text-neutral-500 block">Freight:</span>
                <span className="font-semibold text-neutral-800">
                  ₹{(opportunity.deductions.transportPaise / 100).toLocaleString('en-IN')}/qtl
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Mandi Fee:</span>
                <span className="font-semibold text-neutral-800">
                  ₹{(opportunity.deductions.mandiFeePaise / 100).toLocaleString('en-IN')}/qtl
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Transit Shrinkage:</span>
                <span className="font-semibold text-neutral-800">
                  ₹{(opportunity.deductions.transitLossPaise / 100).toLocaleString('en-IN')}/qtl
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Commission:</span>
                <span className="font-semibold text-neutral-800">
                  ₹{(opportunity.deductions.commissionPaise / 100).toLocaleString('en-IN')}/qtl
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-neutral-200 text-[11px] text-neutral-500 flex justify-between">
            <span>Payment Term:</span>
            <span className="font-semibold text-neutral-800">{opportunity.paymentTerm}</span>
          </div>
        </div>

        {/* Gauge & Trust Column (sm:col-span-3) */}
        <div className="sm:col-span-3 bg-neutral-50/80 rounded-2xl p-3 border border-neutral-200/70 flex flex-col items-center justify-between">
          <div className="w-full text-center">
            <span className="text-[11px] font-semibold text-neutral-600 block mb-1">Buyer Trust Score</span>
            <Gauge
              value={Math.round(opportunity.trustScore * 100)}
              color={opportunity.trustScore >= 0.85 ? '#10b981' : '#f59e0b'}
              showLabels={false}
            />
          </div>

          <div className="w-full text-center mt-2 pt-2 border-t border-neutral-200">
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
              {opportunity.verificationLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
        <p className="text-neutral-600 italic line-clamp-1 max-w-lg">
          &quot;{opportunity.recommendationReason}&quot;
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenBreakdown(opportunity)}
            className="px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-medium transition-colors"
          >
            Audit Waterfall
          </button>

          <button
            type="button"
            onClick={() => onOpenNegotiate(opportunity)}
            className={`px-5 py-2 rounded-full font-semibold transition-all shadow-sm flex items-center gap-1.5 ${
              isTopRanked
                ? 'bg-[#ef4d23] hover:bg-[#d83f18] text-white'
                : 'bg-[#0b0f1a] hover:bg-neutral-800 text-white'
            }`}
          >
            <span>Lock Contract</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
