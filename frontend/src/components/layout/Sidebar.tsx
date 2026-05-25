'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Dashboard, Users, Server, Radio, Package, Globe,
  GitBranch, Shield, ScrollText, Bot, HardDrive,
  Plug, Settings, Tunnel
} from '@/components/ui/Icons';

const Logo = () => (
  <svg viewBox="0 0 400 400" className="w-8 h-8 flex-shrink-0">
    <defs>
      <linearGradient id="sG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'var(--accent-1)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--accent-2)' }} />
      </linearGradient>
      <filter id="sGl"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <circle cx="200" cy="200" r="185" fill="var(--bg-0)" stroke="url(#sG)" strokeWidth="8" />
    <g filter="url(#sGl)">
      <path d="M 120 130 L 280 130 L 120 270 L 280 270" fill="none" stroke="url(#sG)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <circle cx="120" cy="130" r="7" fill="var(--accent-1)" />
    <circle cx="280" cy="270" r="7" fill="var(--accent-3)" />
  </svg>
);

interface NavItem { name: string; href: string; icon: React.FC<{ size?: number; color?: string }>; badge?: string; }
interface NavGroup { label: string; items: NavItem[]; }

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Dashboard },
      { name: 'Users', href: '/users', icon: Users, badge: '1.2K' },
      { name: 'Servers', href: '/servers', icon: Server },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { name: 'Inbounds', href: '/inbounds', icon: Radio },
      { name: 'Subscriptions', href: '/subscriptions', icon: Package },
      { name: 'Tunnel', href: '/tunnel', icon: Tunnel },
    ],
  },
  {
    label: 'Network',
    items: [
      { name: 'Nodes', href: '/nodes', icon: Globe },
      { name: 'Routing', href: '/routing', icon: GitBranch },
      { name: 'Firewall', href: '/settings', icon: Shield },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Logs', href: '/logs', icon: ScrollText, badge: '5' },
      { name: 'Telegram', href: '/telegram', icon: Bot },
      { name: 'Backups', href: '/backups', icon: HardDrive },
      { name: 'Plugins', href: '/settings', icon: Plug },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-[240px] flex flex-col backdrop-blur-[40px]"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <Logo />
        <div>
          <h1 className="text-lg font-extrabold neon-text tracking-tight leading-none">Z-UI</h1>
          <p className="text-[7.5px] uppercase tracking-[2.5px] leading-none mt-0.5" style={{ color: 'var(--text-3)' }}>
            Proxy Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <div
              className="text-[8px] uppercase tracking-[2px] font-semibold px-3 pt-3.5 pb-1"
              style={{ color: 'var(--text-3)' }}
            >
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/settings' && pathname.startsWith(item.href + '/'));
              const IconComp = item.icon;
              return (
                <Link
                  key={item.href + item.name}
                  href={item.href}
                  className="sidebar-link"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(0,180,255,0.06), rgba(124,58,237,0.04))',
                    color: 'var(--accent-1)',
                    fontWeight: 600,
                  } : {}}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/4 h-1/2 w-[2.5px] rounded-full" style={{ background: 'var(--accent-1)' }} />
                  )}
                  <IconComp size={16} color={isActive ? 'var(--accent-1)' : 'var(--text-3)'} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded-md min-w-[16px] text-center"
                      style={{ background: 'var(--danger)', color: '#fff' }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <div className="w-[5px] h-[5px] rounded-full" style={{ background: 'var(--accent-1)', animation: 'pulse 2s infinite' }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-2" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ background: 'var(--accent-g)' }}
          >
            A
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text-0)' }}>Admin</p>
            <p className="text-[8px] truncate" style={{ color: 'var(--text-3)' }}>Super Admin</p>
          </div>
        </div>
        <p className="text-center text-[7px] mt-1 tracking-wide" style={{ color: 'var(--text-3)' }}>
          Z-UI v1.0.0 — @Zendan_Ui
        </p>
      </div>
    </aside>
  );
}
