'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import ThemeSwitcher from './ThemeSwitcher';
import { Bell, Search, ScrollText, LogOut, User, Key } from '@/components/ui/Icons';

export default function Header() {
  const { admin, logout } = useAuthStore();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-5 bb" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(30px)' }}>
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 c3" />
        <input type="text" placeholder="Search..." className="input-field !py-[7px] !text-xs !w-[260px] focus:!w-[320px] !pl-8 transition-all" />
      </div>

      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <button className="w-[34px] h-[34px] rounded-[9px] bg-g b flex items-center justify-center relative c1 hover:c0 transition-colors">
          <Bell size={14} /><span className="absolute -top-[3px] -right-[3px] w-[15px] h-[15px] rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center" style={{ border: '2px solid var(--bg-0)' }}>3</span>
        </button>
        <button className="w-[34px] h-[34px] rounded-[9px] bg-g b flex items-center justify-center c1 hover:c0 transition-colors"><ScrollText size={14} /></button>
        <select className="py-[5px] px-2.5 rounded-lg bg-g b c0 text-[11px] outline-none cursor-pointer">
          <option>🇬🇧 EN</option><option>🇮🇷 FA</option><option>🇷🇺 RU</option>
        </select>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className={`flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all ${showMenu ? 'bg-g' : ''}`}>
            <div className="w-[30px] h-[30px] rounded-[9px] bg-accent flex items-center justify-center text-white text-[11px] font-bold">{admin?.username?.[0]?.toUpperCase() || 'A'}</div>
            <div className="hidden md:block text-left"><p className="text-xs font-semibold c0">{admin?.username || 'Admin'}</p><p className="text-[9px] c3">{admin?.role || 'superadmin'}</p></div>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-card p-1.5 animate-fade z-50">
              <button className="w-full text-left px-3 py-2 rounded-lg text-xs c1 hover:bg-g flex items-center gap-2 transition-colors"><User size={13} /> Profile</button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-xs c1 hover:bg-g flex items-center gap-2 transition-colors"><Key size={13} /> Password</button>
              <div className="my-1 h-px bg-g" />
              <button onClick={() => { logout(); router.push('/login'); }} className="w-full text-left px-3 py-2 rounded-lg text-xs cerr hover:bg-err flex items-center gap-2 transition-colors"><LogOut size={13} /> Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
