'use client';

import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { KrishiSetuAIChatbot } from '../ai/KrishiSetuAIChatbot';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <KrishiSetuAIChatbot />
    </AuthProvider>
  );
}

