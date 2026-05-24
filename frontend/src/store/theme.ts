import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'darker' | 'amoled';

export interface ThemeColors {
  bg0: string;
  bg1: string;
  bg2: string;
  bg3: string;
  bgCard: string;
  bgCardHover: string;
  bgGlass: string;
  bgInput: string;
  border: string;
  borderActive: string;
  text0: string;
  text1: string;
  text2: string;
  text3: string;
  accent1: string;
  accent2: string;
  accent3: string;
  accentGradient: string;
  sidebarBg: string;
}

const themes: Record<ThemeMode, ThemeColors> = {
  dark: {
    bg0: '#0c0c14',
    bg1: '#10101e',
    bg2: '#141428',
    bg3: '#1a1a32',
    bgCard: 'rgba(16,16,34,0.85)',
    bgCardHover: 'rgba(22,22,44,0.9)',
    bgGlass: 'rgba(255,255,255,0.035)',
    bgInput: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.07)',
    borderActive: 'rgba(0,180,255,0.35)',
    text0: '#f0f0f5',
    text1: '#b0b0c0',
    text2: '#707088',
    text3: '#44445a',
    accent1: '#00b4ff',
    accent2: '#7c3aed',
    accent3: '#c471f5',
    accentGradient: 'linear-gradient(135deg, #00b4ff, #7c3aed)',
    sidebarBg: 'rgba(8,8,20,0.96)',
  },
  darker: {
    bg0: '#040408',
    bg1: '#08080f',
    bg2: '#0c0c18',
    bg3: '#101022',
    bgCard: 'rgba(8,8,20,0.9)',
    bgCardHover: 'rgba(12,12,30,0.92)',
    bgGlass: 'rgba(255,255,255,0.025)',
    bgInput: 'rgba(255,255,255,0.035)',
    border: 'rgba(255,255,255,0.05)',
    borderActive: 'rgba(0,180,255,0.3)',
    text0: '#e8e8f0',
    text1: '#a0a0b4',
    text2: '#606078',
    text3: '#3a3a50',
    accent1: '#00a0ee',
    accent2: '#6d28d9',
    accent3: '#a855f7',
    accentGradient: 'linear-gradient(135deg, #00a0ee, #6d28d9)',
    sidebarBg: 'rgba(4,4,12,0.97)',
  },
  amoled: {
    bg0: '#000000',
    bg1: '#000000',
    bg2: '#050508',
    bg3: '#0a0a10',
    bgCard: 'rgba(4,4,10,0.92)',
    bgCardHover: 'rgba(8,8,16,0.95)',
    bgGlass: 'rgba(255,255,255,0.018)',
    bgInput: 'rgba(255,255,255,0.025)',
    border: 'rgba(255,255,255,0.04)',
    borderActive: 'rgba(0,180,255,0.25)',
    text0: '#e0e0e8',
    text1: '#9090a8',
    text2: '#505068',
    text3: '#303044',
    accent1: '#00b4ff',
    accent2: '#7c3aed',
    accent3: '#c471f5',
    accentGradient: 'linear-gradient(135deg, #00b4ff, #7c3aed)',
    sidebarBg: 'rgba(0,0,0,0.98)',
  },
};

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'amoled',
      colors: themes.amoled,
      setTheme: (mode: ThemeMode) =>
        set({ mode, colors: themes[mode] }),
    }),
    { name: 'z-ui-theme' }
  )
);

export function applyTheme(mode: ThemeMode) {
  const t = themes[mode];
  const root = document.documentElement;
  root.style.setProperty('--bg-0', t.bg0);
  root.style.setProperty('--bg-1', t.bg1);
  root.style.setProperty('--bg-2', t.bg2);
  root.style.setProperty('--bg-3', t.bg3);
  root.style.setProperty('--bg-card', t.bgCard);
  root.style.setProperty('--bg-card-hover', t.bgCardHover);
  root.style.setProperty('--bg-glass', t.bgGlass);
  root.style.setProperty('--bg-input', t.bgInput);
  root.style.setProperty('--border', t.border);
  root.style.setProperty('--border-active', t.borderActive);
  root.style.setProperty('--text-0', t.text0);
  root.style.setProperty('--text-1', t.text1);
  root.style.setProperty('--text-2', t.text2);
  root.style.setProperty('--text-3', t.text3);
  root.style.setProperty('--accent-1', t.accent1);
  root.style.setProperty('--accent-2', t.accent2);
  root.style.setProperty('--accent-3', t.accent3);
  root.style.setProperty('--accent-g', t.accentGradient);
  root.style.setProperty('--sidebar-bg', t.sidebarBg);
}

export { themes };
export default useThemeStore;
