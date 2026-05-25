import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import locales, { Locale } from '@/i18n/locales';

interface LangState {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

function translate(lang: Locale, key: string): string {
  const keys = key.split('.');
  let val: any = locales[lang];
  for (const k of keys) { val = val?.[k]; }
  if (typeof val === 'string') return val;
  // Fallback to English
  val = locales.en as any;
  for (const k of keys) { val = val?.[k]; }
  return typeof val === 'string' ? val : key;
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'en' as Locale,
      isRTL: false,
      setLang: (l: Locale) => {
        const rtl = l === 'fa';
        document.documentElement.dir = rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = l;
        set({ lang: l, isRTL: rtl });
      },
      t: (key: string) => translate(get().lang, key),
    }),
    { name: 'z-ui-lang', partialize: (s) => ({ lang: s.lang }) }
  )
);

export default useLangStore;
