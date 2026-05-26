<template>
  <v-app-bar flat class="zui-app-bar" height="76">
    <v-btn v-if="isMobile" icon variant="text" @click="emit('toggleDrawer')">
      <v-icon icon="mdi-menu" />
    </v-btn>
    <span v-else style="width: 12px"></span>

    <div class="d-flex align-center ga-3 zui-app-brand">
      <v-avatar size="42" class="zui-avatar">
        <img src="@/assets/logo.svg" alt="Z-UI" />
      </v-avatar>
      <div class="d-flex align-center ga-3 min-w-0">
        <div class="zui-route-glyph d-none d-sm-grid">
          <ZuiGlyph :name="routeGlyph" :size="18" />
        </div>
        <div>
          <div class="zui-brand-title">Z-UI</div>
          <div class="zui-brand-subtitle">{{ $t(<string>route.name) }}</div>
        </div>
      </div>
    </div>

    <v-spacer />

    <v-chip size="small" color="primary" variant="tonal" class="me-2 d-none d-lg-inline-flex">
      Custom Icons · Mission Control · 6 Themes
    </v-chip>

    <v-chip size="small" variant="tonal" class="me-2 zui-clock-chip d-none d-md-inline-flex">
      {{ now }}
    </v-chip>

    <v-btn class="me-1" variant="tonal" color="warning" @click="openRadar">
      <ZuiGlyph name="alert" :size="16" />
      <span class="ms-2">{{ alertCount }}</span>
    </v-btn>

    <v-menu location="bottom end">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" variant="text">
          <v-icon>mdi-translate</v-icon>
        </v-btn>
      </template>
      <v-card min-width="230" class="zui-menu-card">
        <v-card-text class="pa-2">
          <div class="text-caption text-medium-emphasis mb-2 px-2">Language</div>
          <v-list density="compact" class="py-0 bg-transparent">
            <v-list-item
              v-for="lang in languages"
              :key="lang.value"
              rounded="xl"
              @click="changeLocale(lang.value)"
              :active="isActiveLocale(lang.value)"
            >
              <template #prepend>
                <span class="text-subtitle-1">{{ lang.flag }}</span>
              </template>
              <v-list-item-title>{{ lang.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-menu>

    <v-menu location="bottom end">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" variant="text">
          <v-icon>mdi-palette-outline</v-icon>
        </v-btn>
      </template>
      <v-card min-width="250" class="zui-menu-card">
        <v-card-text class="pa-2">
          <div class="text-caption text-medium-emphasis mb-2 px-2">Themes</div>
          <v-list density="compact" class="py-0 bg-transparent">
            <v-list-item
              v-for="th in themes"
              :key="th.value"
              rounded="xl"
              @click="changeTheme(th.value)"
              :active="isActiveTheme(th.value)"
            >
              <template #prepend>
                <span class="zui-theme-dot" :style="{ background: th.color }"></span>
              </template>
              <v-list-item-title>{{ $t(`theme.${th.value}`) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useLocale, useTheme } from 'vuetify'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { languages } from '@/locales'
import { themeOptions } from '@/config/ui'
import ZuiGlyph from '@/components/ui/ZuiGlyph.vue'
import { useZuiRadar } from '@/composables/useZuiRadar'

const emit = defineEmits(['toggleDrawer'])
defineProps<{ isMobile: boolean }>()

const route = useRoute()
const { locale: i18nLocale } = useI18n()
const vuetifyLocale = useLocale()
const theme = useTheme()
const themes = themeOptions
const { alertCount } = useZuiRadar()
const clock = ref(new Date())
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => { clock.value = new Date() }, 1000)
})
onBeforeUnmount(() => timer && clearInterval(timer))

const now = computed(() => clock.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const routeGlyph = computed(() => ({
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
}[String(route.name)] || 'spark'))

const changeLocale = (l: string) => {
  i18nLocale.value = l
  vuetifyLocale.current.value = l
  localStorage.setItem('locale', l)
  window.location.reload()
}
const isActiveLocale = (l: string) => i18nLocale.value === l

const changeTheme = (th: string) => {
  theme.global.name.value = th as never
  localStorage.setItem('theme', th)
}
const isActiveTheme = (th: string) => theme.global.name.value === th

const openRadar = () => window.dispatchEvent(new Event('zui:open-radar'))
</script>

<style scoped>
.zui-app-bar {
  margin-block-start: 14px;
  margin-inline-start: 312px;
  margin-inline-end: 14px;
  border-radius: 22px !important;
  border: 1px solid rgba(var(--v-theme-on-surface), .08);
  background: rgba(var(--v-theme-surface), .78) !important;
  backdrop-filter: blur(18px);
}
.zui-app-brand {
  min-width: 0;
}
.zui-avatar {
  border: 1px solid rgba(var(--v-theme-on-surface), .08);
  box-shadow: 0 8px 30px rgba(0,0,0,.18);
}
.zui-route-glyph {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  place-items: center;
  background: rgba(var(--v-theme-surface-variant), .68);
}
.zui-brand-title {
  font-weight: 800;
  letter-spacing: .04em;
  line-height: 1;
}
.zui-brand-subtitle {
  font-size: .78rem;
  opacity: .7;
  white-space: nowrap;
}
.zui-clock-chip {
  min-width: 84px;
  justify-content: center;
}
.zui-menu-card {
  background: rgba(var(--v-theme-surface), .9) !important;
  backdrop-filter: blur(18px);
}
.zui-theme-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
  box-shadow: 0 0 0 4px rgba(255,255,255,.05);
}
@media (max-width: 960px) {
  .zui-app-bar {
    margin-inline-start: 14px;
  }
}
</style>
