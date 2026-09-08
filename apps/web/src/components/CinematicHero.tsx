'use client';

import React, { useEffect, useRef } from 'react';
import { useIsDemoMode } from '../lib/env';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4';

interface CinematicHeroProps {
  onBeginJourney?: () => void;
  currentRole?: 'FARMER' | 'FPO' | 'BUYER';
  onRoleChange?: (role: 'FARMER' | 'FPO' | 'BUYER') => void;
  onResetDemo?: () => void;
  isResetting?: boolean;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  onBeginJourney,
  currentRole = 'FARMER',
  onRoleChange,
  onResetDemo,
  isResetting,
}) => {
  const isDemoMode = useIsDemoMode();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Custom fade-in / fade-out loop logic using requestAnimationFrame & useRef
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId: number;
    let isResettingPlayback = false;

    const monitorPlayback = () => {
      if (!video) return;

      if (!isResettingPlayback && video.duration && !isNaN(video.duration)) {
        const currentTime = video.currentTime;
        const duration = video.duration;
        const FADE_DURATION = 0.5; // 0.5s fade window

        let targetOpacity = 1;

        if (currentTime < FADE_DURATION) {
          // Fade in over 0.5s at start (opacity 0 to 1)
          targetOpacity = Math.max(0, Math.min(1, currentTime / FADE_DURATION));
        } else if (currentTime > duration - FADE_DURATION) {
          // Fade out over 0.5s before end (opacity 1 to 0)
          const timeLeft = Math.max(0, duration - currentTime);
          targetOpacity = Math.max(0, Math.min(1, timeLeft / FADE_DURATION));
        } else {
          targetOpacity = 1;
        }

        video.style.opacity = targetOpacity.toFixed(3);
      }

      animationFrameId = requestAnimationFrame(monitorPlayback);
    };

    // On ended event: set opacity to 0, wait 100ms, reset currentTime = 0, then play() again
    const handleEnded = () => {
      if (!video) return;
      isResettingPlayback = true;
      video.style.opacity = '0';

      setTimeout(() => {
        if (!video) return;
        video.currentTime = 0;
        video
          .play()
          .then(() => {
            isResettingPlayback = false;
          })
          .catch((err) => {
            console.warn('Loop video play error:', err);
            isResettingPlayback = false;
          });
      }, 100);
    };

    video.addEventListener('ended', handleEnded);

    video.style.opacity = '0';
    video
      .play()
      .then(() => {
        animationFrameId = requestAnimationFrame(monitorPlayback);
      })
      .catch((err) => {
        console.warn('Initial video play error:', err);
        animationFrameId = requestAnimationFrame(monitorPlayback);
      });

    return () => {
      video.removeEventListener('ended', handleEnded);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const handleScrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onBeginJourney) {
      onBeginJourney();
    }
  };

  const navLinks = [
    { name: 'Home', href: '#', active: true },
    { name: 'NRP Engine', href: 'decision-engine', active: false },
    { name: 'Opportunities', href: 'opportunities', active: false },
    { name: 'FPO Pooling', href: 'aggregation', active: false },
    { name: 'Simulator', href: 'simulator', active: false },
    { name: 'Economic Impact', href: 'impact', active: false },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FFFFFF] text-[#000000] flex flex-col justify-between selection:bg-[#000000] selection:text-[#FFFFFF]">
      {/* Background Video Layer (z-0) positioned at top: 300px, inset: auto 0 0 0 */}
      <div
        className="absolute overflow-hidden pointer-events-none z-0"
        style={{
          position: 'absolute',
          top: '300px',
          left: 0,
          right: 0,
          bottom: 0,
          inset: 'auto 0 0 0',
        }}
      >
        <video
          ref={videoRef}
          src={VIDEO_URL}
          muted
          playsInline
          autoPlay
          preload="auto"
          className="w-full h-full object-cover transition-opacity duration-75"
          style={{ opacity: 0, willChange: 'opacity' }}
        />

        {/* Gradient Overlays: absolute inset-0 bg-gradient-to-b from-background via-transparent to-background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.6) 12%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.75) 85%, #0a0f0d 100%)',
          }}
        />
      </div>

      {/* Navigation Bar (z-10) */}
      <nav className="w-full relative z-10">
        <div className="flex justify-between items-center px-6 sm:px-8 py-6 max-w-7xl mx-auto">
          {/* Brand Logo redesigned for KrishiSetu */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-3xl sm:text-4xl tracking-tight font-instrument text-[#000000] select-none hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <span>KrishiSetu</span>
              <span className="text-xs font-sans align-super font-semibold tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                कृषिसेतु
              </span>
            </a>
          </div>

          {/* Menu Items */}
          <div className="hidden lg:flex items-center space-x-7">
            {navLinks.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  if (item.href === '#') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    handleScrollTo(item.href);
                  }
                }}
                className={`text-sm font-inter transition-colors duration-200 cursor-pointer ${
                  item.active
                    ? 'text-[#000000] font-semibold'
                    : 'text-[#6F6F6F] hover:text-[#000000]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Right Action & Controls */}
          <div className="flex items-center gap-2.5">
            {/* Persona Switcher */}
            {onRoleChange && (
              <div className="hidden sm:flex items-center bg-black/5 p-1 rounded-full border border-black/10 text-xs font-inter">
                {(['FARMER', 'FPO', 'BUYER'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onRoleChange(r)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      currentRole === r
                        ? 'bg-black text-white shadow-sm'
                        : 'text-[#6F6F6F] hover:text-black'
                    }`}
                  >
                    {r === 'FARMER' ? 'Farmer' : r === 'FPO' ? 'FPO' : 'Buyer'}
                  </button>
                ))}
              </div>
            )}

            {/* Reset Demo Button (Demo only) */}
            {isDemoMode && onResetDemo && (
              <button
                type="button"
                onClick={onResetDemo}
                disabled={isResetting}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 text-xs font-inter text-[#6F6F6F] hover:text-black hover:bg-black/5 transition-colors"
                title="Reset to canonical Ramesh Kumar 18 qtl Tomato scenario"
              >
                <span>{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
              </button>
            )}

            {/* Main Action CTA */}
            <button
              type="button"
              onClick={() => handleScrollTo('decision-engine')}
              className="rounded-full px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-inter font-medium bg-[#000000] text-[#FFFFFF] hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 cursor-pointer shadow-sm"
            >
              Explore Market
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section (z-10) */}
      <main className="flex-1 flex items-center justify-center relative z-10">
        <section
          className="pb-32 sm:pb-36 flex flex-col items-center justify-center text-center px-6 relative z-10 w-full max-w-7xl mx-auto"
          style={{
            paddingTop: 'calc(6rem - 40px)',
          }}
        >
          {/* Subtitle Pill / Live Intelligence Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-inter font-medium mb-6 animate-fade-rise shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SIH26132 • Real-Time Net Realized Price Intelligence</span>
          </div>

          {/* Headline in Instrument Serif with italic #6F6F6F accents */}
          <h1
            className="text-5xl sm:text-7xl md:text-8xl max-w-6xl font-normal font-instrument text-[#000000] animate-fade-rise select-none"
            style={{
              lineHeight: 0.95,
              letterSpacing: '-2.46px',
            }}
          >
            Beyond <span className="italic text-[#6F6F6F]">middlemen,</span> we build{' '}
            <span className="italic text-[#6F6F6F]">farmer prosperity.</span>
          </h1>

          {/* Description in Inter */}
          <p className="text-base sm:text-lg max-w-2xl mt-8 leading-relaxed font-inter text-[#6F6F6F] animate-fade-rise-delay">
            Empowering Bharat's farmers with transparent Net Realized Price (NRP) discovery.
            Eliminate hidden transit losses, मंडी commissions, and unfair deductions through direct buyer linkages and smart FPO aggregation.
          </p>

          {/* Canonical Metric Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 animate-fade-rise-delay">
            <div className="px-4 py-2 rounded-full bg-black/5 border border-black/10 text-xs sm:text-sm font-inter text-[#1a1a1a] flex items-center gap-2 backdrop-blur-sm">
              <span className="font-bold text-emerald-700">+₹318/qtl</span>
              <span className="text-[#6F6F6F]">Gain vs Talegaon Baseline</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-black/5 border border-black/10 text-xs sm:text-sm font-inter text-[#1a1a1a] flex items-center gap-2 backdrop-blur-sm">
              <span className="font-bold text-emerald-700">₹2,925/qtl</span>
              <span className="text-[#6F6F6F]">FreshMart Verified In-Hand</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-black/5 border border-black/10 text-xs sm:text-sm font-inter text-[#1a1a1a] flex items-center gap-2 backdrop-blur-sm">
              <span className="font-bold text-emerald-700">+₹297/qtl</span>
              <span className="text-[#6F6F6F]">FPO Collective Advantage</span>
            </div>
          </div>

          {/* Hero CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 animate-fade-rise-delay-2">
            <button
              type="button"
              onClick={() => handleScrollTo('decision-engine')}
              className="rounded-full px-12 sm:px-14 py-4 sm:py-5 text-base font-inter font-medium bg-[#000000] text-[#FFFFFF] hover:scale-[1.03] active:scale-[0.98] transition-transform duration-300 cursor-pointer shadow-xl"
            >
              Begin Decision Journey
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('simulator')}
              className="rounded-full px-8 py-4 text-base font-inter font-medium bg-white border border-black/15 text-black hover:bg-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-sm"
            >
              Simulate Market Variables
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Floating Indicator smoothly leading into Live Decision Engine */}
      <div className="relative z-10 pb-6 flex flex-col items-center justify-center text-xs font-inter text-[#1a1a1a]">
        <button
          type="button"
          onClick={() => handleScrollTo('decision-engine')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-black/10 shadow-sm text-gray-800 hover:text-black transition-all cursor-pointer backdrop-blur-sm"
        >
          <span className="font-medium">Explore Ramesh Kumar's Active Harvest (18 Qtl Tomato)</span>
          <svg className="w-4 h-4 animate-bounce text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
