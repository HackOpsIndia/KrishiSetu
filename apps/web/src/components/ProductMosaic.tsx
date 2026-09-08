'use client';

import React, { useState } from 'react';
import { Sparkles, Search, Mic, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export function ProductMosaic() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <section id="mosaic" className="w-full bg-[#f0f0f0] text-[#141414] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 font-jakarta">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm text-xs font-semibold text-neutral-800 border border-neutral-200/80 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#5f8b3e]" />
            <span>KrishiSetu Ecosystem Overview</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            <span className="text-[#5f8b3e]">Automate</span> your trade.
            <br />
            Focus on what matters.
          </h2>
          <p className="mt-4 text-neutral-600 text-sm sm:text-base leading-relaxed">
            Eliminating hidden mandi cuts, transit losses, and delayed credit. A complete mosaic of algorithmic net price discovery, collective logistics, and verified institutional buyers.
          </p>
        </div>

        {/* Responsive Mosaic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-[minmax(180px,auto)]">
          {/* CARD 1 — NOTIFICATION (.notif) (md:col-span-4) */}
          <div
            className="md:col-span-4 rounded-3xl p-6 relative overflow-hidden border-[1.6px] border-white/90 shadow-sm flex flex-col justify-between"
            style={{
              background:
                'radial-gradient(120% 140% at 92% 100%, rgba(255,236,246,.95) 0%, rgba(255,236,246,0) 62%), linear-gradient(135deg, #f9d9e9 0%, #fbdfec 55%, #fce6f1 100%)',
            }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b5574]">Live Notification</span>
              <h3 className="text-xl font-bold text-neutral-900 mt-1">Direct Contract Match</h3>
            </div>

            {/* Toast Ledge Stack */}
            <div className="relative mt-4 pt-4">
              <div
                className="absolute inset-x-2 top-0 h-10 rounded-2xl"
                style={{
                  background: 'linear-gradient(100deg, #e6e6e6 0%, #e6e3e2 42%, #e5d6d6 74%, #e4cdcf 100%)',
                  boxShadow: '0 4px 12px rgba(120,80,100,.08)',
                }}
              />
              <div
                className="relative z-10 rounded-2xl p-3.5 flex items-center gap-3 border border-white/80"
                style={{
                  background: 'linear-gradient(105deg, #ffffff 34%, #fdeee5 78%, #fce8dd 100%)',
                  boxShadow: '0 8px 24px rgba(122,86,106,.12)',
                }}
              >
                <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-neutral-900 truncate">Trade Automated!</p>
                    <span className="text-[10px] text-neutral-500 font-medium">Just now</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 truncate mt-0.5">
                    FreshMart offered ₹2,925/qtl net farmgate
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-600 mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" /> Zero mandi fee • Direct T+1 payment
            </p>
          </div>

          {/* CARD 3 — AUTOMATE YOUR PRICING (md:col-span-8 md:row-span-2) */}
          <div
            className="md:col-span-8 md:row-span-2 rounded-3xl p-6 sm:p-8 relative overflow-hidden border-[1.6px] border-white/90 shadow-sm flex flex-col justify-between"
            style={{
              background:
                'radial-gradient(90% 70% at 6% 0%, rgba(226,236,200,.9) 0%, rgba(226,236,200,0) 70%), linear-gradient(168deg, #e2ebc9 0%, #e9f0c4 48%, #f0f4b8 78%, #f3f5b0 100%)',
            }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f8b3e]">NRP Decision Engine</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#15201a] tracking-tight mt-1">
                <span className="text-[#5f8b3e]">Automate</span> your pricing.
                <br />
                Audit every single deduction.
              </h3>
              <p className="text-xs sm:text-sm text-[#1e2a1b] max-w-lg mt-2">
                Simulate freight, APMC cess, handling, weighing, transit shrinkage, and commission in real time before your truck leaves the farmgate.
              </p>
            </div>

            {/* Illustration Layer: App Window */}
            <div className="relative mt-6 rounded-2xl border-2 border-white/90 shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm">
              {/* Window Title Bar */}
              <div className="bg-[#242424] px-4 py-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                <span className="text-[11px] text-neutral-400 ml-2 font-mono">krishisetu-nrp-engine.exe</span>
              </div>

              {/* Waterfall Ledger Breakdown Preview */}
              <div className="p-4 sm:p-5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <span className="font-bold text-neutral-900 text-sm">FreshMart Foods vs. Mandi Waterfall</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    NRP ₹2,925/qtl (+₹138/qtl over APMC)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60">
                    <span className="text-[10px] text-neutral-500 block">Gross Offer</span>
                    <span className="text-sm font-bold text-neutral-900">₹3,000/qtl</span>
                  </div>
                  <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60">
                    <span className="text-[10px] text-neutral-500 block">Freight</span>
                    <span className="text-sm font-bold text-amber-700">-₹75/qtl</span>
                  </div>
                  <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60">
                    <span className="text-[10px] text-neutral-500 block">Mandi Cess</span>
                    <span className="text-sm font-bold text-emerald-700">₹0 (Zero)</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 block">Net In-Hand</span>
                    <span className="text-sm font-extrabold text-emerald-800">₹2,925/qtl</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                  <span>Harvest Lot: 18 Qtl Tomato Hybrid • Ramesh Kumar</span>
                  <span className="text-neutral-900 font-semibold">Total Realized: ₹52,650</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2 — CONNECT YOUR CHANNELS (.connect) (md:col-span-4) */}
          <div
            className="md:col-span-4 rounded-3xl p-6 relative overflow-hidden border-[1.6px] border-white/90 shadow-sm flex flex-col justify-between"
            style={{
              background: 'linear-gradient(180deg, #fcfdfd 0%, #f4f7f9 30%, #e2ebef 66%, #cedce4 100%)',
            }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#355c70]">Verified Network</span>
              <h3 className="text-xl font-bold text-[#0c0c0c] mt-1">Connect Your Channels Now.</h3>
              <p className="text-xs text-neutral-600 mt-1">120+ verified buyers & APMC mandis available</p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-col gap-2 my-4">
              <div className="flex items-center gap-2">
                <span className="bg-white/90 shadow-sm border border-black/5 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> FreshMart Foods (Processor)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/90 shadow-sm border border-black/5 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Pune APMC Gultekdi
                </span>
                <span className="bg-white/90 shadow-sm border border-black/5 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> AgriFresh
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/90 shadow-sm border border-black/5 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Pune Veggie Hub
                </span>
                <span className="bg-white/90 shadow-sm border border-black/5 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> BigBasket
                </span>
              </div>
            </div>

            {/* Floating Mandi Chip */}
            <div className="flex justify-end">
              <span className="inline-block bg-white shadow-md border border-neutral-200 rounded-full px-3 py-1 text-[11px] font-semibold text-neutral-700 transform -rotate-3">
                Talegaon Mandi (Baseline ₹2,428)
              </span>
            </div>
          </div>

          {/* CARD 4 — INSIGHTS (.insights) (md:col-span-6) */}
          <div
            className="md:col-span-6 rounded-3xl p-6 sm:p-7 relative overflow-hidden border-[1.6px] border-white/90 shadow-sm flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, #fde2d4 0%, #fef0e7 55%, #fff7f2 100%)',
            }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b35322]">Price Intelligence</span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">Data that makes an Impact.</h3>
              <p className="text-xs text-neutral-600 mt-1">
                Maharashtra Tomato weekly market movements and farmgate price trends.
              </p>
            </div>

            {/* Ascending Vertical Gradient Bar Chart */}
            <div className="mt-6 pt-4">
              <div className="flex items-end justify-between gap-2 h-36 px-2">
                {/* Mon */}
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-neutral-300/80 rounded-t-lg h-16" />
                  <span className="text-[10px] text-neutral-500 font-medium">Mon</span>
                </div>
                {/* Tue */}
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-neutral-300/80 rounded-t-lg h-20" />
                  <span className="text-[10px] text-neutral-500 font-medium">Tue</span>
                </div>
                {/* Wed */}
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-neutral-300/80 rounded-t-lg h-22" />
                  <span className="text-[10px] text-neutral-500 font-medium">Wed</span>
                </div>
                {/* Thu */}
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-neutral-300/80 rounded-t-lg h-24" />
                  <span className="text-[10px] text-neutral-500 font-medium">Thu</span>
                </div>
                {/* Fri */}
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-neutral-300/80 rounded-t-lg h-26" />
                  <span className="text-[10px] text-neutral-500 font-medium">Fri</span>
                </div>
                {/* Sat */}
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-neutral-300/80 rounded-t-lg h-28" />
                  <span className="text-[10px] text-neutral-500 font-medium">Sat</span>
                </div>
                {/* Sun Peak (Gold -> Green Gradient) */}
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-emerald-700">₹2,925</span>
                  <div
                    className="w-full rounded-t-lg h-32 shadow-sm"
                    style={{
                      background: 'linear-gradient(180deg, #10b981 0%, #f59e0b 100%)',
                    }}
                  />
                  <span className="text-[10px] text-neutral-900 font-bold">Sun</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-neutral-700 pt-3 border-t border-neutral-200/60">
              <span className="font-medium">Direct In-Hand Realization</span>
              <span className="font-bold text-emerald-800">+11.3% vs Mandi Average</span>
            </div>
          </div>

          {/* CARD 5 — SEARCH (.search) (md:col-span-6) */}
          <div
            className="md:col-span-6 rounded-3xl p-6 sm:p-7 relative overflow-hidden border-[1.6px] border-white/90 shadow-sm flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, #eae6fc 0%, #f1effe 60%, #f8f7ff 100%)',
            }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6355a4]">Instant Discovery</span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">Instant Market & Buyer Lookup</h3>
              <p className="text-xs text-neutral-600 mt-1">
                Search verified institutional buyers, nearby processing units, and mandi rates.
              </p>
            </div>

            {/* Search Bar Pill */}
            <div className="my-6">
              <div className="bg-white rounded-full shadow-sm border border-neutral-200/80 p-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Pune APMC, FreshMart, Nashik Tomato..."
                  className="bg-transparent border-none outline-none text-xs sm:text-sm text-neutral-900 w-full placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  aria-label="Voice Search"
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 shrink-0 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[11px] bg-white/80 border border-neutral-200 text-neutral-700 px-2.5 py-0.5 rounded-full">
                  Tomato Hybrid Grade A
                </span>
                <span className="text-[11px] bg-white/80 border border-neutral-200 text-neutral-700 px-2.5 py-0.5 rounded-full">
                  Farmgate Pickup
                </span>
                <span className="text-[11px] bg-white/80 border border-neutral-200 text-neutral-700 px-2.5 py-0.5 rounded-full">
                  No Mandi Cess
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-600 pt-2 border-t border-neutral-200/60">
              <span>Verified APMC data synced every 15 minutes</span>
              <a href="#opportunities" className="text-[#6355a4] font-semibold flex items-center gap-0.5 hover:underline">
                Explore all 5 channels <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
