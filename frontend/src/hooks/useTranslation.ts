import { useAuthStore } from '@/store/auth';
import locales, { Locale } from '@/i18n/locales';

export function useTranslation() {
  const lang = (useAuthStore.getState().admin?.language || 'en') as Locale;
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = locales[lang] || locales.en;
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value === 'string') return value;
    // Fallback to English
    value = locales.en as any;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  const isRTL = lang === 'fa';

  return { t, lang, isRTL };
}
