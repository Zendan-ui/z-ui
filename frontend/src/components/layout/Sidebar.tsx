'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Logo = () => (
  <svg viewBox="0 0 400 400" className="w-9 h-9">
    <defs>
      <linearGradient id="sideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'var(--accent-1)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--accent-2)' }} />
      </linearGradient>
      <filter id="sGlow"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <circle cx="200" cy="200" r="185" fill="var(--bg-0)" stroke="url(#sideGrad)" strokeWidth="8" />
    <g filter="url(#sGlow)">
      <path d="M 120 130 L 280 130 L 120 270 L 280 270" fill="none" stroke="url(#sideGrad)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <circle cx="120" cy="130" r="7" fill="var(--accent-1)" />
    <circle cx="280" cy="270" r="7" fill="var(--accent-3)" />
  </svg>
);

interface NavGroup {
  label: string;
  items: { name: string; href: string; icon: string; badge?: string }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: '📊' },
      { name: 'Users', href: '/users', icon: '👥', badge: '1.2K' },
      { name: 'Servers', href: '/servers', icon: '🖥️' },
      { name: 'Inbounds', href: '/inbounds', icon: '📡' },
      { name: 'Subscriptions', href: '/subscriptions', icon: '📦' },
    ],
  },
  {
    label: 'Network',
    items: [
      { name: 'Nodes', href: '/nodes', icon: '🌐' },
      { name: 'Routing', href: '/routing', icon: '🔀' },
      { name: 'Firewall', href: '/settings', icon: '🛡️' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'Logs', href: '/logs', icon: '📜', badge: '5' },
      { name: 'Telegram Bot', href: '/telegram', icon: '🤖' },
      { name: 'Backups', href: '/backups', icon: '💾' },
      { name: 'Plugins', href: '/settings', icon: '🔌' },
      { name: 'Settings', href: '/settings', icon: '⚙️' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-[240px] flex flex-col backdrop-blur-[40px]"
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <Logo />
        <div>
          <h1 className="text-xl font-extrabold neon-text tracking-tight">Z-UI</h1>
          <p className="text-[8px] uppercase tracking-[2.5px]" style={{ color: 'var(--text-3)' }}>
            Proxy Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div
              className="text-[9px] uppercase tracking-[2px] font-semibold px-3 pt-4 pb-1.5"
              style={{ color: 'var(--text-3)' }}
            >
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="text-[15px] w-[22px] text-center opacity-80">{item.icon}</span>
                  <span>{item.name}</span>
                  {item.badge && (
                    <span
                      className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center"
                      style={{ background: 'var(--danger)', color: '#fff' }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <div className="ml-auto w-[5px] h-[5px] rounded-full" style={{ background: 'var(--accent-1)', animation: 'pulse 2s infinite' }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold"
            style={{ background: 'var(--accent-g)' }}
          >
            A
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-0)' }}>Admin</p>
            <p className="text-[9px]" style={{ color: 'var(--text-3)' }}>Super Admin</p>
          </div>
        </div>
        <p className="text-center text-[8px] mt-1.5 tracking-wide" style={{ color: 'var(--text-3)' }}>
          Z-UI v1.0.0 — The Future of Proxy Management
        </p>
      </div>
    </aside>
  );
}
