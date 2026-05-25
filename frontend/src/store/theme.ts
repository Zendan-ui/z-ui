import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'blue' | 'green' | 'dark' | 'light';

interface ThemeColors {
  bg0: string; bg1: string; bg2: string; bg3: string;
  bgCard: string; bgCardHover: string; bgGlass: string; bgInput: string;
  border: string; borderActive: string;
  text0: string; text1: string; text2: string; text3: string;
  accent1: string; accent2: string; accent3: string;
  accentG: string; sidebarBg: string;
}

const themes: Record<ThemeMode, ThemeColors> = {
  // آبی-سیاه (پیش‌فرض) — رنگ آبی ملایم روی سیاه
  blue: {
    bg0:'#060b18',bg1:'#0a1628',bg2:'#0f1d35',bg3:'#152742',
    bgCard:'rgba(10,22,40,.88)',bgCardHover:'rgba(15,29,53,.92)',
    bgGlass:'rgba(59,130,246,.04)',bgInput:'rgba(59,130,246,.06)',
    border:'rgba(59,130,246,.1)',borderActive:'rgba(59,130,246,.4)',
    text0:'#e8edf5',text1:'#93a5c4',text2:'#5d7599',text3:'#3a4f6e',
    accent1:'#3b82f6',accent2:'#2563eb',accent3:'#60a5fa',
    accentG:'linear-gradient(135deg,#3b82f6,#1d4ed8)',sidebarBg:'rgba(6,11,24,.96)',
  },
  // سبز-سیاه — رنگ سبز ملایم روی سیاه
  green: {
    bg0:'#06120a',bg1:'#0a1f12',bg2:'#0f2d1a',bg3:'#153b23',
    bgCard:'rgba(10,31,18,.88)',bgCardHover:'rgba(15,45,26,.92)',
    bgGlass:'rgba(34,197,94,.04)',bgInput:'rgba(34,197,94,.06)',
    border:'rgba(34,197,94,.1)',borderActive:'rgba(34,197,94,.4)',
    text0:'#e8f5ec',text1:'#93c4a5',text2:'#5d9975',text3:'#3a6e4f',
    accent1:'#22c55e',accent2:'#16a34a',accent3:'#4ade80',
    accentG:'linear-gradient(135deg,#22c55e,#15803d)',sidebarBg:'rgba(6,18,10,.96)',
  },
  // سیاه خالص — مینیمال
  dark: {
    bg0:'#000000',bg1:'#0a0a0a',bg2:'#111111',bg3:'#1a1a1a',
    bgCard:'rgba(12,12,12,.9)',bgCardHover:'rgba(20,20,20,.94)',
    bgGlass:'rgba(255,255,255,.03)',bgInput:'rgba(255,255,255,.05)',
    border:'rgba(255,255,255,.07)',borderActive:'rgba(255,255,255,.2)',
    text0:'#e4e4e4',text1:'#a0a0a0',text2:'#666666',text3:'#444444',
    accent1:'#888888',accent2:'#666666',accent3:'#aaaaaa',
    accentG:'linear-gradient(135deg,#555,#333)',sidebarBg:'rgba(0,0,0,.98)',
  },
  // سفید نرم — روشن ملایم، چشم اذیت نکنه
  light: {
    bg0:'#f0f2f5',bg1:'#e8ebf0',bg2:'#dde1e8',bg3:'#d0d5de',
    bgCard:'rgba(255,255,255,.85)',bgCardHover:'rgba(255,255,255,.95)',
    bgGlass:'rgba(0,0,0,.03)',bgInput:'rgba(0,0,0,.04)',
    border:'rgba(0,0,0,.08)',borderActive:'rgba(59,130,246,.4)',
    text0:'#1a1a2e',text1:'#3a3a5c',text2:'#6a6a8a',text3:'#9a9ab0',
    accent1:'#2563eb',accent2:'#1d4ed8',accent3:'#3b82f6',
    accentG:'linear-gradient(135deg,#2563eb,#1d4ed8)',sidebarBg:'rgba(255,255,255,.97)',
  },
};

export const themeList: { id: ThemeMode; label: string; labelFa: string; labelRu: string; color: string }[] = [
  { id: 'blue', label: 'Blue Dark', labelFa: 'آبی تیره', labelRu: 'Синяя', color: '#3b82f6' },
  { id: 'green', label: 'Green Dark', labelFa: 'سبز تیره', labelRu: 'Зелёная', color: '#22c55e' },
  { id: 'dark', label: 'Pure Black', labelFa: 'سیاه خالص', labelRu: 'Чёрная', color: '#444444' },
  { id: 'light', label: 'Soft Light', labelFa: 'روشن نرم', labelRu: 'Светлая', color: '#e8ebf0' },
];

interface ThemeState {
  mode: ThemeMode;
  setTheme: (m: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist((set) => ({
    mode: 'blue',
    setTheme: (m) => { set({ mode: m }); applyTheme(m); },
  }), { name: 'z-ui-theme' })
);

export function applyTheme(m: ThemeMode) {
  const t = themes[m];
  if (!t) return;
  const s = document.documentElement.style;
  s.setProperty('--bg-0',t.bg0);s.setProperty('--bg-1',t.bg1);s.setProperty('--bg-2',t.bg2);s.setProperty('--bg-3',t.bg3);
  s.setProperty('--bg-card',t.bgCard);s.setProperty('--bg-card-hover',t.bgCardHover);
  s.setProperty('--bg-glass',t.bgGlass);s.setProperty('--bg-input',t.bgInput);
  s.setProperty('--border',t.border);s.setProperty('--border-active',t.borderActive);
  s.setProperty('--text-0',t.text0);s.setProperty('--text-1',t.text1);s.setProperty('--text-2',t.text2);s.setProperty('--text-3',t.text3);
  s.setProperty('--accent-1',t.accent1);s.setProperty('--accent-2',t.accent2);s.setProperty('--accent-3',t.accent3);
  s.setProperty('--accent-g',t.accentG);s.setProperty('--sidebar-bg',t.sidebarBg);
  // Light mode special handling
  document.documentElement.classList.toggle('light-mode', m === 'light');
}

export default useThemeStore;
