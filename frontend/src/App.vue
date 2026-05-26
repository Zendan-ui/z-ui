<template>
  <div class="zui-root" :data-theme="themeName">
    <div class="zui-bg zui-bg-a"></div>
    <div class="zui-bg zui-bg-b"></div>
    <div class="zui-grid"></div>
    <v-overlay
      :model-value="loading"
      persistent
      content-class="text-center"
      class="align-center justify-center"
    >
      <v-progress-circular indeterminate size="64"></v-progress-circular>
      <br />
      {{ $t('loading') }}
    </v-overlay>
    <Message />
    <router-view />
    <v-dialog v-model="radarOpen" max-width="980">
      <ZuiRiskRadar />
    </v-dialog>
    <ZuiWorkspaceDock />
  </div>
</template>

<script lang="ts" setup>
import Message from '@/components/message.vue'
import ZuiWorkspaceDock from '@/components/ui/ZuiWorkspaceDock.vue'
import ZuiRiskRadar from '@/components/ui/ZuiRiskRadar.vue'
import { computed, inject, onBeforeUnmount, onMounted, ref, Ref, watchEffect } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { isRtlLocale } from '@/locales'

const loading: Ref<boolean> = inject('loading') ?? ref(false)
const theme = useTheme()
const { locale } = useI18n()
const radarOpen = ref(false)

const themeName = computed(() => String(theme.global.name.value))
const openRadar = () => { radarOpen.value = true }
const handleRadar = () => openRadar()

onMounted(() => {
  window.addEventListener('zui:open-radar', handleRadar)
})
onBeforeUnmount(() => {
  window.removeEventListener('zui:open-radar', handleRadar)
})

watchEffect(() => {
  document.title = `Z-UI • ${document.location.hostname}`
  document.documentElement.lang = locale.value
  document.documentElement.dir = isRtlLocale(locale.value) ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('data-theme', themeName.value)
})
</script>

<style>
:root {
  color-scheme: dark;
}

html, body, #app {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: Inter, Vazirmatn, Roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: rgb(var(--v-theme-background));
}

.zui-root {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  color: rgb(var(--v-theme-on-surface));
}

.zui-bg {
  position: fixed;
  border-radius: 999px;
  filter: blur(90px);
  opacity: .22;
  pointer-events: none;
  z-index: 0;
}

.zui-bg-a {
  inset-inline-start: -120px;
  top: -60px;
  width: 360px;
  height: 360px;
  background: rgb(var(--v-theme-primary));
}

.zui-bg-b {
  inset-inline-end: -140px;
  bottom: -80px;
  width: 420px;
  height: 420px;
  background: rgb(var(--v-theme-secondary));
}

.zui-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: .07;
  background-image:
    linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(circle at center, black 35%, transparent 85%);
}

.v-application,
.v-main,
.v-navigation-drawer,
.v-app-bar {
  position: relative;
  z-index: 1;
}

.v-overlay,
.v-overlay__scrim,
.v-overlay__content,
.v-dialog > .v-overlay__content {
  z-index: 2400 !important;
}

.v-card {
  border: 1px solid rgba(var(--v-theme-on-surface), .06);
  box-shadow: 0 18px 60px rgba(0, 0, 0, .16);
}

.v-field {
  backdrop-filter: blur(12px);
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), .45);
  border-radius: 999px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
</style>
