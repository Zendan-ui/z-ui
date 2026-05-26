<template>
  <v-sheet class="zui-page-hero mb-4" rounded="xl">
    <div class="d-flex flex-column flex-lg-row align-start align-lg-center justify-space-between ga-4">
      <div class="d-flex align-start ga-4">
        <div class="zui-hero-icon-wrap d-none d-sm-grid">
          <ZuiGlyph :name="pageGlyph" :size="28" />
        </div>
        <div>
          <div class="text-overline zui-kicker">Z-UI Workspace</div>
          <div class="text-h4 font-weight-black mb-1">{{ pageTitle }}</div>
          <div class="text-body-2 text-medium-emphasis">{{ pageSubtitle }}</div>
        </div>
      </div>
      <div class="d-flex flex-wrap ga-2 zui-hero-chips">
        <v-chip color="primary" variant="tonal" size="small">{{ activeThemeLabel }}</v-chip>
        <v-chip color="secondary" variant="tonal" size="small">{{ activeLanguageLabel }}</v-chip>
        <v-chip color="success" variant="tonal" size="small">Exclusive UI</v-chip>
        <v-chip color="warning" variant="tonal" size="small">Ctrl+K</v-chip>
      </div>
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import ZuiGlyph from './ZuiGlyph.vue'

const route = useRoute()
const { t, locale } = useI18n()
const theme = useTheme()

const pageKey = computed(() => String(route.name || 'pages.home'))
const pageTitle = computed(() => t(pageKey.value))
const pageGlyph = computed(() => ({
  'pages.home': 'home',
  'pages.inbounds': 'inbounds',
  'pages.outbounds': 'outbounds',
  'pages.clients': 'clients',
  'pages.endpoints': 'endpoints',
  'pages.services': 'services',
  'pages.tls': 'tls',
  'pages.basics': 'basics',
  'pages.rules': 'rules',
  'pages.dns': 'dns',
  'pages.admins': 'admins',
  'pages.settings': 'settings',
}[pageKey.value] || 'spark'))

const subtitles: Record<string, string> = {
  'pages.home': 'Operational overview, live health and usage insights in one place.',
  'pages.inbounds': 'Design and manage secure entry points with cleaner visibility and faster actions.',
  'pages.outbounds': 'Shape egress behavior, test links and monitor route quality with confidence.',
  'pages.services': 'Organize helper services and network-facing listeners with a polished workflow.',
  'pages.endpoints': 'Publish external connection points with clearer cards and tighter controls.',
  'pages.clients': 'Manage user access, limits, QR codes and traffic in a refined workspace.',
  'pages.rules': 'Build smarter routing logic with a cleaner, operator-focused rules experience.',
  'pages.tls': 'Secure every edge with a better looking certificate and TLS management panel.',
  'pages.basics': 'Tune core runtime, logging and performance defaults with better structure.',
  'pages.dns': 'Control DNS servers and rules in a cleaner and more readable configuration flow.',
  'pages.admins': 'Review administrators, audit changes and API tokens in one premium view.',
  'pages.settings': 'Adjust panel endpoints, subscription paths and security options with clarity.',
}

const pageSubtitle = computed(() => subtitles[pageKey.value] || 'Modern control surfaces built for operators who need speed, clarity and elegance.')
const activeThemeLabel = computed(() => t(`theme.${String(theme.global.name.value)}`))
const activeLanguageLabel = computed(() => {
  const map: Record<string, string> = { en: 'English', fa: 'فارسی', ru: 'Русский', ar: 'العربية' }
  return map[String(locale.value)] || String(locale.value)
})
</script>

<style scoped>
.zui-page-hero {
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), .88), rgba(var(--v-theme-surface-variant), .62));
  border: 1px solid rgba(var(--v-theme-on-surface), .08);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 50px rgba(0,0,0,.14);
}
.zui-kicker {
  letter-spacing: .18em;
  opacity: .7;
}
.zui-hero-icon-wrap {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  place-items: center;
  background: rgba(var(--v-theme-surface-variant), .72);
  border: 1px solid rgba(var(--v-theme-on-surface), .05);
}
</style>
