'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Phone,
  Calendar,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'FARMER' | 'FPO' | 'BUYER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'PENDING';
  authProvider: 'EMAIL' | 'GOOGLE' | 'DEMO';
  verificationStatus?: string;
  createdAt: string | Date;
  lastLoginAt?: string | Date;
  companyName?: string;
  buyerType?: string;
  village?: string;
  district?: string;
  auditEvents?: any[];
}

export default function AdminUsersPage() {
  const { user: activeAdmin } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');

  // Modals & Drawer State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [roleModalUser, setRoleModalUser] = useState<UserItem | null>(null);
  const [targetRole, setTargetRole] = useState<'FARMER' | 'FPO' | 'BUYER' | 'ADMIN'>('FARMER');
  const [roleReason, setRoleReason] = useState('');

  const [statusModalUser, setStatusModalUser] = useState<UserItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'PENDING'>('ACTIVE');
  const [statusReason, setStatusReason] = useState('');

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [emailHealth, setEmailHealth] = useState<any>(null);
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmailHealth = async () => {
    try {
      const health = await api.getEmailHealth();
      setEmailHealth(health);
    } catch {
      // fallback
    }
  };

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    try {
      const res = await api.sendTestEmail();
      if (res.success) {
        setSuccessBanner(
          `Operational test email successfully dispatched (${res.simulated ? 'Simulated Demo Transport' : 'Live Production SMTP'}).`,
        );
      } else {
        setErrorBanner(res.error || 'Failed to send test email.');
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Error sending test email.');
    } finally {
      setTestEmailLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchEmailHealth();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (providerFilter !== 'ALL' && u.authProvider !== providerFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalUsers = users.length;
  const farmersCount = users.filter((u) => u.role === 'FARMER').length;
  const buyersCount = users.filter((u) => u.role === 'BUYER').length;
  const fposCount = users.filter((u) => u.role === 'FPO').length;
  const adminsCount = users.filter((u) => u.role === 'ADMIN').length;
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED').length;

  // Handle Role Mutation
  const handleConfirmRoleChange = async () => {
    if (!roleModalUser) return;
    setErrorBanner(null);
    try {
      await api.updateUserRole(roleModalUser.id, targetRole, roleReason);
      setSuccessBanner(
        `Role updated for ${roleModalUser.email}: ${roleModalUser.role} → ${targetRole}`,
      );
      setRoleModalUser(null);
      setRoleReason('');
      await fetchUsers();
      if (selectedUser?.id === roleModalUser.id) {
        const updated = await api.getAdminUserDetail(roleModalUser.id);
        setSelectedUser(updated);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to update user role.');
    }
  };

  // Handle Status Mutation
  const handleConfirmStatusChange = async () => {
    if (!statusModalUser) return;
    setErrorBanner(null);
    try {
      await api.updateUserStatus(statusModalUser.id, targetStatus, statusReason);
      setSuccessBanner(
        `Status updated for ${statusModalUser.email}: ${statusModalUser.status} → ${targetStatus}`,
      );
      setStatusModalUser(null);
      setStatusReason('');
      await fetchUsers();
      if (selectedUser?.id === statusModalUser.id) {
        const updated = await api.getAdminUserDetail(statusModalUser.id);
        setSelectedUser(updated);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to update user status.');
    }
  };

  // Open Drawer
  const openDetailDrawer = async (userItem: UserItem) => {
    try {
      const full = await api.getAdminUserDetail(userItem.id);
      setSelectedUser(full);
    } catch {
      setSelectedUser(userItem);
    }
    setDrawerOpen(true);
  };

  return (
    <AppShell
      badge="Platform Governance &amp; RBAC"
      title="Users &amp; Access Governance"
      subtitle="Canonical directory of smallholder farmers, corporate buyers, FPO collectives, and state administrators. Real-time role assignment and account access control."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Registry</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* BANNER NOTIFICATIONS */}
        {errorBanner && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button
              onClick={() => setErrorBanner(null)}
              className="text-rose-600 hover:text-rose-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {successBanner && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              Total Users
            </span>
            <span className="text-2xl font-extrabold font-instrument text-neutral-900 block">
              {totalUsers}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Canonical Accounts</span>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              Farmers
            </span>
            <span className="text-2xl font-extrabold font-instrument text-emerald-700 block">
              {farmersCount}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Smallholders</span>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              Buyers
            </span>
            <span className="text-2xl font-extrabold font-instrument text-[#ef4d23] block">
              {buyersCount}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Corporate &amp; Mandi</span>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              FPO Collectives
            </span>
            <span className="text-2xl font-extrabold font-instrument text-blue-700 block">
              {fposCount}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Aggregators</span>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              Administrators
            </span>
            <span className="text-2xl font-extrabold font-instrument text-purple-700 block">
              {adminsCount}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Governance Officers</span>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              Suspended
            </span>
            <span className="text-2xl font-extrabold font-instrument text-amber-700 block">
              {suspendedCount}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Access Blocked</span>
          </div>
        </div>

        {/* EMAIL & NOTIFICATION SERVICE HEALTH CARD */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              emailHealth?.connected
                ? 'bg-emerald-50 text-emerald-600'
                : emailHealth?.mode === 'DEMO_SIMULATED'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-amber-50 text-amber-600'
            }`}>
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900">Email &amp; Notification Engine</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  emailHealth?.connected
                    ? 'bg-emerald-100 text-emerald-800'
                    : emailHealth?.mode === 'DEMO_SIMULATED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {emailHealth?.connected
                    ? 'SMTP Connected'
                    : emailHealth?.mode === 'DEMO_SIMULATED'
                    ? 'Demo Mode (Simulated)'
                    : 'Config Missing'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {emailHealth?.details || 'KrishiSetu SMTP & OTP delivery provider.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={testEmailLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#ef4d23] ${testEmailLoading ? 'animate-spin' : ''}`} />
            <span>{testEmailLoading ? 'Sending...' : 'Send Test Email'}</span>
          </button>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#ef4d23]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full text-xs">
              {(['ALL', 'FARMER', 'BUYER', 'FPO', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                    roleFilter === r
                      ? 'bg-[#0b0f1a] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full text-xs">
              {(['ALL', 'ACTIVE', 'SUSPENDED', 'PENDING'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                    statusFilter === s
                      ? 'bg-[#0b0f1a] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {s === 'ALL' ? 'All Status' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">User Identity</th>
                  <th className="px-5 py-3.5">Email (Canonical)</th>
                  <th className="px-5 py-3.5">Provider</th>
                  <th className="px-5 py-3.5">Current Role</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5">Last Login</th>
                  <th className="px-5 py-3.5 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* User Profile */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-xs">
                            {u.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-neutral-900 block">{u.name}</span>
                          {u.phone && (
                            <span className="text-[11px] text-neutral-400 block">{u.phone}</span>
                          )}
                          {u.village && (
                            <span className="text-[10px] text-neutral-400">
                              {u.village}, {u.district}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-neutral-800 font-medium block">
                        {u.email}
                      </span>
                      <span className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Canonical Identity
                      </span>
                    </td>

                    {/* Provider */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {u.authProvider}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : u.role === 'BUYER'
                            ? 'bg-orange-100 text-orange-900 border border-orange-200'
                            : u.role === 'FPO'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : u.status === 'SUSPENDED'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : u.status === 'DISABLED'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-600'
                              : u.status === 'SUSPENDED'
                              ? 'bg-amber-600'
                              : u.status === 'DISABLED'
                              ? 'bg-rose-600'
                              : 'bg-blue-600'
                          }`}
                        />
                        {u.status}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="px-5 py-4 text-neutral-500 text-[11px]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Change Role Button */}
                        <button
                          onClick={() => {
                            setRoleModalUser(u);
                            setTargetRole(u.role);
                            setRoleReason('');
                          }}
                          className="px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-[11px] font-semibold transition-colors"
                        >
                          Role
                        </button>

                        {/* Change Status Button */}
                        <button
                          onClick={() => {
                            setStatusModalUser(u);
                            setTargetStatus(u.status);
                            setStatusReason('');
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                            u.status === 'SUSPENDED'
                              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                        </button>

                        {/* View Drawer Button */}
                        <button
                          onClick={() => openDetailDrawer(u)}
                          className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
                          title="View Full Profile & Audit History"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROLE MUTATION MODAL */}
        {roleModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-neutral-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div>
                  <h3 className="font-bold text-neutral-900 text-base">Modify User Role</h3>
                  <span className="text-xs text-neutral-500">{roleModalUser.email}</span>
                </div>
                <button
                  onClick={() => setRoleModalUser(null)}
                  className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Target Role Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">Select New Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['FARMER', 'BUYER', 'FPO', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTargetRole(r)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                        targetRole === r
                          ? 'border-[#0b0f1a] bg-[#0b0f1a] text-white shadow-xs'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <span>{r}</span>
                      {targetRole === r && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* CRITICAL SECURITY WARNING FOR ADMIN PROMOTION */}
              {targetRole === 'ADMIN' && roleModalUser.role !== 'ADMIN' && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Administrative Privilege Escalation</span>
                  </div>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    You are granting <strong>full platform administration privileges</strong> to this
                    account. Administrators possess complete control over user roles, escrow overrides,
                    and governance settings.
                  </p>
                </div>
              )}

              {/* Reason Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Governance Reason (Recorded in Audit Log)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Verified institutional buyer credentials"
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#ef4d23]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmRoleChange}
                  className="flex-1 py-2.5 rounded-xl bg-[#0b0f1a] hover:bg-neutral-800 text-white font-semibold text-xs transition-colors"
                >
                  Confirm Role Reassignment
                </button>
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATUS MUTATION MODAL */}
        {statusModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-neutral-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div>
                  <h3 className="font-bold text-neutral-900 text-base">Update Account Status</h3>
                  <span className="text-xs text-neutral-500">{statusModalUser.email}</span>
                </div>
                <button
                  onClick={() => setStatusModalUser(null)}
                  className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Status Radio Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">Select Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTargetStatus(s)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                        targetStatus === s
                          ? s === 'ACTIVE'
                            ? 'border-emerald-600 bg-emerald-700 text-white'
                            : s === 'SUSPENDED'
                            ? 'border-amber-600 bg-amber-700 text-white'
                            : 'border-rose-600 bg-rose-700 text-white'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <span>{s}</span>
                      {targetStatus === s && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consequence Warning */}
              {(targetStatus === 'SUSPENDED' || targetStatus === 'DISABLED') && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Immediate Access Revocation
                  </span>
                  <p className="text-[11px] text-amber-800">
                    Suspending this user will immediately invalidate active tokens and block all
                    platform operations.
                  </p>
                </div>
              )}

              {/* Reason Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Action Reason (Recorded in Audit Log)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tare discrepancy investigation"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#ef4d23]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="flex-1 py-2.5 rounded-xl bg-[#0b0f1a] hover:bg-neutral-800 text-white font-semibold text-xs transition-colors"
                >
                  Apply Status Change
                </button>
                <button
                  type="button"
                  onClick={() => setStatusModalUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USER DETAIL & AUDIT SLIDE-OVER DRAWER */}
        {drawerOpen && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs animate-fadeIn">
            <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl border-l border-neutral-200 flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    User Governance Inspector
                  </span>
                  <h3 className="font-bold text-neutral-900 text-lg">{selectedUser.name}</h3>
                  <span className="text-xs text-neutral-500 font-mono">{selectedUser.email}</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
                {/* Meta Overview */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Account ID:</span>
                    <span className="font-mono text-neutral-800 font-bold">{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Platform Role:</span>
                    <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Account Status:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        selectedUser.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedUser.status === 'SUSPENDED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Auth Provider:</span>
                    <span className="font-semibold text-neutral-800">{selectedUser.authProvider}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Registration Date:</span>
                    <span className="text-neutral-700">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Audit Trail Timeline */}
                <div className="space-y-3">
                  <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span>Immutable Audit History</span>
                  </h4>

                  {selectedUser.auditEvents && selectedUser.auditEvents.length > 0 ? (
                    <div className="space-y-2 border-l-2 border-neutral-200 pl-4">
                      {selectedUser.auditEvents.map((ev: any, idx: number) => (
                        <div key={idx} className="space-y-0.5 py-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-[11px]">
                              {ev.action}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(ev.timestamp || ev.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-neutral-600 block text-[11px]">
                            {ev.previousValue} → <strong>{ev.newValue}</strong> by {ev.actorEmail}
                          </span>
                          {ev.reason && (
                            <span className="text-[10px] text-neutral-500 italic block">
                              &ldquo;{ev.reason}&rdquo;
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-400 text-center">
                      No administrative mutations recorded for this user.
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRoleModalUser(selectedUser);
                    setTargetRole(selectedUser.role);
                    setRoleReason('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#0b0f1a] hover:bg-neutral-800 text-white font-semibold text-xs transition-colors"
                >
                  Change Role
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusModalUser(selectedUser);
                    setTargetStatus(selectedUser.status);
                    setStatusReason('');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-semibold text-xs transition-colors"
                >
                  Change Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
