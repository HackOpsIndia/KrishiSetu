'use client';

import { useState, useEffect } from 'react';

/**
 * Returns whether the application is running in Demo / Sandbox mode.
 * - On production domains (e.g. krishisetu-lemon.vercel.app, krishisetu.vercel.app, or custom domains),
 *   demo reset controls and test scenario overlays are hidden.
 * - On demo domains (e.g. krishisetu-demo.vercel.app), localhost, or when NEXT_PUBLIC_DEMO_MODE=true,
 *   demo reset controls are enabled.
 */
export function isDemoEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'false') return false;

  const hostname = window.location.hostname.toLowerCase();
  return hostname.includes('demo') || hostname === 'localhost' || hostname === '127.0.0.1';
}

export function useIsDemoMode(): boolean {
  const [isDemo, setIsDemo] = useState<boolean>(false);

  useEffect(() => {
    setIsDemo(isDemoEnvironment());
  }, []);

  return isDemo;
}
