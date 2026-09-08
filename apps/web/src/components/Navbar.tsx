'use client';

import React from 'react';
import { SproutIcon, RefreshCwIcon, ShieldCheckIcon } from './icons';

interface NavbarProps {
  currentRole: 'FARMER' | 'FPO' | 'BUYER';
  onRoleChange: (role: 'FARMER' | 'FPO' | 'BUYER') => void;
  onResetDemo: () => void;
  isResetting?: boolean;
}

export function Navbar({ currentRole, onRoleChange, onResetDemo, isResetting }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-krishi-dark/80 backdrop-blur-md">
      {/* Top Ticker: Live Mandi Rates */}
      <div className="bg-krishi-800/40 border-b border-krishi-700/30 px-4 py-1.5 text-xs text-krishi-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-6 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">MARKET PRICE TICKER (DEMO MARKET DATA):</span>
            <span className="text-gray-300">Pune APMC (Tomato): ₹3,100/qtl (Stable)</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300">Talegaon Mandi: ₹2,900/qtl (+₹120)</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300">Pimpri Market: ₹2,950/qtl (-₹50)</span>
            <span className="text-gray-500">•</span>
            <span className="text-emerald-300 font-medium">Verified Buyers Active: 5</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-krishi-700/60 px-2 py-0.5 rounded text-krishi-100 font-mono">SIH26132 Demo Mode</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-krishi-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-krishi-500/20 ring-1 ring-white/20">
            <SproutIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Krishi<span className="text-emerald-400">Setu</span>
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
                NRP Engine
              </span>
            </div>
            <p className="text-xs text-gray-400">Market-Decision & Price Discovery Platform</p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-4">
          {/* Persona Switcher */}
          <div className="hidden md:flex items-center bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => onRoleChange('FARMER')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                currentRole === 'FARMER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Farmer (Ramesh)
            </button>
            <button
              onClick={() => onRoleChange('FPO')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                currentRole === 'FPO'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              FPO Coordinator
            </button>
            <button
              onClick={() => onRoleChange('BUYER')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                currentRole === 'BUYER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buyer (FreshMart)
            </button>
          </div>

          {/* Reset Demo State Button */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset to canonical demo scenario (18 qtl Tomato Hybrid in Dehu Road)"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
          </button>

          {/* Farmer Status Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300">
              RK
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-white flex items-center gap-1">
                Ramesh Kumar
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400 inline" />
              </div>
              <div className="text-gray-400 text-[11px]">Dehu Road, Pune</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
