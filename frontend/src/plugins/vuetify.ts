import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles/main.css'

import { ar, fa, en, ru } from 'vuetify/locale'
import { createVuetify } from 'vuetify'
import type { UiTheme } from '@/config/ui'

const defaultTheme = ((localStorage.getItem('theme') as UiTheme | null) ?? 'black')

export default createVuetify({
  defaults: {
    VRow: { density: 'compact' },
    VCard: {
      rounded: 'xl',
      elevation: 0,
    },
    VTextField: {
      variant: 'solo-filled',
      rounded: 'xl',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'solo-filled',
      rounded: 'xl',
      hideDetails: 'auto',
    },
    VCombobox: {
      variant: 'solo-filled',
      rounded: 'xl',
      hideDetails: 'auto',
    },
    VTextarea: {
      variant: 'solo-filled',
      rounded: 'xl',
      hideDetails: 'auto',
    },
    VBtn: {
      rounded: 'xl',
      elevation: 0,
    },
    VChip: {
      rounded: 'xl',
    },
  },
  theme: {
    defaultTheme,
    themes: {
      midnight: {
        dark: true,
        colors: {
          primary: '#7c6cff',
          secondary: '#19d3ff',
          accent: '#ff5fd2',
          background: '#081120',
          surface: '#101b31',
          'surface-variant': '#16233f',
          'on-surface': '#f4f7ff',
          info: '#3abff8',
          success: '#21c97a',
          warning: '#f6c85f',
          error: '#ff6b7a',
        },
      },
      aurora: {
        dark: true,
        colors: {
          primary: '#14d2b8',
          secondary: '#7cf29a',
          accent: '#62c1ff',
          background: '#061816',
          surface: '#0e2420',
          'surface-variant': '#12302c',
          'on-surface': '#edfefb',
          info: '#4ecbff',
          success: '#32d583',
          warning: '#fac515',
          error: '#ff6b6b',
        },
      },
      black: {
        dark: true,
        colors: {
          primary: '#f5f5f5',
          secondary: '#8b9bb4',
          accent: '#4f46e5',
          background: '#020202',
          surface: '#0a0a0a',
          'surface-variant': '#111111',
          'on-surface': '#f5f5f5',
          info: '#60a5fa',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      white: {
        dark: false,
        colors: {
          primary: '#111827',
          secondary: '#475569',
          accent: '#4f46e5',
          background: '#ffffff',
          surface: '#fbfbfc',
          'surface-variant': '#f1f5f9',
          'on-surface': '#111827',
          info: '#0284c7',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
        },
      },
      graphite: {
        dark: true,
        colors: {
          primary: '#9aa4b2',
          secondary: '#d1d5db',
          accent: '#60a5fa',
          background: '#0b0f14',
          surface: '#161b22',
          'surface-variant': '#1f2630',
          'on-surface': '#f3f4f6',
          info: '#60a5fa',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
      pearl: {
        dark: false,
        colors: {
          primary: '#6d5dfc',
          secondary: '#0ea5e9',
          accent: '#f59e0b',
          background: '#f5f7fb',
          surface: '#ffffff',
          'surface-variant': '#eef2ff',
          'on-surface': '#172033',
          info: '#0284c7',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
        },
      },
    },
  },
  locale: {
    locale: (localStorage.getItem('locale') ?? 'en'),
    fallback: 'en',
    messages: { en, fa, ru, ar },
  },
})
