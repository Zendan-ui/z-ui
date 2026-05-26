<template>
  <v-row class="mb-4">
    <v-col cols="12" md="7">
      <v-sheet class="zui-launch zui-launch-main" rounded="xl">
        <div class="text-overline zui-kicker">Z-UI Exclusive</div>
        <div class="text-h4 font-weight-black mb-2">Advanced operator workspace</div>
        <div class="text-body-2 text-medium-emphasis mb-5">
          A more refined control layer with custom glyphs, command palette, 4 themes, 4 languages and a cleaner operations-first surface.
        </div>
        <div class="d-flex flex-wrap ga-2">
          <v-chip color="primary" variant="tonal">Command Palette</v-chip>
          <v-chip color="secondary" variant="tonal">Custom Icon Set</v-chip>
          <v-chip color="success" variant="tonal">Launchpad</v-chip>
          <v-chip color="warning" variant="tonal">Workspace Dock</v-chip>
        </div>
      </v-sheet>
    </v-col>
    <v-col cols="12" md="5">
      <v-row>
        <v-col cols="6" v-for="item in cards" :key="item.path">
          <v-card class="zui-mini-card h-100" rounded="xl" @click="router.push(item.path)">
            <v-card-text>
              <div class="mb-3"><ZuiGlyph :name="item.glyph" :size="22" /></div>
              <div class="font-weight-bold mb-1">{{ item.label }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.desc }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ZuiGlyph from './ZuiGlyph.vue'

const router = useRouter()
const { t } = useI18n()
const cards = computed(() => [
  { label: t('pages.clients'), path: '/clients', glyph: 'clients', desc: 'Users, QR, usage and group workflows' },
  { label: t('pages.inbounds'), path: '/inbounds', glyph: 'inbounds', desc: 'Entry point visibility with cleaner cards' },
  { label: t('pages.outbounds'), path: '/outbounds', glyph: 'outbounds', desc: 'Route testing and egress confidence' },
  { label: t('pages.settings'), path: '/settings', glyph: 'settings', desc: 'Endpoint, port and security refinement' },
])
</script>

<style scoped>
.zui-launch {
  padding: 22px;
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), .88), rgba(var(--v-theme-surface-variant), .62));
  border: 1px solid rgba(var(--v-theme-on-surface), .08);
  backdrop-filter: blur(16px);
}
.zui-kicker {
  letter-spacing: .16em;
  opacity: .72;
}
.zui-mini-card {
  cursor: pointer;
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), .92), rgba(var(--v-theme-surface-variant), .68));
}
</style>
