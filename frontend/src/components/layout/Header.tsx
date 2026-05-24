'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  const { admin, logout } = useAuthStore();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between px-5 backdrop-blur-[30px]"
      style={{
        background: 'rgba(0,0,0,0.6)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Search */}
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px]" style={{ color: 'var(--text-3)' }}>🔍</span>
        <input
          type="text"
          placeholder="Search users, servers, configs..."
          className="input-field pl-8 !py-[7px] !text-xs !w-[280px] focus:!w-[340px] transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <button
          className="relative w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[13px] transition-all"
          style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
        >
          🔔
          <span className="absolute -top-[3px] -right-[3px] w-[15px] h-[15px] rounded-full text-[8px] font-bold flex items-center justify-center text-white"
            style={{ background: 'var(--danger)', border: '2px solid var(--bg-0)' }}>
            7
          </span>
        </button>

        {/* Live Logs */}
        <button
          className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[13px] transition-all"
          style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
          title="Live Logs"
        >
          📜
        </button>

        {/* Language */}
        <select
          className="py-[5px] px-2.5 rounded-lg text-[11px] cursor-pointer outline-none"
          style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-0)' }}
        >
          <option value="en">🇬🇧 EN</option>
          <option value="fa">🇮🇷 FA</option>
          <option value="ru">🇷🇺 RU</option>
        </select>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all"
            style={{ background: showMenu ? 'var(--bg-glass)' : 'transparent' }}
          >
            <div
              className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center text-white text-[11px] font-bold"
              style={{ background: 'var(--accent-g)' }}
            >
              {admin?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-0)' }}>{admin?.username || 'Admin'}</p>
              <p className="text-[9px]" style={{ color: 'var(--text-3)' }}>{admin?.role || 'superadmin'}</p>
            </div>
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 glass-card p-1.5 animate-fade z-50"
            >
              <button className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all hover:opacity-80" style={{ color: 'var(--text-1)' }}>
                👤 Profile
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all hover:opacity-80" style={{ color: 'var(--text-1)' }}>
                🔑 Change Password
              </button>
              <div className="neon-line my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all hover:opacity-80"
                style={{ color: 'var(--danger)' }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
