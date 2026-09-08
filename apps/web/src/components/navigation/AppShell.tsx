'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  Sprout,
  Users,
  FileText,
  ShieldCheck,
  Layers,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

interface AppShellProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ title, subtitle, badge, actions, children }: AppShellProps) {
  const pathname = usePathname();
  const { role, isDemoMode, isAuthenticated, openAuthModal } = useAuth();

  // Mobile Bottom Bar items
  const farmerBottomLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/markets', label: 'Markets', icon: TrendingUp },
    { href: '/lots', label: 'Lots', icon: Sprout },
    { href: '/fpo', label: 'FPO Pool', icon: Users },
    { href: '/transactions', label: 'Trades', icon: FileText },
  ];

  const buyerBottomLinks = [
    { href: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/buyer/demand', label: 'Demand', icon: Layers },
    { href: '/buyer/offers', label: 'Offers', icon: TrendingUp },
    { href: '/buyer/transactions', label: 'Trades', icon: FileText },
  ];

  const adminBottomLinks = [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/buyers', label: 'Buyers', icon: ShieldCheck },
    { href: '/admin/markets', label: 'Mandi', icon: BarChart3 },
    { href: '/admin/transactions', label: 'Oversight', icon: FileText },
    { href: '/admin/grievances', label: 'Disputes', icon: AlertCircle },
  ];

  const bottomLinks =
    role === 'BUYER'
      ? buyerBottomLinks
      : role === 'ADMIN'
      ? adminBottomLinks
      : farmerBottomLinks;

  return (
    <div className="min-h-screen bg-[#ededed] text-neutral-900 flex flex-col font-inter selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] pb-16 md:pb-0">
      {/* Universal Floating Header */}
      <AppHeader />

      {/* Guest Mode Notice in Production */}
      {!isDemoMode && !isAuthenticated && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-amber-950">You are browsing as Guest</div>
                <div className="text-amber-800 text-[11px] sm:text-xs">
                  Viewing market data and decision intelligence. Sign in with OTP or Google to register your harvest lots and execute contracts.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={openAuthModal}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold shrink-0 transition-colors text-xs"
            >
              Sign In / OTP →
            </button>
          </div>
        </div>
      )}

      {/* Page Title & Context Header */}
      {(title || subtitle) && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {badge && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-neutral-200 px-3 py-1 rounded-full text-xs font-semibold text-neutral-700 shadow-xs mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4d23]" />
                  {badge}
                </span>
              )}
              {title && (
                <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1">
        {children}
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 border-t border-neutral-200/80 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-neutral-800">KrishiSetu (कृषिसेतु)</span>
          <span>•</span>
          <span className="font-medium text-neutral-700">Team HackOps</span>
          <span>•</span>
          <span>SIH26132</span>
          <span>•</span>
          <span className="text-emerald-700 font-medium">Verified Net Realized Price Engine</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Public Product Landing
          </Link>
          <a href="#help" className="hover:text-neutral-900 transition-colors">
            Farmer Help Desk
          </a>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Appears on small screens) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-50 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {bottomLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors ${
                isActive ? 'text-[#ef4d23] font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
