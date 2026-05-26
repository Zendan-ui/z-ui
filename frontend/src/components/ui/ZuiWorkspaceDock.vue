<template>
  <div class="zui-dock">
    <button class="zui-dock-btn primary" @click="$emit('open-command')" title="Command Palette (Ctrl+K)">
      <ZuiGlyph name="command" :size="18" />
    </button>
    <div class="zui-dock-pill">
      <ZuiGlyph name="spark" :size="16" />
      <span>{{ themeLabel }}</span>
    </div>
    <div class="zui-dock-pill d-none d-sm-inline-flex">
      <ZuiGlyph name="admins" :size="16" />
      <span>{{ languageLabel }}</span>
    </div>
    <div class="zui-dock-pill d-none d-md-inline-flex">
      <span>{{ now }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import ZuiGlyph from './ZuiGlyph.vue'

const theme = useTheme()
const { t, locale } = useI18n()
const clock = ref(new Date())
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => { clock.value = new Date() }, 1000)
})
onBeforeUnmount(() => timer && clearInterval(timer))

const themeLabel = computed(() => t(`theme.${String(theme.global.name.value)}`))
const languageLabel = computed(() => ({ en: 'EN', fa: 'FA', ru: 'RU', ar: 'AR' }[String(locale.value)] || String(locale.value).toUpperCase()))
const now = computed(() => clock.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
</script>

<style scoped>
.zui-dock {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-theme-on-surface), .08);
  background: rgba(var(--v-theme-surface), .82);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 44px rgba(0,0,0,.18);
}
.zui-dock-btn {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 0;
  display: grid;
  place-items: center;
  background: rgba(var(--v-theme-surface-variant), .8);
  color: inherit;
  cursor: pointer;
}
.zui-dock-btn.primary {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), .26), rgba(var(--v-theme-secondary), .18));
}
.zui-dock-pill {
  height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(var(--v-theme-surface-variant), .58);
  font-size: .84rem;
}
@media (max-width: 960px) {
  .zui-dock {
    right: 12px;
    bottom: 12px;
  }
}
</style>
