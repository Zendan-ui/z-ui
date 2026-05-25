'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Dashboard, Users, Server, Radio, Package, Globe,
  GitBranch, ScrollText, Bot, HardDrive, Settings, Tunnel as TunnelIcon
} from '@/components/ui/Icons';
import { useLangStore } from '@/store/language';

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
    <g filter="url(#sGl)"><path d="M 120 130 L 280 130 L 120 270 L 280 270" fill="none" stroke="url(#sG)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" /></g>
  </svg>
);

interface NavItem { name: string; href: string; icon: React.FC<any>; badge?: string }
interface NavGroup { label: string; items: NavItem[] }

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLangStore();

  const navGroups: NavGroup[] = [
    {
      label: t('common.overview'),
      items: [
        { name: t('common.dashboard'), href: '/dashboard', icon: Dashboard },
        { name: t('common.users'), href: '/users', icon: Users },
        { name: t('common.servers'), href: '/servers', icon: Server },
      ],
    },
    {
      label: t('common.configuration'),
      items: [
        { name: t('common.inbounds'), href: '/inbounds', icon: Radio },
        { name: t('common.subscriptions'), href: '/subscriptions', icon: Package },
        { name: t('common.tunnel'), href: '/tunnel', icon: TunnelIcon },
      ],
    },
    {
      label: t('common.network'),
      items: [
        { name: t('common.nodes'), href: '/nodes', icon: Globe },
        { name: t('common.routing'), href: '/routing', icon: GitBranch },
      ],
    },
    {
      label: t('common.system'),
      items: [
        { name: t('common.logs'), href: '/logs', icon: ScrollText },
        { name: t('common.telegram'), href: '/telegram', icon: Bot },
        { name: t('common.backups'), href: '/backups', icon: HardDrive },
        { name: t('common.settings'), href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] flex flex-col backdrop-blur-[40px]"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}>

      <div className="flex items-center gap-2.5 px-4 py-4 bb">
        <Logo />
        <div>
          <h1 className="text-lg font-extrabold neon-text tracking-tight leading-none">Z-UI</h1>
          <p className="text-[7.5px] uppercase tracking-[2.5px] leading-none mt-0.5 c3">{t('common.proxyManagement')}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <div className="text-[8px] uppercase tracking-[2px] font-semibold px-3 pt-3.5 pb-1 c3">{group.label}</div>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const IC = item.icon;
              return (
                <Link key={item.href + item.name} href={item.href} className="sidebar-link"
                  style={isActive ? { background: 'linear-gradient(135deg,rgba(var(--accent-1-r,59),var(--accent-1-g,130),var(--accent-1-b,246),.08),transparent)', color: 'var(--accent-1)', fontWeight: 600 } : {}}>
                  {isActive && <div className="absolute left-0 top-1/4 h-1/2 w-[2.5px] rounded-full" style={{ background: 'var(--accent-1)' }} />}
                  <IC size={16} color={isActive ? 'var(--accent-1)' : 'var(--text-3)'} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'var(--danger,#ef4444)', color: '#fff' }}>{item.badge}</span>}
                  {isActive && !item.badge && <div className="w-[5px] h-[5px] rounded-full" style={{ background: 'var(--accent-1)', animation: 'pulse 2s infinite' }} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-2.5 py-2 bt">
        <p className="text-center text-[7px] c3 tracking-wide">Z-UI v1.0.0 — @Zendan_Ui</p>
      </div>
    </aside>
  );
}
