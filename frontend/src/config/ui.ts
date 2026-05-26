export type UiTheme = 'midnight' | 'aurora' | 'graphite' | 'pearl'
export type UiLocale = 'en' | 'fa' | 'ru' | 'ar'

export const rtlLocales: UiLocale[] = ['fa', 'ar']

export const languageOptions: Array<{ title: string; value: UiLocale; flag: string; short: string }> = [
  { title: 'English', value: 'en', flag: '🇬🇧', short: 'EN' },
  { title: 'فارسی', value: 'fa', flag: '🇮🇷', short: 'FA' },
  { title: 'Русский', value: 'ru', flag: '🇷🇺', short: 'RU' },
  { title: 'العربية', value: 'ar', flag: '🇸🇦', short: 'AR' },
]

export const themeOptions: Array<{ value: UiTheme; icon: string; color: string }> = [
  { value: 'midnight', icon: 'mdi-weather-night', color: '#7c6cff' },
  { value: 'aurora', icon: 'mdi-shimmer', color: '#14d2b8' },
  { value: 'graphite', icon: 'mdi-hexagon-multiple', color: '#94a3b8' },
  { value: 'pearl', icon: 'mdi-white-balance-sunny', color: '#f59e0b' },
]
