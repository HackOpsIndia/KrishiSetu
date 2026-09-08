'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, UserRole } from '../../context/AuthContext';
import {
  Menu,
  X,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Building2,
  Sprout,
  Users,
  LayoutDashboard,
  TrendingUp,
  FileText,
  Truck,
  Layers,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

export function AppHeader() {
  const pathname = usePathname();
  const { role, user, switchRole, resetDemo, isResetting, isDemoMode, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Define links per role
  const farmerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/markets', label: 'Markets & Buyers', icon: TrendingUp },
    { href: '/lots', label: 'My Lots', icon: Sprout },
    { href: '/fpo', label: 'FPO Pooling', icon: Users },
    { href: '/transactions', label: 'Transactions', icon: FileText },
  ];

  const buyerLinks = [
    { href: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/buyer/demand', label: 'Demand', icon: Layers },
    { href: '/buyer/offers', label: 'Offers & Negotiation', icon: TrendingUp },
    { href: '/buyer/transactions', label: 'Transactions', icon: FileText },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users & Access', icon: Users },
    { href: '/admin/buyers', label: 'Buyer Verification', icon: ShieldCheck },
    { href: '/admin/markets', label: 'Market Data', icon: BarChart3 },
    { href: '/admin/transactions', label: 'Transactions', icon: FileText },
    { href: '/admin/grievances', label: 'Grievances', icon: AlertCircle },
    { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const currentLinks =
    role === 'BUYER' ? buyerLinks : role === 'ADMIN' ? adminLinks : farmerLinks;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#ededed]/90 backdrop-blur-md border-b border-neutral-200/80 px-3 sm:px-6 py-2.5">
      {/* Top micro-bar: Environment & Canonical Invariants */}
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-neutral-500 mb-1.5 pb-1 border-b border-neutral-200/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-neutral-800 uppercase tracking-wider">
            SIH26132 Demo Environment • Team HackOps
          </span>
          <span className="text-neutral-400">•</span>
          <span className="hidden sm:inline text-neutral-600">
            Canonical Scenario: Ramesh Kumar • 18 Qtl Tomato (Hybrid A)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetDemo}
            disabled={isResetting}
            className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 font-medium px-2 py-0.5 rounded border border-neutral-300 hover:bg-white transition-colors"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
          </button>
        </div>
      </div>

      {/* Main floating pill navbar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <svg
            viewBox="0 0 32 32"
            className="w-7 h-7 sm:w-8 sm:h-8 fill-[#ef4d23] transition-transform duration-300 group-hover:rotate-45"
          >
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
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight leading-none">
              Krishi<span className="text-[#ef4d23]">Setu</span>
            </span>
            <span className="text-[9px] text-neutral-500 font-mono">कृषिसेतु</span>
          </div>
        </Link>

        {/* Desktop navigation links */}
        <nav className="hidden md:flex items-center gap-1 bg-white rounded-full p-1 border border-neutral-200 shadow-xs">
          {currentLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0b0f1a] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#ef4d23]' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side: Role Switcher & Persona Badge */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Role display & Demo switcher */}
          {isDemoMode ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-full pl-3 pr-2 py-1.5 text-xs font-semibold text-neutral-800 hover:border-neutral-300 shadow-xs transition-colors"
                title="Demo Mode: Switch between canonical test personas"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    role === 'FARMER'
                      ? 'bg-emerald-500'
                      : role === 'BUYER'
                      ? 'bg-blue-500'
                      : 'bg-purple-500'
                  }`}
                />
                <span className="hidden sm:inline text-neutral-500">Demo Role:</span>
                <span className="text-[#ef4d23] font-bold">{role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-neutral-200 p-2 z-50 text-xs flex flex-col gap-1 animate-fadeIn">
                  <div className="px-2 py-1 flex items-center justify-between border-b border-neutral-100 pb-1.5 mb-1">
                    <span className="text-[10px] uppercase font-bold text-[#ef4d23]">
                      SIH Demo Persona Switcher
                    </span>
                    <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1 rounded">
                      Demo Mode
                    </span>
                  </div>
                <button
                  type="button"
                  onClick={() => {
                    switchRole('FARMER');
                    setRoleDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                    role === 'FARMER'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="block leading-tight">Farmer (Ramesh)</span>
                      <span className="text-[10px] text-neutral-500">18 Qtl Tomato</span>
                    </div>
                  </div>
                  {role === 'FARMER' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchRole('BUYER');
                    setRoleDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                    role === 'BUYER'
                      ? 'bg-blue-50 text-blue-900 font-bold'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="block leading-tight">Buyer (FreshMart)</span>
                      <span className="text-[10px] text-neutral-500">Corporate Processor</span>
                    </div>
                  </div>
                  {role === 'BUYER' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchRole('ADMIN');
                    setRoleDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                    role === 'ADMIN'
                      ? 'bg-purple-50 text-purple-900 font-bold'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="block leading-tight">Platform Admin</span>
                      <span className="text-[10px] text-neutral-500">Governance &amp; Oversight</span>
                    </div>
                  </div>
                  {role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-neutral-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-neutral-800">{user.name}</span>
            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-bold">
              {role}
            </span>
          </div>
        )}

          {/* User badge */}
          <div className="hidden lg:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-neutral-200 text-xs">
            <span className="font-bold text-neutral-900">{user.name}</span>
            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
              {user.district || 'Pune'}
            </span>
          </div>

          {/* Sign In / OTP Access trigger */}
          <button
            type="button"
            onClick={openAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#09090b] text-white hover:bg-neutral-800 transition-colors shadow-xs"
            title="Sign in with Email OTP, Password, or Google"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#ef4d23]" />
            <span className="hidden sm:inline">Sign In / OTP</span>
            <span className="sm:hidden">OTP</span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-700"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 pt-2 border-t border-neutral-200/80 bg-white rounded-2xl p-3 shadow-lg flex flex-col gap-1.5 text-xs">
          <div className="px-2 py-1 text-[11px] font-bold text-neutral-500 uppercase">
            {role} Navigation
          </div>
          {currentLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                pathname === item.href
                  ? 'bg-[#0b0f1a] text-white font-bold'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 pt-2 border-t border-neutral-100 text-neutral-500 hover:text-neutral-900 px-3 py-1 text-xs"
          >
            ← Return to Public Landing
          </Link>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal />
    </header>
  );
}
