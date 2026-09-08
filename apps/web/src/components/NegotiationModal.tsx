'use client';

import React, { useState } from 'react';
import { OpportunityItem } from './OpportunityCard';
import { XIcon, SparklesIcon, CheckCircleIcon, ArrowRightIcon, ShieldCheckIcon } from './icons';

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

  const initialOfferRupees = opportunity.grossPricePaise / 100; // e.g. ₹2,960
  const recommendedCounterRupees = 3000; // ₹3,000 canonical counter
  const canonicalAgreedRupees = 2975; // ₹2,975 canonical agreed

  const [counterPrice, setCounterPrice] = useState<number>(recommendedCounterRupees);
  const [step, setStep] = useState<'INPUT' | 'PENDING' | 'ACCEPTED'>('INPUT');

  // Acceptance probability calculation based on price range [2900 - 3150]
  const diff = counterPrice - initialOfferRupees;
  let acceptanceProbability = 85;
  if (diff <= 0) acceptanceProbability = 99;
  else if (diff <= 40) acceptanceProbability = 92;
  else if (diff <= 80) acceptanceProbability = 78;
  else if (diff <= 140) acceptanceProbability = 55;
  else acceptanceProbability = 20;

  const extraGainPerQtl = counterPrice - initialOfferRupees;
  const extraGainTotal = extraGainPerQtl * lotQuantityQtl;

  const handleSubmitCounter = () => {
    setStep('PENDING');
    setTimeout(() => {
      setStep('ACCEPTED');
      onNegotiationComplete(canonicalAgreedRupees * 100);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in text-left">
      <div className="liquid-glass-dark relative w-full max-w-lg rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-3 py-0.5 rounded-full font-bold">
                Direct Counter-Offer
              </span>
              <span className="text-xs text-gray-400">Platform-Verified</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Negotiate with {opportunity.name}
            </h2>
            <p className="text-xs text-gray-400">
              Procurement Contract • {lotQuantityQtl} Quintals Tomato Hybrid Grade A
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

        {step === 'INPUT' && (
          <div className="space-y-5 my-5">
            {/* Current Buyer Offer */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5">Current Buyer Offer</span>
                <span className="text-lg font-bold font-instrument text-white">
                  ₹{initialOfferRupees}/qtl
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block mb-0.5">Buyer Trust Score</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  <span>{opportunity.trustScore}/100 Verified</span>
                </span>
              </div>
            </div>

            {/* Counter Price Slider & Input */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-200">
                  Your Proposed Counter-Offer:
                </label>
                <div className="text-2xl font-extrabold font-instrument text-emerald-400">
                  ₹{counterPrice}
                  <span className="text-xs font-normal text-gray-400 font-sans">/qtl</span>
                </div>
              </div>

              <input
                type="range"
                min="2900"
                max="3150"
                step="10"
                value={counterPrice}
                onChange={(e) => setCounterPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />

              <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                <span>₹2,900</span>
                <span className="text-emerald-400 font-semibold">AI Recommended: ₹3,000</span>
                <span>₹3,150</span>
              </div>
            </div>

            {/* Intelligence Box */}
            <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 text-xs space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <SparklesIcon className="w-4 h-4 text-emerald-400" />
                <span>Pricing Intelligence Recommendation</span>
              </div>
              <p className="text-gray-300 text-xs">
                FreshMart has active weekly demand (200 Qtl) and Ramesh&apos;s lot is certified Grade A.
                A counter of ₹3,000 carries high likelihood and is algorithmically expected to settle at <strong className="text-emerald-300">₹2,975/qtl</strong>.
              </p>

              <div className="pt-2 border-t border-emerald-500/20 flex justify-between text-xs">
                <span className="text-gray-400">Response Likelihood:</span>
                <span className="text-emerald-300 font-bold">{acceptanceProbability}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Potential Extra Earnings:</span>
                <span className="text-emerald-400 font-bold font-instrument text-sm">
                  +₹{extraGainTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitCounter}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-black font-extrabold text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
              >
                <span>Transmit Counter (₹{counterPrice})</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 'PENDING' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
            <div className="text-lg font-bold text-white">Transmitting Counter to FreshMart Procurement...</div>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Simulating institutional buyer automated negotiation response based on inventory replenishment demand...
            </p>
          </div>
        )}

        {step === 'ACCEPTED' && (
          <div className="space-y-5 my-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircleIcon className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Counter-Offer Successfully Settled!</h3>
              <p className="text-xs text-gray-300 mt-1">
                FreshMart Foods agreed to revise harvest lot purchase price to{' '}
                <strong className="text-emerald-300 font-instrument text-base">₹{canonicalAgreedRupees}/qtl</strong>!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Initial Buyer Offer:</span>
                <span className="text-gray-300 font-instrument">₹{initialOfferRupees}/qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Counter:</span>
                <span className="text-gray-300 font-instrument">₹{counterPrice}/qtl</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                <span className="text-emerald-400">Final Agreed Settlement:</span>
                <span className="text-emerald-300 font-instrument text-base">₹{canonicalAgreedRupees}/qtl</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Revised Lot Value ({lotQuantityQtl} Qtl):</span>
                <span className="text-white font-medium font-instrument text-sm">
                  ₹{(canonicalAgreedRupees * lotQuantityQtl).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-black font-extrabold text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
            >
              Confirm Deal &amp; Lock Digital Settlement
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
