'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '../../components/navigation/AppShell';
import { useAuth, UserRole } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Sprout,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Upload,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, role, switchRole, updateUserProfile, isAuthenticated, openAuthModal } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [buyerType, setBuyerType] = useState('Corporate Processor');

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Role switching
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  // Initialize fields from user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setVillage(user.village || '');
      setDistrict(user.district || 'Pune');
      setStateName(user.state || 'Maharashtra');
      setCompanyName(user.companyName || (role === 'BUYER' ? `${user.name} Procurement` : ''));
      setBuyerType(user.buyerType || 'Corporate Processor');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user, role]);

  const handleRoleToggle = async (newRole: 'FARMER' | 'BUYER') => {
    if (role === newRole) return;
    setIsSwitchingRole(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      await switchRole(newRole);
      setSaveSuccess(`Switched to ${newRole === 'FARMER' ? 'Seller (Farmer)' : 'Buyer'} mode.`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to switch role.');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Image file size must be less than 5MB.');
      return;
    }

    setIsUploadingAvatar(true);
    setSaveError(null);
    setSaveSuccess(null);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarPreview(dataUrl);

      try {
        const uploadRes = await api.uploadAvatar({
          file,
          userId: user?.id,
          filename: file.name,
        });

        if (uploadRes?.avatarUrl) {
          setAvatarPreview(uploadRes.avatarUrl);
          await updateUserProfile({ avatarUrl: uploadRes.avatarUrl });
          setSaveSuccess(
            uploadRes.source === 'vercel-blob'
              ? 'Profile photo uploaded to Vercel Blob storage successfully.'
              : 'Profile photo updated successfully.',
          );
          setTimeout(() => setSaveSuccess(null), 3500);
        }
      } catch (uploadErr: any) {
        console.warn('Avatar upload API warning:', uploadErr);
        // Fallback: save dataUrl directly
        if (dataUrl) {
          await updateUserProfile({ avatarUrl: dataUrl });
          setSaveSuccess('Profile photo updated locally.');
          setTimeout(() => setSaveSuccess(null), 3500);
        }
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const updates: any = {
        name,
        phone,
      };

      if (role === 'FARMER') {
        updates.village = village;
        updates.district = district;
        updates.state = stateName;
      } else if (role === 'BUYER') {
        updates.companyName = companyName;
        updates.buyerType = buyerType;
      }

      await updateUserProfile(updates);
      setSaveSuccess('Profile details saved successfully.');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto py-16 px-4 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Sign in to Access Your Profile</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Sign in with Google OAuth or email to manage your profile photo, switch between Seller and Buyer modes, and access platform features.
          </p>
          <button
            type="button"
            onClick={openAuthModal}
            className="px-6 py-2.5 bg-[#ef4d23] hover:bg-[#d84018] text-white font-bold rounded-xl text-sm shadow-md transition-all"
          >
            Sign In / Register
          </button>
        </div>
      </AppShell>
    );
  }

  const isGoogleUser = user.authProvider === 'GOOGLE';
  const isAdmin = user.role === 'ADMIN' || role === 'ADMIN';

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Banner messages */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{saveSuccess}</span>
          </div>
        )}

        {saveError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-900 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-medium">{saveError}</span>
          </div>
        )}

        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with Upload button */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center text-3xl font-extrabold text-neutral-600 shadow-inner">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>

              {/* Camera upload overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 bg-black/40 text-white rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
                title="Click to upload custom profile photo"
              >
                {isUploadingAvatar ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Change</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            {/* User Meta Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl font-black text-neutral-900 tracking-tight">{user.name}</h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    role === 'BUYER'
                      ? 'bg-blue-100 text-blue-800'
                      : isAdmin
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {role === 'BUYER' ? '🏢 Buyer Mode' : isAdmin ? '🛡️ Admin' : '🌾 Seller Mode'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-semibold">
                  {user.status === 'ACTIVE' ? '✓ Verified Account' : user.status}
                </span>
              </div>

              <div className="text-xs text-neutral-500 font-mono flex items-center justify-center sm:justify-start gap-1 mb-3">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span>{user.email}</span>
                {isGoogleUser && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-red-600 font-bold">
                    Google OAuth
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-neutral-600">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#ef4d23]" />
                  <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Profile Photo'}</span>
                </button>

                {isGoogleUser && (
                  <span className="text-[11px] text-neutral-500">
                    Auto-synced with your Google profile image. Custom uploads stored via Blob storage.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role Switching Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Marketplace Role Switcher</h2>
            <p className="text-xs text-neutral-500">
              Seamlessly switch your active session between selling harvest produce and sourcing agricultural commodities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seller Option */}
            <button
              type="button"
              onClick={() => handleRoleToggle('FARMER')}
              disabled={isSwitchingRole}
              className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                role === 'FARMER'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Sprout className="w-5 h-5" />
                  </div>
                  {role === 'FARMER' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Role
                    </span>
                  )}
                </div>
                <div className="font-extrabold text-neutral-900 text-base mb-1">Seller (Farmer / FPO)</div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  List harvest lots, monitor APMC mandi prices vs MSP, compare direct corporate buyers, and negotiate sales contracts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center gap-1 text-xs font-bold text-emerald-700">
                <span>{role === 'FARMER' ? 'Currently viewing Seller views' : 'Click to activate Seller mode'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Buyer Option */}
            <button
              type="button"
              onClick={() => handleRoleToggle('BUYER')}
              disabled={isSwitchingRole}
              className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                role === 'BUYER'
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {role === 'BUYER' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Role
                    </span>
                  )}
                </div>
                <div className="font-extrabold text-neutral-900 text-base mb-1">Buyer (Corporate / Processor)</div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Post procurement demands, discover farmer pooling lots, manage supplier contracts, and track multi-tranche settlements.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center gap-1 text-xs font-bold text-blue-700">
                <span>{role === 'BUYER' ? 'Currently viewing Buyer views' : 'Click to activate Buyer mode'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Profile Details Edit Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Edit Profile Details</h2>
            <p className="text-xs text-neutral-500">
              Update your contact details and active {role === 'BUYER' ? 'procurement company' : 'farm location'} parameters.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/20 focus:border-[#ef4d23]"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 text-sm font-mono cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/20 focus:border-[#ef4d23]"
                  />
                </div>
              </div>

              {role === 'FARMER' ? (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Village / Cluster</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Dehu Road, Haveli"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/20 focus:border-[#ef4d23]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Company / Entity Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. FreshMart Foods Ltd."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/20 focus:border-[#ef4d23]"
                    />
                  </div>
                </div>
              )}
            </div>

            {role === 'FARMER' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/20 focus:border-[#ef4d23]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/20 focus:border-[#ef4d23]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Procurement Buyer Type</label>
                <select
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/20 focus:border-[#ef4d23]"
                >
                  <option value="Corporate Processor">Corporate Food Processor</option>
                  <option value="Retail Chain">Retail Supermarket Chain</option>
                  <option value="Exporter">International Exporter</option>
                  <option value="Wholesale Buyer">Wholesale Terminal Buyer</option>
                </select>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#0b0f1a] hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#ef4d23]" />}
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Admin Governance Banner (Only shown if user has Admin privileges) */}
        {isAdmin && (
          <div className="rounded-3xl p-6 bg-gradient-to-r from-purple-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="w-5 h-5 text-purple-300" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-purple-300">
                    Administrator Privileges
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Platform Admin Governance Hub</h3>
                <p className="text-xs text-purple-200 max-w-xl">
                  As an authenticated platform admin, you can manage user access, promote users to Admin or Staff roles, manage account statuses, and review system audit logs.
                </p>
              </div>

              <Link
                href="/admin/users"
                className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-purple-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all shrink-0"
              >
                <span>Manage Users & Roles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
