'use client';

import React, { useState } from 'react';
import { OpportunityItem } from './OpportunityCard';
import { X, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface NegotiationModalProps {
  opportunity: OpportunityItem | null;
  lotQuantityQtl: number;
  onClose: () => void;
  onNegotiationComplete: (agreedPricePaise: number) => void;
}

export function NegotiationModal({
  opportunity,
  lotQuantityQtl,
  onClose,
  onNegotiationComplete,
}: NegotiationModalProps) {
  if (!opportunity) return null;

  const initialOfferRupees = Math.round(opportunity.grossPricePaise / 100);
  const recommendedCounterRupees = Math.min(initialOfferRupees + 40, initialOfferRupees + 75);
  const canonicalAgreedRupees = Math.min(initialOfferRupees + 25, recommendedCounterRupees);

  const [counterPrice, setCounterPrice] = useState<number>(recommendedCounterRupees);
  const [step, setStep] = useState<'INPUT' | 'PENDING' | 'ACCEPTED'>('INPUT');

  const diff = counterPrice - initialOfferRupees;
  let acceptanceProbability = 85;
  if (diff <= 0) acceptanceProbability = 99;
  else if (diff <= 40) acceptanceProbability = 92;
  else if (diff <= 80) acceptanceProbability = 78;
  else if (diff <= 140) acceptanceProbability = 55;
  else acceptanceProbability = 25;

  const extraGainPerQtl = counterPrice - initialOfferRupees;
  const extraGainTotal = extraGainPerQtl * lotQuantityQtl;

  const handleSubmitCounter = () => {
    setStep('PENDING');
    setTimeout(() => {
      setStep('ACCEPTED');
      onNegotiationComplete(canonicalAgreedRupees * 100);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn text-left">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-neutral-200 shadow-2xl p-6 sm:p-8 overflow-hidden text-neutral-900">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Direct Counter-Offer
              </span>
              <span className="text-xs text-neutral-500 font-mono">Platform-Verified</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Negotiate with {opportunity.name}
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Procurement Contract • {lotQuantityQtl} Quintals Tomato Hybrid Grade A
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

        {step === 'INPUT' && (
          <div className="space-y-5 my-5">
            {/* Current Buyer Offer */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-500 block mb-0.5 font-medium">Current Buyer Offer</span>
                <span className="text-xl font-bold text-neutral-900">
                  ₹{initialOfferRupees}/qtl
                </span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block mb-0.5 font-medium">Buyer Trust Score</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{opportunity.trustScore}/100 Verified</span>
                </span>
              </div>
            </div>

            {/* Counter Price Slider & Input */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-neutral-800">
                  Your Proposed Counter-Offer:
                </label>
                <div className="text-2xl font-extrabold text-emerald-700">
                  ₹{counterPrice}
                  <span className="text-xs font-normal text-neutral-500">/qtl</span>
                </div>
              </div>

              <input
                type="range"
                min={initialOfferRupees - 50}
                max={initialOfferRupees + 200}
                step="10"
                value={counterPrice}
                onChange={(e) => setCounterPrice(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#ef4d23]"
              />

              <div className="flex justify-between text-[11px] text-neutral-500 pt-1">
                <span>₹{initialOfferRupees - 50}</span>
                <span className="text-[#ef4d23] font-bold">Recommended: ₹{recommendedCounterRupees}</span>
                <span>₹{initialOfferRupees + 200}</span>
              </div>
            </div>

            {/* Intelligence Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Pricing Intelligence Recommendation</span>
              </div>
              <p className="text-neutral-700 text-xs">
                {opportunity.name} has active weekly demand and your harvest is certified Grade A.
                A counter of ₹{counterPrice} carries <strong>{acceptanceProbability}%</strong> likelihood and is expected to settle around <strong className="text-emerald-800">₹{canonicalAgreedRupees}/qtl</strong>.
              </p>

              <div className="pt-2 border-t border-emerald-200 flex justify-between text-xs">
                <span className="text-neutral-600">Response Likelihood:</span>
                <span className="text-emerald-800 font-extrabold">{acceptanceProbability}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-600">Potential Extra Earnings:</span>
                <span className="text-emerald-800 font-extrabold text-sm">
                  {extraGainTotal >= 0 ? '+' : ''}₹{extraGainTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitCounter}
                className="px-6 py-2.5 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Transmit Counter (₹{counterPrice})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 'PENDING' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#ef4d23] border-t-transparent animate-spin mx-auto" />
            <div className="text-base font-bold text-neutral-900">Transmitting Counter to {opportunity.name}...</div>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Simulating institutional buyer automated negotiation response based on inventory replenishment demand...
            </p>
          </div>
        )}

        {step === 'ACCEPTED' && (
          <div className="space-y-5 my-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-neutral-900">Counter-Offer Successfully Settled!</h3>
              <p className="text-xs text-neutral-600 mt-1">
                {opportunity.name} agreed to revise harvest lot purchase price to{' '}
                <strong className="text-emerald-700 font-extrabold text-base">₹{canonicalAgreedRupees}/qtl</strong>!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Initial Buyer Offer:</span>
                <span className="text-neutral-800 font-medium">₹{initialOfferRupees}/qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Your Counter:</span>
                <span className="text-neutral-800 font-medium">₹{counterPrice}/qtl</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold">
                <span className="text-neutral-900">Final Agreed Settlement:</span>
                <span className="text-emerald-700 font-extrabold text-base">₹{canonicalAgreedRupees}/qtl</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>Revised Total Lot Value ({lotQuantityQtl} Qtl):</span>
                <span className="text-neutral-900 font-bold text-sm">
                  ₹{(canonicalAgreedRupees * lotQuantityQtl).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-full bg-[#ef4d23] hover:bg-[#d83f18] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Confirm Deal &amp; Lock Digital Settlement
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
