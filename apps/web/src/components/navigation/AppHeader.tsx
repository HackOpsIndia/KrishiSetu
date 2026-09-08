'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, switchRole, resetDemo, isResetting, isDemoMode, isAuthenticated, logout, openAuthModal } = useAuth();
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
      {/* Top micro-bar: Environment & Invariants */}
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-neutral-500 mb-1.5 pb-1 border-b border-neutral-200/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-neutral-800 uppercase tracking-wider">
            {isDemoMode ? 'SIH26132 Demo Environment • Team HackOps' : 'KrishiSetu Production • Team HackOps'}
          </span>
          <span className="text-neutral-400">•</span>
          <span className="hidden sm:inline text-neutral-600">
            Market-Decision & Direct Transaction Intelligence Platform
          </span>
        </div>

        {isDemoMode && (
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
        )}
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
          {/* Profile Switcher Dropdown (for any authenticated user or demo mode) */}
          {(isAuthenticated || isDemoMode) && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 bg-white border border-neutral-200 hover:border-neutral-300 rounded-full pl-2 pr-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-xs transition-all group"
                title="Switch between Seller and Buyer profiles"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-700 shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-left">
                  <span className="hidden sm:inline font-bold text-neutral-900 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      role === 'BUYER'
                        ? 'bg-blue-100 text-blue-800'
                        : role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {role === 'FARMER' ? '🌾 Seller' : role === 'BUYER' ? '🏢 Buyer' : '🛡️ Admin'}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition-transform" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 p-2 z-50 text-xs flex flex-col gap-1 animate-fadeIn">
                  {/* Account Header */}
                  <div className="px-3 py-2 border-b border-neutral-100 mb-1 bg-neutral-50/70 rounded-xl">
                    <div className="text-[11px] font-extrabold text-neutral-900 truncate">{user.name}</div>
                    <div className="text-[10px] text-neutral-500 truncate font-mono">{user.email}</div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-600">
                      <span>Active Role:</span>
                      <strong className="text-[#ef4d23]">
                        {role === 'FARMER' ? 'Seller (Farmer)' : role === 'BUYER' ? 'Buyer' : 'Admin'}
                      </strong>
                    </div>
                  </div>

                  {/* My Profile Link */}
                  <Link
                    href="/profile"
                    onClick={() => setRoleDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors font-medium"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block leading-tight font-bold">My Profile</span>
                      <span className="text-[10px] text-neutral-500">Avatar, role mode & settings</span>
                    </div>
                  </Link>

                  <div className="px-2 pt-1 pb-1 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Switch Marketplace Profile
                  </div>

                  {/* Option 1: Seller (Farmer) */}
                  <button
                    type="button"
                    onClick={() => {
                      switchRole('FARMER');
                      setRoleDropdownOpen(false);
                      if (pathname.startsWith('/buyer')) {
                        router.push('/dashboard');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                      role === 'FARMER'
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block leading-tight font-bold">Seller (Farmer)</span>
                        <span className="text-[10px] text-neutral-500">Sell harvest & check MSP</span>
                      </div>
                    </div>
                    {role === 'FARMER' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  {/* Option 2: Buyer */}
                  <button
                    type="button"
                    onClick={() => {
                      switchRole('BUYER');
                      setRoleDropdownOpen(false);
                      if (!pathname.startsWith('/buyer')) {
                        router.push('/buyer/dashboard');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                      role === 'BUYER'
                        ? 'bg-blue-50 text-blue-900 font-bold'
                        : 'hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block leading-tight font-bold">Buyer Profile</span>
                        <span className="text-[10px] text-neutral-500">Demands & procurement</span>
                      </div>
                    </div>
                    {role === 'BUYER' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>

                  {/* Option 3: Admin (strictly role-based without hardcoded email) */}
                  {(role === 'ADMIN' || user.role === 'ADMIN') && (
                    <button
                      type="button"
                      onClick={() => {
                        switchRole('ADMIN');
                        setRoleDropdownOpen(false);
                        router.push('/admin/dashboard');
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                        role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-900 font-bold'
                          : 'hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block leading-tight font-bold">Platform Admin</span>
                          <span className="text-[10px] text-neutral-500">Governance & oversight</span>
                        </div>
                      </div>
                      {role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                    </button>
                  )}

                  {/* Sign Out Option */}
                  <div className="border-t border-neutral-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-[11px]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

        {/* User location badge (authenticated only) */}
        {isAuthenticated && user && (
          <div className="hidden lg:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-neutral-200 text-xs">
            <span className="text-neutral-600 text-[11px] font-medium">
              {user.district || user.village || 'Pune'}
            </span>
          </div>
        )}

        {/* Auth Button: Logout if authenticated, Sign In if guest */}
        {user ? (
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors shadow-xs"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openAuthModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#09090b] text-white hover:bg-neutral-800 transition-colors shadow-xs"
            title="Sign in with Email OTP, Password, or Google"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#ef4d23]" />
            <span className="hidden sm:inline">Sign In / OTP</span>
            <span className="sm:hidden">Sign In</span>
          </button>
        )}

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

          {user ? (
            <div className="pt-2 mt-1 border-t border-neutral-100 flex flex-col gap-1">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-800 hover:bg-neutral-100 font-bold"
              >
                <UserIcon className="w-4 h-4 text-[#ef4d23]" />
                <span>My Profile & Settings</span>
              </Link>

              <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Switch Profile ({user.name.split(' ')[0]})
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    switchRole('FARMER');
                    setMobileMenuOpen(false);
                    if (pathname.startsWith('/buyer')) router.push('/dashboard');
                  }}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    role === 'FARMER' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>🌾 Seller</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchRole('BUYER');
                    setMobileMenuOpen(false);
                    if (!pathname.startsWith('/buyer')) router.push('/buyer/dashboard');
                  }}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    role === 'BUYER' ? 'bg-blue-600 text-white shadow-xs' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>🏢 Buyer</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold mt-1 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 mt-1 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#09090b] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#ef4d23]" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}

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
