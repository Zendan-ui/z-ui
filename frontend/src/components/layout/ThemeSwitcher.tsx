'use client';

import React, { useEffect } from 'react';
import { useThemeStore, applyTheme, ThemeMode } from '@/store/theme';

const themeOptions: { id: ThemeMode; label: string; bg: string }[] = [
  { id: 'dark', label: 'Dark', bg: 'linear-gradient(135deg, #10101e, #1a1a32)' },
  { id: 'darker', label: 'Darker', bg: 'linear-gradient(135deg, #040408, #101022)' },
  { id: 'amoled', label: 'AMOLED', bg: 'linear-gradient(135deg, #000000, #0a0a10)' },
];

export default function ThemeSwitcher() {
  const { mode, setTheme } = useThemeStore();

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  const handleSwitch = (m: ThemeMode) => {
    setTheme(m);
    applyTheme(m);
  };

  return (
    <div className="theme-switch">
      {themeOptions.map((t) => (
        <button
          key={t.id}
          onClick={() => handleSwitch(t.id)}
          className={`theme-btn ${mode === t.id ? 'active' : ''}`}
          style={{ background: t.bg }}
          title={t.label}
        />
      ))}
    </div>
  );
}
