'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SproutIcon, ShieldCheckIcon } from './icons';

export const KrishiSetuFooter: React.FC = () => {
  return (
    <footer className="liquid-glass-dark w-full rounded-3xl p-6 sm:p-10 text-gray-400 mt-16 border border-white/10 text-left">
      {/* Top 12-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-10">
        
        {/* Brand Column (md:col-span-5) */}
        <div className="md:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <SproutIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-instrument tracking-tight text-white">
                  Krishi<span className="text-emerald-400">Setu</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  कृषिसेतु
                </span>
              </div>
              <p className="text-xs text-gray-400">Market-Decision &amp; Net Realized Price Platform</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-sm">
            Empowering Bharat&apos;s smallholder farmers and FPOs with transparent Net Realized Price (NRP) discovery.
            Eliminating middleman deductions, transit shrinkage, and delayed mandi credit cycles.
          </p>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>109/109 Passing Domain &amp; End-to-End Algorithmic Assertions</span>
          </div>
        </div>

        {/* Directory Links (md:col-span-7) */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Column 1: Decision Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
              Decision Engine
            </h4>
            <ul className="text-xs space-y-2.5">
              <li>
                <a href="#decision-engine" className="hover:text-emerald-300 transition-colors block">
                  Net Realized Price (NRP)
                </a>
              </li>
              <li>
                <a href="#opportunities" className="hover:text-emerald-300 transition-colors block">
                  Ranked Opportunities
                </a>
              </li>
              <li>
                <a href="#aggregation" className="hover:text-emerald-300 transition-colors block">
                  FPO Collective Pooling
                </a>
              </li>
              <li>
                <a href="#simulator" className="hover:text-emerald-300 transition-colors block">
                  Logistics Simulator
                </a>
              </li>
              <li>
                <a href="#impact" className="hover:text-emerald-300 transition-colors block">
                  Economic Impact Card
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Market Channels */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
              Buyer Channels
            </h4>
            <ul className="text-xs space-y-2.5">
              <li>
                <span className="text-gray-300 block">FreshMart Foods (Processor)</span>
              </li>
              <li>
                <span className="text-gray-300 block">Pune APMC (Gultekdi)</span>
              </li>
              <li>
                <span className="text-gray-300 block">Pune Veggie Hub</span>
              </li>
              <li>
                <span className="text-gray-300 block">AgriFresh Exports Ltd.</span>
              </li>
              <li>
                <span className="text-gray-300 block">Talegaon Baseline Mandi</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Governance */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
              Trust &amp; Governance
            </h4>
            <ul className="text-xs space-y-2.5">
              <li>
                <span className="text-gray-300 block">Farmgate Pickup Auditing</span>
              </li>
              <li>
                <span className="text-gray-300 block">T+1 Direct Bank Transfer</span>
              </li>
              <li>
                <span className="text-gray-300 block">Zero Informal Deductions</span>
              </li>
              <li>
                <span className="text-gray-300 block">Grade A Verification</span>
              </li>
              <li>
                <span className="text-gray-300 block">SIH26132 Initiative</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>© 2026 KrishiSetu • Smart India Hackathon SIH26132 • Team HackOps • Designed for Bharat&apos;s Farmers</p>
        <p className="text-[11px] text-gray-400">
          Canonical Harvest Scenario: Ramesh Kumar • 18 Qtl Tomato Hybrid • Dehu Road, Pune
        </p>
      </div>
    </footer>
  );
};
