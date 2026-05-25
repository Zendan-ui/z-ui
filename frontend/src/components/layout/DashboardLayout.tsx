'use client';

import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useThemeStore, applyTheme } from '@/store/theme';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeStore();
  useEffect(() => { applyTheme(mode); }, [mode]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-0)' }}>
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[.012]" style={{ backgroundImage: `linear-gradient(var(--accent-1) .5px,transparent .5px),linear-gradient(90deg,var(--accent-1) .5px,transparent .5px)`, backgroundSize: '60px 60px' }} />
        <div className="absolute rounded-full blur-[100px] opacity-[.03]" style={{ width: 500, height: 500, background: 'var(--accent-1)', top: '10%', left: '20%', animation: 'float-bg 20s infinite' }} />
        <div className="absolute rounded-full blur-[100px] opacity-[.03]" style={{ width: 600, height: 600, background: 'var(--accent-2)', bottom: '10%', right: '10%', animation: 'float-bg 20s infinite 7s' }} />
      </div>
      <Sidebar />
      <div className="ml-[240px]"><Header /><main className="p-5 max-w-[1600px]">{children}</main></div>
    </div>
  );
}
