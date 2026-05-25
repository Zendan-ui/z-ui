'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useLangStore } from '@/store/language';
import { useRouter } from 'next/navigation';
import ThemeSwitcher from './ThemeSwitcher';
import { Bell, Search, LogOut, User, Key, Settings } from '@/components/ui/Icons';
import type { Locale } from '@/i18n/locales';

export default function Header() {
  const { admin, logout } = useAuthStore();
  const { lang, setLang, t } = useLangStore();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-5 bb"
      style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(30px)' }}>

      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 c3" />
        <input type="text" placeholder={t('common.search') + '...'}
          className="input-field !py-[7px] !text-xs !w-[220px] focus:!w-[280px] !pl-8 transition-all" />
      </div>

      <div className="flex items-center gap-2">
        <ThemeSwitcher />

        <select value={lang} onChange={(e) => setLang(e.target.value as Locale)}
          className="py-[5px] px-2 rounded-lg bg-g b c0 text-[11px] outline-none cursor-pointer">
          <option value="en">EN</option>
          <option value="fa">FA</option>
          <option value="ru">RU</option>
        </select>

        <button className="w-[34px] h-[34px] rounded-[9px] bg-g b flex items-center justify-center relative c1 hover:c0 transition-colors">
          <Bell size={14} />
        </button>

        {/* Profile */}
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all ${showMenu ? 'bg-g' : ''}`}>
            <div className="w-[30px] h-[30px] rounded-[9px] bg-accent flex items-center justify-center text-white text-[11px] font-bold">
              {admin?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold c0">{admin?.username || 'Admin'}</p>
              <p className="text-[9px] c3">{admin?.role || 'superadmin'}</p>
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-52 glass-card p-1.5 animate-fade z-50" onClick={(e) => e.stopPropagation()}>
              {/* User info */}
              <div className="px-3 py-2 bb mb-1">
                <p className="text-xs font-semibold c0">{admin?.username || 'Admin'}</p>
                <p className="text-[10px] c3">{admin?.email || admin?.role || 'superadmin'}</p>
              </div>

              {/* Settings */}
              <button onClick={() => { setShowMenu(false); router.push('/settings'); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs c1 hover:bg-g flex items-center gap-2 transition-colors">
                <Settings size={13} /> {t('common.settings')}
              </button>

              {/* Change password - goes to settings */}
              <button onClick={() => { setShowMenu(false); router.push('/settings'); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs c1 hover:bg-g flex items-center gap-2 transition-colors">
                <Key size={13} /> {t('login.password')}
              </button>

              <div className="my-1 h-px bg-g" />

              {/* Logout */}
              <button onClick={() => { logout(); setShowMenu(false); router.push('/login'); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors cerr hover:bg-err">
                <LogOut size={13} /> {t('common.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
