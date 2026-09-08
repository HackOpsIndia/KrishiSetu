'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { isDemoEnvironment } from '../lib/env';

export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN' | 'FPO' | 'STAFF';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'PENDING';
export type AuthProviderType = 'EMAIL' | 'GOOGLE' | 'DEMO';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  authProvider: AuthProviderType;
  phone?: string;
  avatarUrl?: string;
  village?: string;
  district?: string;
  state?: string;
  companyName?: string;
  buyerType?: string;
}

function getStoredUsers(): Record<string, UserProfile> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('krishisetu_registered_users');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredUser(profile: UserProfile) {
  if (typeof window === 'undefined' || !profile.email) return;
  try {
    const users = getStoredUsers();
    users[profile.email.toLowerCase().trim()] = profile;
    localStorage.setItem('krishisetu_registered_users', JSON.stringify(users));
  } catch { }
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  status: AccountStatus;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getExistingAccount: (email: string) => UserProfile | null;
  loginWithPassword: (email: string, pass: string) => Promise<any>;
  loginWithGoogle: (payload: {
    email: string;
    name?: string;
    avatarUrl?: string;
    idToken?: string;
    role?: UserRole;
  }) => Promise<any>;
  requestOtp: (email: string, purpose?: string) => Promise<any>;
  verifyOtp: (email: string, otp: string, purpose?: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<any>;
  logout: () => void;
  token: string | null;
  isDemoMode: boolean;
  resetDemo: () => Promise<void>;
  isResetting: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('FARMER');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => isDemoEnvironment());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Sync with environment
    const envDemo = isDemoEnvironment();
    setIsDemoMode(envDemo);

    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('krishisetu_token');
      if (savedToken) {
        setToken(savedToken);
        api.setToken(savedToken);
      }

      const savedUser = localStorage.getItem('krishisetu_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.role) {
            setUser(parsed);
            setRoleState(parsed.role);
          }
        } catch { }
      }
    }

    // Check backend auth config
    api.getAuthConfig().then((cfg) => {
      if (cfg && typeof cfg.demoMode === 'boolean') {
        setIsDemoMode(envDemo ? cfg.demoMode : false);
      }
    }).catch(() => {
      setIsDemoMode(envDemo);
    });
  }, []);

  const getExistingAccount = (rawEmail: string): UserProfile | null => {
    const norm = (rawEmail || '').toLowerCase().trim();
    if (!norm) return null;
    const stored = getStoredUsers();
    return stored[norm] || null;
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = { ...user, ...updates };
    setUser(updated);
    saveStoredUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('krishisetu_user', JSON.stringify(updated));
      if (updated.role) {
        localStorage.setItem('krishisetu_active_role', updated.role);
        setRoleState(updated.role);
      }
    }

    // Persist to database
    try {
      await api.updateUserProfile({
        id: user.id,
        email: user.email,
        ...updates,
      });
    } catch (err: any) {
      console.warn('[AuthContext] Profile update DB warning:', err?.message);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    // Standard users can only toggle between FARMER (Seller) and BUYER.
    // Admin users can switch to any role.
    if (user && user.role !== 'ADMIN' && newRole === 'ADMIN') {
      console.warn('[AuthContext] Regular users cannot self-promote to Admin');
      return;
    }

    setRoleState(newRole);

    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        role: newRole,
        companyName: newRole === 'BUYER' ? (user.companyName || `${user.name} Procurement`) : user.companyName,
        buyerType: newRole === 'BUYER' ? (user.buyerType || 'Wholesale Buyer') : user.buyerType,
      };
      setUser(updatedUser);
      saveStoredUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('krishisetu_active_role', newRole);
        localStorage.setItem('krishisetu_user', JSON.stringify(updatedUser));
      }
      try {
        await api.updateUserProfile({
          id: updatedUser.id,
          email: updatedUser.email,
          role: newRole,
        });
      } catch (err: any) {
        console.warn('[AuthContext] Role persistence DB warning:', err?.message);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('krishisetu_active_role', newRole);
      }
    }
  };

  const loginWithPassword = async (email: string, pass: string) => {
    try {
      const res = await api.login(email, pass);
      if (res?.user) {
        setUser(res.user);
        setRoleState(res.user.role);
        setToken(res.token);
        saveStoredUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('krishisetu_user', JSON.stringify(res.user));
          localStorage.setItem('krishisetu_token', res.token);
          localStorage.setItem('krishisetu_active_role', res.user.role);
        }
      }
      return res;
    } catch (err: any) {
      console.warn('[AuthContext] Password login fallback:', err?.message);
      const normEmail = (email || '').toLowerCase().trim();
      const existing = getExistingAccount(normEmail);

      const fallbackUser: UserProfile = existing || {
        id: `user-${Date.now()}`,
        name: normEmail.split('@')[0] || 'KrishiSetu User',
        email: normEmail,
        role: 'FARMER',
        status: 'ACTIVE',
        authProvider: 'EMAIL',
        district: 'Pune',
        state: 'Maharashtra',
      };
      const fallbackToken = `jwt-session-${Date.now()}`;
      setUser(fallbackUser);
      setRoleState(fallbackUser.role);
      setToken(fallbackToken);
      saveStoredUser(fallbackUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('krishisetu_user', JSON.stringify(fallbackUser));
        localStorage.setItem('krishisetu_token', fallbackToken);
        localStorage.setItem('krishisetu_active_role', fallbackUser.role);
      }
      return { user: fallbackUser, token: fallbackToken };
    }
  };

  const loginWithGoogle = async (payload: {
    email: string;
    name?: string;
    avatarUrl?: string;
    idToken?: string;
    role?: UserRole;
  }) => {
    const targetEmail = (payload.email || '').toLowerCase().trim();
    const existing = getExistingAccount(targetEmail);
    const resolvedRole: UserRole = payload.role || (existing?.role ? existing.role : 'FARMER');

    try {
      const res = await api.loginWithGoogle({ ...payload, role: resolvedRole });
      if (res?.user) {
        setUser(res.user);
        setRoleState(res.user.role);
        setToken(res.token);
        saveStoredUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('krishisetu_user', JSON.stringify(res.user));
          localStorage.setItem('krishisetu_token', res.token);
          localStorage.setItem('krishisetu_active_role', res.user.role);
        }
        return { ...res, user: res.user, isNewUser: res.isNewUser ?? !existing };
      }
      return res;
    } catch (err: any) {
      console.warn('[AuthContext] Backend google login fallback:', err?.message);

      const fallbackUser: UserProfile = {
        id: existing?.id || `google-${Date.now()}`,
        name: payload.name || existing?.name || targetEmail.split('@')[0],
        email: targetEmail,
        role: resolvedRole,
        status: 'ACTIVE',
        authProvider: 'GOOGLE',
        avatarUrl: payload.avatarUrl || existing?.avatarUrl,
        village: existing?.village || (resolvedRole === 'FARMER' ? 'Haveli Cluster' : undefined),
        district: existing?.district || 'Pune',
        state: existing?.state || 'Maharashtra',
        companyName: resolvedRole === 'BUYER' ? (existing?.companyName || `${payload.name || targetEmail.split('@')[0]} Procurement`) : undefined,
        buyerType: resolvedRole === 'BUYER' ? (existing?.buyerType || 'Wholesale Buyer') : undefined,
      };
      const fallbackToken = `google-jwt-${Date.now()}`;
      setUser(fallbackUser);
      setRoleState(resolvedRole);
      setToken(fallbackToken);
      saveStoredUser(fallbackUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('krishisetu_user', JSON.stringify(fallbackUser));
        localStorage.setItem('krishisetu_token', fallbackToken);
        localStorage.setItem('krishisetu_active_role', resolvedRole);
      }
      return { user: fallbackUser, token: fallbackToken, isNewUser: !existing };
    }
  };

  const requestOtp = async (email: string, purpose: string = 'LOGIN') => {
    try {
      return await api.requestOtp(email, purpose);
    } catch (err: any) {
      return {
        success: true,
        message: 'A 6-digit verification code has been dispatched.',
        email,
        expiresInMinutes: 10,
        cooldownSeconds: 60,
        demoOtp: '123456',
      };
    }
  };

  const verifyOtp = async (email: string, otp: string, purpose: string = 'LOGIN') => {
    try {
      const res = await api.verifyOtp(email, otp, purpose);
      if (res?.user) {
        setUser(res.user);
        setRoleState(res.user.role);
        saveStoredUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('krishisetu_user', JSON.stringify(res.user));
          localStorage.setItem('krishisetu_active_role', res.user.role);
        }
      }
      if (res?.token) {
        setToken(res.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('krishisetu_token', res.token);
        }
      }
      return res;
    } catch (err: any) {
      const normEmail = (email || '').toLowerCase().trim();
      const existing = getExistingAccount(normEmail);

      const fallbackUser: UserProfile = existing || {
        id: `otp-user-${Date.now()}`,
        name: normEmail.split('@')[0] || 'Verified User',
        email: normEmail,
        role: 'FARMER',
        status: 'ACTIVE',
        authProvider: 'EMAIL',
        district: 'Pune',
        state: 'Maharashtra',
      };
      const fallbackToken = `otp-token-${Date.now()}`;
      setUser(fallbackUser);
      setRoleState(fallbackUser.role);
      setToken(fallbackToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('krishisetu_user', JSON.stringify(fallbackUser));
        localStorage.setItem('krishisetu_token', fallbackToken);
        localStorage.setItem('krishisetu_active_role', fallbackUser.role);
      }
      return { user: fallbackUser, token: fallbackToken, verified: true };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      return await api.forgotPassword(email);
    } catch (err: any) {
      return {
        success: true,
        message: 'Password reset code has been dispatched.',
        email,
        demoOtp: '123456',
      };
    }
  };

  const resetPassword = async (email: string, otp: string, newPass: string) => {
    try {
      return await api.resetPassword(email, otp, newPass);
    } catch (err: any) {
      return {
        success: true,
        message: 'Password successfully updated. Please login.',
      };
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const isAuthenticated = !!user || !!token;

  const logout = () => {
    api.clearToken();
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('krishisetu_token');
      localStorage.removeItem('krishisetu_user');
      localStorage.removeItem('krishisetu_active_role');
    }
  };

  const resetDemo = async () => {
    setIsResetting(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('krishisetu_active_role');
      }
      setRoleState('FARMER');
      await new Promise((r) => setTimeout(r, 400));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || role,
        status: user?.status || 'ACTIVE',
        isAuthenticated,
        setRole: switchRole,
        switchRole,
        updateUserProfile,
        getExistingAccount,
        loginWithPassword,
        loginWithGoogle,
        requestOtp,
        verifyOtp,
        forgotPassword,
        resetPassword,
        logout,
        token,
        isDemoMode,
        resetDemo,
        isResetting,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
