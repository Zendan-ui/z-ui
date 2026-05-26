import { createI18n } from 'vue-i18n'
import en from './en'
import fa from './fa'
import ru from './ru'
import ar from './ar'
import { languageOptions, rtlLocales, type UiLocale } from '@/config/ui'

const defaultLocale = (localStorage.getItem('locale') as UiLocale | null) ?? 'en'

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    fa,
    ru,
    ar,
  },
})

export const locale = (() => {
  const l = i18n.global.locale.value as UiLocale
  switch (l) {
    case 'fa':
      return 'fa-IR'
    case 'ar':
      return 'ar-SA'
    default:
      return l
  }
})()

export const languages = languageOptions
export const isRtlLocale = (l: string) => rtlLocales.includes(l as UiLocale)
