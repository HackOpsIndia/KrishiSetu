'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Sprout,
  Building2,
} from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    isDemoMode,
    loginWithPassword,
    loginWithGoogle,
    requestOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    switchRole,
    role,
    user,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'OTP' | 'PASSWORD' | 'GOOGLE' | 'RESET'>('OTP');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');

  // States
  const [otpStep, setOtpStep] = useState<'EMAIL' | 'CODE'>('EMAIL');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [capturedDemoOtp, setCapturedDemoOtp] = useState<string | null>(null);

  // Cooldown countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isAuthModalOpen) return null;

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const nextOtp = [...otp];
    nextOtp[index] = val.slice(-1);
    setOtp(nextOtp);

    // Auto-advance focus
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await requestOtp(email, 'LOGIN');
      setOtpStep('CODE');
      setCountdown(res.cooldownSeconds || 60);
      if (res.demoOtp) {
        setCapturedDemoOtp(res.demoOtp);
      }
      setSuccessMessage(res.message || 'Verification code sent to your email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await verifyOtp(email, code, 'LOGIN');
      setSuccessMessage('Successfully verified! Redirecting...');
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await loginWithPassword(email, password);
      setSuccessMessage('Welcome back! Successfully logged in.');
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const demoGoogleEmail = email || 'meena.d@demo.in';
      await loginWithGoogle({
        email: demoGoogleEmail,
        name: 'Meena Deshmukh (Google)',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
      });
      setSuccessMessage('Google account authenticated.');
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Enter your email to request password reset.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await forgotPassword(email);
      setSuccessMessage(res.message);
      if (res.demoOtp) {
        setCapturedDemoOtp(res.demoOtp);
      }
      setOtpStep('CODE');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6 || !newPassword) {
      setErrorMessage('Enter the 6-digit code and a new password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await resetPassword(email, code, newPassword);
      setSuccessMessage(res.message);
      setTimeout(() => {
        setActiveTab('PASSWORD');
        setPassword(newPassword);
        setOtpStep('EMAIL');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemoCode = () => {
    if (!capturedDemoOtp) return;
    const digits = capturedDemoOtp.split('').slice(0, 6);
    setOtp(digits);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header bar */}
        <div className="p-6 pb-4 bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4d23]" />
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Krishi<span className="text-[#ef4d23]">Setu</span> Access
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Canonical Identity • Email OTP • Password • Google OAuth
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div className="bg-amber-50/80 border-b border-amber-200/60 px-6 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold">SIH Demo Environment Active</span>
            </div>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-bold">
              Simulated SMTP
            </span>
          </div>
        )}

        {/* Auth method tab switcher */}
        <div className="px-6 pt-4 flex gap-1 border-b border-neutral-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('OTP');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'OTP'
                ? 'border-[#ef4d23] text-[#ef4d23]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Email OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('PASSWORD');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'PASSWORD'
                ? 'border-[#ef4d23] text-[#ef4d23]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('GOOGLE');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'GOOGLE'
                ? 'border-[#ef4d23] text-[#ef4d23]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Google OAuth
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: EMAIL OTP */}
          {activeTab === 'OTP' && (
            <div>
              {otpStep === 'EMAIL' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ramesh@demo.in"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/20 focus:border-[#ef4d23]"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      A single-use 6-digit cryptographic code will be dispatched to this address.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#09090b] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-neutral-600">
                      Enter the 6-digit code sent to <strong className="text-neutral-900">{email}</strong>
                    </p>

                    {/* Simulated code indicator in demo mode */}
                    {isDemoMode && capturedDemoOtp && (
                      <div className="mt-2 py-1.5 px-3 bg-amber-50 rounded-lg border border-amber-200 inline-flex items-center gap-2 text-xs text-amber-900">
                        <span>Demo OTP: <strong>{capturedDemoOtp}</strong></span>
                        <button
                          type="button"
                          onClick={autofillDemoCode}
                          className="text-[10px] bg-amber-200/80 hover:bg-amber-300 font-bold px-1.5 py-0.5 rounded text-amber-900 transition-colors"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 6 Digit Inputs */}
                  <div className="flex justify-center gap-2 my-4">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-neutral-300 focus:border-[#ef4d23] focus:ring-2 focus:ring-[#ef4d23]/20 focus:outline-none bg-neutral-50 focus:bg-white transition-all font-mono"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#ef4d23] hover:bg-[#d83f17] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    <span>{loading ? 'Verifying Code...' : 'Verify & Sign In'}</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs text-neutral-500">
                    <button
                      type="button"
                      onClick={() => setOtpStep('EMAIL')}
                      className="text-neutral-600 hover:text-neutral-900 underline"
                    >
                      Change email
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestOtp()}
                      disabled={countdown > 0 || loading}
                      className="text-[#ef4d23] hover:underline font-semibold disabled:opacity-50 disabled:no-underline"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PASSWORD LOGIN */}
          {activeTab === 'PASSWORD' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. freshmart@demo.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/20 focus:border-[#ef4d23]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('RESET');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] text-[#ef4d23] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/20 focus:border-[#ef4d23]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#09090b] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* TAB 3: GOOGLE OAUTH */}
          {activeTab === 'GOOGLE' && (
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-neutral-600 leading-relaxed">
                KrishiSetu supports Google OAuth with verified identity linkage to your canonical platform account.
              </p>

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optional: custom google email or leave blank"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs mb-3 text-center"
                />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-xl text-xs font-bold flex items-center justify-center gap-3 shadow-xs transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7c-.8 1.6-1.3 3.4-1.3 5.3s.5 3.7 1.3 5.3l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16c1.9 3.8 5.8 6.4 10.4 6.4z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* TAB 4: PASSWORD RESET VIA OTP */}
          {activeTab === 'RESET' && (
            <div>
              {otpStep === 'EMAIL' ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600 mb-1">
                    <KeyRound className="w-3.5 h-3.5 text-[#ef4d23]" />
                    <span>Reset Your Password</span>
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your registered email address"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#ef4d23]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#ef4d23] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <span>{loading ? 'Sending Code...' : 'Send Reset Code'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('PASSWORD')}
                    className="w-full text-center text-xs text-neutral-500 hover:underline pt-1"
                  >
                    Back to password login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center text-xs text-neutral-600 mb-2">
                    Enter the code sent to <strong>{email}</strong> and your new password.
                  </div>

                  {isDemoMode && capturedDemoOtp && (
                    <div className="text-center">
                      <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                        Demo OTP: {capturedDemoOtp}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-center gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-9 h-10 text-center text-base font-bold rounded-lg border border-neutral-300 focus:border-[#ef4d23] font-mono"
                      />
                    ))}
                  </div>

                  <div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 6 chars)"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#09090b] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <span>{loading ? 'Resetting Password...' : 'Save New Password'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Persona Shortcuts (for easy evaluators) */}
          {isDemoMode && (
            <div className="mt-6 pt-4 border-t border-neutral-200/80">
              <div className="text-[10px] uppercase font-bold text-neutral-400 mb-2 flex items-center justify-between">
                <span>1-Click Canonical Persona Switcher</span>
                <span className="text-[9px] text-[#ef4d23] font-mono">Demo Feature</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    switchRole('FARMER');
                    setEmail('ramesh@demo.in');
                    closeAuthModal();
                  }}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    role === 'FARMER'
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-800">
                    <Sprout className="w-3 h-3 text-emerald-600" />
                    <span>Farmer</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">Ramesh Kumar</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchRole('BUYER');
                    setEmail('freshmart@demo.in');
                    closeAuthModal();
                  }}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    role === 'BUYER'
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-800">
                    <Building2 className="w-3 h-3 text-blue-600" />
                    <span>Buyer</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">FreshMart</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchRole('ADMIN');
                    setEmail('admin@demo.in');
                    closeAuthModal();
                  }}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    role === 'ADMIN'
                      ? 'border-purple-500 bg-purple-50/50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-800">
                    <ShieldCheck className="w-3 h-3 text-purple-600" />
                    <span>Admin</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">Governance</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
