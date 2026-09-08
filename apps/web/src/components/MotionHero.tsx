'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Menu,
  TrendingDown,
  TrendingUp,
  X,
  Sparkles,
} from 'lucide-react';
import { Gauge } from './Gauge';

interface MotionHeroProps {
  onExploreClick?: () => void;
  onResetDemo?: () => void;
  isResetting?: boolean;
}

export function MotionHero({ onExploreClick, onResetDemo, isResetting }: MotionHeroProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeToggle1, setActiveToggle1] = useState<'net' | 'gross'>('net');
  const [activeToggle3, setActiveToggle3] = useState<'pool' | 'solo'>('pool');

  return (
    <div className="w-full bg-[#ededed] p-3 sm:p-4 font-inter">
      {/* Hero container that clips everything inside */}
      <div className="relative w-full min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] overflow-hidden bg-[#d9d9d9] rounded-2xl sm:rounded-3xl flex flex-col justify-between">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
            type="video/mp4"
          />
        </video>

        {/* White overlay */}
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full">
          {/* Floating Pill Navbar */}
          <header className="flex justify-center pt-4 sm:pt-6 px-3 sm:px-4 w-full">
            <nav className="bg-white rounded-full shadow-sm border border-neutral-200 pl-3 pr-2 py-2 w-full max-w-[760px] relative flex items-center justify-between">
              {/* Logo (left, shrink-0) */}
              <a href="#" className="flex items-center gap-2.5 shrink-0 group">
                <svg
                  viewBox="0 0 32 32"
                  className="w-7 h-7 sm:w-8 sm:h-8 fill-[#ef4d23] transition-transform duration-300 group-hover:rotate-45"
                >
                  {/* 8-petal flower SVG */}
                  <circle cx="16" cy="6" r="3.5" />
                  <circle cx="23.07" cy="8.93" r="3.5" />
                  <circle cx="26" cy="16" r="3.5" />
                  <circle cx="23.07" cy="23.07" r="3.5" />
                  <circle cx="16" cy="26" r="3.5" />
                  <circle cx="8.93" cy="23.07" r="3.5" />
                  <circle cx="6" cy="16" r="3.5" />
                  <circle cx="8.93" cy="8.93" r="3.5" />
                  <circle cx="16" cy="16" r="3.5" />
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-sm sm:text-base font-semibold text-neutral-900 tracking-tight leading-none">
                    Krishi<span className="text-[#ef4d23]">Setu</span>
                  </span>
                  <span className="text-[9px] text-neutral-400 font-mono tracking-wider">SIH26132 • Team HackOps</span>
                </div>
              </a>

              {/* Desktop links */}
              <div className="hidden md:flex items-center gap-6 text-neutral-700 text-[14px] font-medium mx-4">
                <a href="#hero" className="flex items-center gap-1.5 text-neutral-900 hover:text-[#ef4d23] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                  Home
                </a>
                <a href="#mosaic" className="hover:text-[#ef4d23] transition-colors">
                  Ecosystem
                </a>
                <a href="#opportunities" className="hover:text-[#ef4d23] transition-colors">
                  Opportunities
                </a>
                <a href="#aggregation" className="hover:text-[#ef4d23] transition-colors">
                  FPO Pooling
                </a>
                <Link
                  href="/dashboard"
                  className="font-semibold text-[#ef4d23] hover:text-[#d83f18] transition-colors flex items-center gap-1"
                >
                  Farmer App →
                </Link>
              </div>

              {/* Right cluster */}
              <div className="flex items-center gap-2 ml-auto">
                {onResetDemo && (
                  <button
                    onClick={onResetDemo}
                    disabled={isResetting}
                    className="hidden lg:inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 px-2.5 py-1 rounded-full border border-neutral-200 transition-colors"
                  >
                    {isResetting ? 'Resetting...' : 'Reset Demo'}
                  </button>
                )}

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-[#ef4d23] hover:bg-[#d83f18] text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-4 pr-1.5 py-1.5 transition-all duration-200 shadow-sm"
                >
                  <span>Launch App</span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <ChevronRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </Link>

                {/* Mobile Hamburger Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

              {/* Mobile Dropdown Panel */}
              {mobileMenuOpen && (
                <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-4 z-20 flex flex-col gap-3 text-neutral-800 text-sm md:hidden">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#0b0f1a] text-white font-semibold"
                  >
                    <span>Launch Farmer App</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/buyer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 hover:text-[#ef4d23]"
                  >
                    Buyer Procurement Portal
                  </Link>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 hover:text-[#ef4d23]"
                  >
                    State Admin Hub
                  </Link>
                  <div className="border-t border-neutral-100 my-1" />
                  <a
                    href="#hero"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-1.5 font-semibold text-[#ef4d23]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4d23]" />
                    Landing Overview
                  </a>
                  <a href="#mosaic" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-[#ef4d23]">
                    Ecosystem Features
                  </a>
                  <a href="#opportunities" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-[#ef4d23]">
                    Ranked Opportunities
                  </a>
                  <a href="#aggregation" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-[#ef4d23]">
                    FPO Collective Pooling
                  </a>
                  {onResetDemo && (
                    <button
                      onClick={() => {
                        onResetDemo();
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-xs text-neutral-500 pt-2 border-t border-neutral-100"
                    >
                      Reset Canonical Demo Data
                    </button>
                  )}
                </div>
              )}
            </nav>
          </header>

          {/* Hero Content (Centered) */}
          <div className="flex flex-col items-center px-4 pt-10 sm:pt-14 pb-8 sm:pb-12 text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm text-[13px] text-neutral-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#ef4d23] animate-pulse" />
              <span>KrishiSetu Intelligence • SIH26132 • Team HackOps</span>
            </div>

            {/* Headline */}
            <h1
              className="mt-5 sm:mt-6 text-neutral-900 tracking-tight"
              style={{
                fontSize: 'clamp(36px, 7.5vw, 72px)',
                lineHeight: 1.05,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              Shaping{' '}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                Agriculture
              </span>
              <br />
              of tomorrow
            </h1>

            {/* Subtitle */}
            <p
              className="mt-4 sm:mt-6 text-neutral-700 px-2 max-w-2xl font-normal leading-relaxed"
              style={{ fontSize: 'clamp(14px, 2.5vw, 17px)' }}
            >
              The All-In-One Platform Powering Net Realized Price Discovery &amp; Direct Institutional Access for Bharat&apos;s Farmers.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 bg-[#0b0f1a] hover:bg-neutral-800 text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5 text-[14px] font-medium transition-all duration-200 shadow-md group"
              >
                <span>Launch Farmer App</span>
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-white" />
                </span>
              </Link>
              <a
                href="#opportunities"
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-neutral-800 border border-neutral-200 rounded-full px-5 py-2 sm:py-2.5 text-[14px] font-medium transition-all duration-200 shadow-xs"
              >
                <span>Explore Landing Demo</span>
              </a>
            </div>
          </div>

          {/* Dashboard Preview (Bleeding off the bottom edge) */}
          <div className="px-3 sm:px-4 mt-auto">
            <div className="bg-[#f5f2ee] rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto shadow-sm border border-white/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Card 1 — Realized Revenue & Gauge */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#ef4d23] font-semibold">Net Realization</span>
                      <span className="text-neutral-500 font-medium">Ramesh Kumar</span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-[28px] font-semibold text-neutral-900 leading-tight">₹52,650</span>
                      <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[11px] font-medium">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        +₹5,346 (11.3%)
                      </span>
                    </div>
                    <p className="text-[12px] text-neutral-500 mt-1">Compared to Talegaon Mandi</p>

                    <div className="text-center text-[12px] font-medium text-neutral-600 mt-4 mb-1">
                      Target Realization Achieved
                    </div>

                    <Gauge value={92} color="#ef4d23" showLabels={true} min="₹2,428" max="₹2,925" />
                  </div>

                  {/* Toggle Pill */}
                  <div className="bg-neutral-100 rounded-full p-1 flex mt-4 text-[12px] font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveToggle1('net')}
                      className={`flex-1 py-1 rounded-full text-center transition-all ${
                        activeToggle1 === 'net' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                      }`}
                    >
                      Net In-Hand
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToggle1('gross')}
                      className={`flex-1 py-1 rounded-full text-center transition-all ${
                        activeToggle1 === 'gross' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                      }`}
                    >
                      Gross Price
                    </button>
                  </div>
                </div>

                {/* Card 2 — Interactive Scenario Form */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-[13px] mb-3">
                      <span className="text-[#ef4d23] font-semibold">Active Scenario</span>
                      <span className="text-neutral-500 font-mono text-xs">18 Qtl Tomato</span>
                    </div>

                    {/* Dropdown 1 */}
                    <div className="space-y-1 mb-2.5">
                      <label className="text-[12px] text-neutral-700 block font-medium">Show figures for</label>
                      <div className="flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-800 bg-neutral-50">
                        <span>18 Qtl Tomato (Hybrid A)</span>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                    </div>

                    {/* Dropdown 2 */}
                    <div className="space-y-1 mb-2.5">
                      <label className="text-[12px] text-neutral-700 block font-medium">Optimal Buyer Match</label>
                      <div className="flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-800 bg-neutral-50">
                        <span>FreshMart Foods (Farmgate)</span>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] text-neutral-600 block">NRP Net (₹/qtl)</label>
                        <div className="border border-neutral-200 rounded-lg px-2.5 py-1 text-xs text-neutral-900 font-semibold bg-white">
                          # 2,925
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-neutral-600 block">Pool Goal (Qtl)</label>
                        <div className="border border-neutral-200 rounded-lg px-2.5 py-1 text-xs text-neutral-900 font-semibold bg-white">
                          # 50.0
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <a
                      href="#opportunities"
                      className="bg-[#ef4d23] hover:bg-[#d83f18] text-white text-xs font-semibold rounded-lg px-4 py-1.5 transition-colors"
                    >
                      View Rank
                    </a>
                    <a href="#simulator" className="text-xs text-neutral-600 hover:text-neutral-900 underline">
                      Simulate
                    </a>
                    <span className="text-neutral-400 text-xs">SIH</span>
                  </div>
                </div>

                {/* Card 3 — Collective FPO Pool & Gauge */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#ef4d23] font-semibold">Cluster Pool</span>
                      <span className="text-neutral-500 font-medium">Pune Cluster</span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-[28px] font-semibold text-neutral-900 leading-tight">68 Qtl</span>
                      <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[11px] font-medium">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        Unlocked
                      </span>
                    </div>
                    <p className="text-[12px] text-neutral-500 mt-1">AgriFresh 50 Qtl Export Goal</p>

                    <div className="text-center text-[12px] font-medium text-neutral-600 mt-4 mb-1">
                      Volume Threshold Progress
                    </div>

                    <Gauge value={68} color="#9ca3af" showLabels={false} />
                  </div>

                  {/* Toggle Pill */}
                  <div className="bg-neutral-100 rounded-full p-1 flex mt-4 text-[12px] font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveToggle3('pool')}
                      className={`flex-1 py-1 rounded-full text-center transition-all ${
                        activeToggle3 === 'pool' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                      }`}
                    >
                      FPO Pool
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToggle3('solo')}
                      className={`flex-1 py-1 rounded-full text-center transition-all ${
                        activeToggle3 === 'solo' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                      }`}
                    >
                      Solo Lot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
