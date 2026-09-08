'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '../../context/AuthContext';
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
  ArrowLeft,
  UserCheck,
} from 'lucide-react';

export function AuthModal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    isAuthModalOpen,
    closeAuthModal,
    isDemoMode,
    loginWithPassword,
    loginWithGoogle,
    getExistingAccount,
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
  const [step, setStep] = useState<'AUTH' | 'ROLE_SELECTION'>('AUTH');
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{
    email: string;
    name: string;
    avatarUrl?: string;
    idToken?: string;
  } | null>(null);
  const [chosenRole, setChosenRole] = useState<'FARMER' | 'BUYER'>('FARMER');
  const [companyName, setCompanyName] = useState('');

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

  // Google Identity Services (GIS) Button & Account Chooser Linkage
  useEffect(() => {
    if (!isAuthModalOpen || activeTab !== 'GOOGLE') return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    if (!clientId) return;

    const initGis = () => {
      if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) return;
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response?.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                if (payload?.email) {
                  handleGoogleProfileReceived({
                    email: payload.email,
                    name: payload.name || payload.given_name || payload.email.split('@')[0],
                    avatarUrl: payload.picture,
                    idToken: response.credential,
                  });
                }
              } catch (parseErr) {
                console.warn('Could not parse Google ID token credential:', parseErr);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const slot = document.getElementById('google-gis-container');
        if (slot) {
          slot.innerHTML = '';
          (window as any).google.accounts.id.renderButton(slot, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 340,
            logo_alignment: 'left',
          });
        }
      } catch (err) {
        console.warn('GIS init exception:', err);
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGis();
    } else {
      const timer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(timer);
          initGis();
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [isAuthModalOpen, activeTab]);

  if (!isAuthModalOpen || !mounted) return null;

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

  const handleGoogleProfileReceived = async (profile: {
    email: string;
    name?: string;
    avatarUrl?: string;
    idToken?: string;
  }) => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const targetEmail = (profile.email || '').trim().toLowerCase();
      if (!targetEmail || !targetEmail.includes('@')) {
        setErrorMessage('Google account did not provide a valid email address.');
        setLoading(false);
        return;
      }

      const rawName = profile.name || targetEmail.split('@')[0];
      const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const avatarUrl =
        profile.avatarUrl ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80';

      const res = await loginWithGoogle({
        email: targetEmail,
        name,
        avatarUrl,
        idToken: profile.idToken,
      });

      if (res?.user?.role === 'ADMIN' || res?.isAdmin) {
        setSuccessMessage(`Google Verified: ${targetEmail}. Redirecting to Admin Governance...`);
        setTimeout(() => {
          closeAuthModal();
          router.push('/admin/dashboard');
        }, 600);
        return;
      }

      // Check if this account was already registered with a role
      const existing = getExistingAccount(targetEmail);
      if (existing && existing.role && existing.role !== 'ADMIN') {
        await loginWithGoogle({
          email: targetEmail,
          name: existing.name || name,
          avatarUrl: existing.avatarUrl || avatarUrl,
          idToken: profile.idToken,
          role: existing.role,
        });
        setSuccessMessage(`Welcome back! Logged in as ${existing.role === 'BUYER' ? 'Buyer' : 'Seller'}.`);
        setTimeout(() => {
          closeAuthModal();
          if (existing.role === 'BUYER') {
            router.push('/buyer/dashboard');
          } else {
            router.push('/dashboard');
          }
        }, 600);
        return;
      }

      // If NEW user (or unassigned role): Ask if Buyer or Seller!
      setPendingGoogleUser({
        email: targetEmail,
        name,
        avatarUrl,
        idToken: profile.idToken,
      });
      setChosenRole(targetEmail.includes('buyer') || targetEmail.includes('freshmart') ? 'BUYER' : 'FARMER');
      setStep('ROLE_SELECTION');
    } catch (err: any) {
      console.warn('[AuthModal] Google login error:', err);
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleSignIn = () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      setLoading(false);
      setErrorMessage('Google Client ID is not configured in environment variables. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
      return;
    }

    // Method 1: Google OAuth2 Token Client Popup (Official Account Chooser)
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setLoading(false);
              setErrorMessage(tokenResponse.error_description || 'Google sign-in was cancelled.');
              return;
            }
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              if (!res.ok) throw new Error('Could not fetch user profile from Google');
              const profile = await res.json();
              await handleGoogleProfileReceived({
                email: profile.email,
                name: profile.name || profile.given_name || profile.email.split('@')[0],
                avatarUrl: profile.picture,
              });
            } catch (fetchErr: any) {
              setErrorMessage(fetchErr?.message || 'Failed to obtain Google account details.');
              setLoading(false);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (clientErr) {
        console.warn('GIS Token client error, falling back:', clientErr);
      }
    }

    // Method 2: Google One Tap Prompt
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setLoading(false);
          }
        });
        return;
      } catch (promptErr) {
        console.warn('GIS Prompt error:', promptErr);
      }
    }

    setLoading(false);
    setErrorMessage('Google Identity Client is connecting. You can also pick a 1-click test profile below.');
  };

  const handleCompleteAccountCreation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pendingGoogleUser) return;

    setLoading(true);
    setErrorMessage('');
    try {
      await loginWithGoogle({
        email: pendingGoogleUser.email,
        name: pendingGoogleUser.name,
        avatarUrl: pendingGoogleUser.avatarUrl,
        idToken: pendingGoogleUser.idToken,
        role: chosenRole,
      });

      setSuccessMessage(
        `Account created successfully as ${chosenRole === 'BUYER' ? 'Buyer' : 'Seller (Farmer)'}! Redirecting...`
      );

      setTimeout(() => {
        closeAuthModal();
        setStep('AUTH');
        setPendingGoogleUser(null);
        if (chosenRole === 'BUYER') {
          router.push('/buyer/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete profile creation.');
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md my-auto bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="p-6 pb-4 bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4d23]" />
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                {step === 'ROLE_SELECTION' ? (
                  <>Profile <span className="text-[#ef4d23]">Onboarding</span></>
                ) : (
                  <>Krishi<span className="text-[#ef4d23]">Setu</span> Access</>
                )}
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {step === 'ROLE_SELECTION'
                ? 'Choose your primary role • Easily switch profiles afterwards'
                : 'Canonical Identity • Email OTP • Password • Google OAuth'}
            </p>
          </div>
          <button
            onClick={() => {
              setStep('AUTH');
              closeAuthModal();
            }}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Badge */}
        {isDemoMode && step === 'AUTH' && (
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

        {/* Auth method tab switcher - only when in AUTH step */}
        {step === 'AUTH' && (
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
        )}

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

          {/* STEP: ROLE SELECTION FOR NEW GOOGLE ACCOUNT */}
          {step === 'ROLE_SELECTION' && pendingGoogleUser && (
            <div className="space-y-4 animate-fadeIn">
              {/* Google account badge */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 text-sm overflow-hidden">
                    {pendingGoogleUser.avatarUrl ? (
                      <img src={pendingGoogleUser.avatarUrl} alt="Google Avatar" className="w-full h-full object-cover" />
                    ) : (
                      pendingGoogleUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{pendingGoogleUser.name}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">{pendingGoogleUser.email}</div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Google Verified
                </span>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-extrabold text-neutral-900">
                  Select Your Marketplace Profile
                </h3>
                <p className="text-xs text-neutral-500">
                  Are you joining KrishiSetu as a Seller (Farmer) or a Buyer?
                </p>
              </div>

              {/* 2 Big Choice Cards */}
              <div className="grid grid-cols-1 gap-3">
                {/* Seller Card */}
                <button
                  type="button"
                  onClick={() => setChosenRole('FARMER')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    chosenRole === 'FARMER'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        chosenRole === 'FARMER' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <Sprout className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-neutral-900 flex items-center gap-1.5">
                          <span>🌾 Seller (Farmer / Producer)</span>
                          <span className="text-[9px] bg-emerald-200/80 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                            Sell Harvest
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-600 mt-0.5">
                          List lots, compare MSP & mandi prices, pool with FPOs, and accept buyer bids.
                        </div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                      chosenRole === 'FARMER' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-neutral-300'
                    }`}>
                      {chosenRole === 'FARMER' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </button>

                {/* Buyer Card */}
                <button
                  type="button"
                  onClick={() => setChosenRole('BUYER')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    chosenRole === 'BUYER'
                      ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        chosenRole === 'BUYER' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-neutral-900 flex items-center gap-1.5">
                          <span>🏢 Buyer (Trader / Processor / Retailer)</span>
                          <span className="text-[9px] bg-blue-200/80 text-blue-900 font-bold px-1.5 py-0.5 rounded">
                            Procure Produce
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-600 mt-0.5">
                          Post crop purchase demands, discover aggregated lots, negotiate prices, and execute digital contracts.
                        </div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                      chosenRole === 'BUYER' ? 'border-blue-600 bg-blue-600 text-white' : 'border-neutral-300'
                    }`}>
                      {chosenRole === 'BUYER' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </button>
              </div>

              {/* Informational note about switching profile afterwards */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Dual-Profile Flexibility: </span>
                  You can seamlessly switch between <strong>Seller</strong> and <strong>Buyer</strong> profiles at any time from the top navigation bar.
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('AUTH')}
                  className="py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteAccountCreation}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-[#ef4d23] hover:bg-[#d83f17] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <span>{loading ? 'Creating Account...' : `Continue as ${chosenRole === 'BUYER' ? 'Buyer' : 'Seller (Farmer)'}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 'AUTH' && (
            <>
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
                        placeholder="e.g. yourname@gmail.com"
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
            <div className="space-y-4 py-1">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Identity Linkage</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed px-1">
                  Sign in with your Google account. Non-admin users choose between <strong>Seller</strong> and <strong>Buyer</strong> profiles and can switch anytime.
                </p>
              </div>

              {/* Google Identity Services Integration */}
              <div className="flex flex-col items-center justify-center gap-2.5 pt-1">
                {/* Official Google Identity Services Rendered Slot */}
                <div id="google-gis-container" className="flex justify-center min-h-[44px]" />

                {/* Branded Continue with Google Button */}
                <button
                  type="button"
                  onClick={triggerGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white border-2 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all group disabled:opacity-60"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" viewBox="0 0 24 24">
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
                  <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>
              </div>
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
          </>
        )}
        </div>
      </div>
    </div>,
    document.body
  );
}
