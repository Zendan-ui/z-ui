'use client';

import React, { useEffect } from 'react';
import { useThemeStore, applyTheme, themeList } from '@/store/theme';

export default function ThemeSwitcher() {
  const { mode, setTheme } = useThemeStore();
  useEffect(() => { applyTheme(mode); }, [mode]);

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-g b">
      {themeList.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className="w-5 h-5 rounded-md transition-all hover:scale-110"
          style={{
            background: t.color,
            border: mode === t.id ? '2px solid var(--text-0)' : '2px solid transparent',
            boxShadow: mode === t.id ? '0 0 6px ' + t.color + '60' : 'none',
          }}
        />
      ))}
    </div>
  );
}
