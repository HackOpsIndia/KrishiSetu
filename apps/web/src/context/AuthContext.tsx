'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { isDemoEnvironment } from '../lib/env';

export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN' | 'FPO';
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

const CANONICAL_USERS: Record<UserRole, UserProfile> = {
  FARMER: {
    id: 'farmer-ramesh',
    name: 'Ramesh Kumar',
    email: 'ramesh@demo.in',
    role: 'FARMER',
    status: 'ACTIVE',
    authProvider: 'DEMO',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    village: 'Dehu Road',
    district: 'Pune',
    state: 'Maharashtra',
  },
  BUYER: {
    id: 'buyer-freshmart',
    name: 'FreshMart Foods',
    email: 'freshmart@demo.in',
    role: 'BUYER',
    status: 'ACTIVE',
    authProvider: 'DEMO',
    phone: '+91 98220 55443',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
    companyName: 'FreshMart Foods Ltd.',
    buyerType: 'Corporate Processor',
    district: 'Pune',
    state: 'Maharashtra',
  },
  ADMIN: {
    id: 'admin-krishi',
    name: 'KrishiSetu State Admin',
    email: 'admin@demo.in',
    role: 'ADMIN',
    status: 'ACTIVE',
    authProvider: 'DEMO',
    phone: '+91 91100 22334',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    district: 'State Operations Hub',
    state: 'Maharashtra',
  },
  FPO: {
    id: 'fpo-pune',
    name: 'Pune FPO Collective',
    email: 'fpo@demo.in',
    role: 'FPO',
    status: 'ACTIVE',
    authProvider: 'DEMO',
    phone: '+91 98888 12345',
    district: 'Pune',
    state: 'Maharashtra',
  },
};

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  status: AccountStatus;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  loginWithPassword: (email: string, pass: string) => Promise<any>;
  loginWithGoogle: (payload: { email: string; name?: string; avatarUrl?: string; idToken?: string }) => Promise<any>;
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
  const [user, setUser] = useState<UserProfile | null>(() => isDemoEnvironment() ? CANONICAL_USERS.FARMER : null);
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
      }

      const savedUser = localStorage.getItem('krishisetu_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.role) {
            setUser(parsed);
            setRoleState(parsed.role);
          }
        } catch {}
      } else if (envDemo) {
        const savedRole = localStorage.getItem('krishisetu_active_role') as UserRole;
        if (savedRole && CANONICAL_USERS[savedRole]) {
          setRoleState(savedRole);
          setUser(CANONICAL_USERS[savedRole]);
        } else {
          setUser(CANONICAL_USERS.FARMER);
        }
      } else {
        setUser(null);
      }
    }

    // Check backend auth config for production vs demo mode
    api.getAuthConfig().then((cfg) => {
      if (cfg && typeof cfg.demoMode === 'boolean') {
        // Never force demo mode on production domain
        setIsDemoMode(envDemo ? cfg.demoMode : false);
      }
    }).catch(() => {
      setIsDemoMode(envDemo);
    });
  }, []);

  const switchRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    const newUser = CANONICAL_USERS[newRole];
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('krishisetu_active_role', newRole);
      localStorage.setItem('krishisetu_user', JSON.stringify(newUser));
    }
    // Attempt login to acquire valid backend JWT token for the selected demo role
    try {
      const res = await api.login(newUser.email, 'demo1234');
      setToken(res.token);
    } catch {
      // In-memory offline fallback
    }
  };

  const loginWithPassword = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    if (res.user) {
      setUser(res.user);
      setRoleState(res.user.role);
      setToken(res.token);
    }
    return res;
  };

  const loginWithGoogle = async (payload: { email: string; name?: string; avatarUrl?: string; idToken?: string }) => {
    const res = await api.loginWithGoogle(payload);
    if (res.user) {
      setUser(res.user);
      setRoleState(res.user.role);
      setToken(res.token);
    }
    return res;
  };

  const requestOtp = async (email: string, purpose: string = 'LOGIN') => {
    return api.requestOtp(email, purpose);
  };

  const verifyOtp = async (email: string, otp: string, purpose: string = 'LOGIN') => {
    const res = await api.verifyOtp(email, otp, purpose);
    if (res.user) {
      setUser(res.user);
      setRoleState(res.user.role);
    }
    if (res.token) {
      setToken(res.token);
    }
    return res;
  };

  const forgotPassword = async (email: string) => {
    return api.forgotPassword(email);
  };

  const resetPassword = async (email: string, otp: string, newPass: string) => {
    return api.resetPassword(email, otp, newPass);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const isAuthenticated = isDemoMode ? true : (!!token && !!user);

  const logout = () => {
    api.clearToken();
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('krishisetu_token');
      localStorage.removeItem('krishisetu_user');
      localStorage.removeItem('krishisetu_active_role');
    }
    if (isDemoMode) {
      switchRole('FARMER');
    } else {
      setUser(null);
    }
  };

  const resetDemo = async () => {
    setIsResetting(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('krishisetu_active_role');
      }
      await switchRole('FARMER');
      await new Promise((r) => setTimeout(r, 600));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || (isDemoMode ? CANONICAL_USERS[role] : null),
        role,
        status: user?.status || 'ACTIVE',
        isAuthenticated,
        setRole: switchRole,
        switchRole,
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
