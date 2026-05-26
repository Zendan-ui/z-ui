<template>
  <v-dialog v-model="open" max-width="860" persistent>
    <v-card class="zui-command-card">
      <v-card-text class="pa-3 pa-md-4">
        <div class="d-flex align-center ga-3 mb-3">
          <div class="zui-command-icon">
            <ZuiGlyph name="command" :size="22" />
          </div>
          <div>
            <div class="font-weight-bold">Z-UI Command Palette</div>
            <div class="text-caption text-medium-emphasis">Jump across pages, entities, themes and languages from one operator console.</div>
          </div>
          <v-spacer />
          <v-btn icon variant="text" @click="open = false"><v-icon icon="mdi-close" /></v-btn>
        </div>

        <v-text-field
          v-model="query"
          autofocus
          placeholder="Search pages, clients, inbounds, outbounds, endpoints, services..."
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          class="mb-3"
          hide-details
        />

        <div class="zui-command-group mb-3">
          <div class="zui-command-label">Pages</div>
          <v-list class="bg-transparent py-0" density="compact">
            <v-list-item
              v-for="page in filteredPages"
              :key="page.path"
              rounded="xl"
              @click="go(page.path)"
            >
              <template #prepend>
                <ZuiGlyph :name="page.glyph" :size="18" />
              </template>
              <v-list-item-title>{{ page.label }}</v-list-item-title>
              <template #append>
                <span class="text-caption text-medium-emphasis">{{ page.path }}</span>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <div class="zui-command-group mb-3">
          <div class="zui-command-label">Entities</div>
          <v-list class="bg-transparent py-0" density="compact" v-if="filteredEntities.length > 0">
            <v-list-item
              v-for="entity in filteredEntities"
              :key="`${entity.kind}-${entity.label}`"
              rounded="xl"
              @click="go(entity.path)"
            >
              <template #prepend>
                <ZuiGlyph :name="entity.glyph" :size="18" />
              </template>
              <v-list-item-title>{{ entity.label }}</v-list-item-title>
              <v-list-item-subtitle>{{ entity.subtitle }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-sheet v-else rounded="xl" class="zui-empty pa-3 text-medium-emphasis text-caption">
            No matching entities found in the currently loaded workspace.
          </v-sheet>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <div class="zui-command-group">
              <div class="zui-command-label">Themes</div>
              <v-list class="bg-transparent py-0" density="compact">
                <v-list-item
                  v-for="th in filteredThemes"
                  :key="th.value"
                  rounded="xl"
                  @click="applyTheme(th.value)"
                  :active="activeThemeName === th.value"
                >
                  <template #prepend>
                    <span class="zui-dot" :style="{ background: th.color }"></span>
                  </template>
                  <v-list-item-title>{{ $t(`theme.${th.value}`) }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="zui-command-group">
              <div class="zui-command-label">Languages</div>
              <v-list class="bg-transparent py-0" density="compact">
                <v-list-item
                  v-for="lang in filteredLanguages"
                  :key="lang.value"
                  rounded="xl"
                  @click="applyLanguage(lang.value)"
                  :active="currentLocale === lang.value"
                >
                  <template #prepend>
                    <span>{{ lang.flag }}</span>
                  </template>
                  <v-list-item-title>{{ lang.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme, useLocale } from 'vuetify'
import { useI18n } from 'vue-i18n'
import ZuiGlyph from './ZuiGlyph.vue'
import { languageOptions, themeOptions } from '@/config/ui'
import Data from '@/store/modules/data'

const router = useRouter()
const theme = useTheme()
const vuetifyLocale = useLocale()
const { t, locale } = useI18n()
const data = Data()

const open = ref(false)
const query = ref('')

const pages = computed(() => [
  { label: t('pages.home'), path: '/', glyph: 'home' },
  { label: t('pages.inbounds'), path: '/inbounds', glyph: 'inbounds' },
  { label: t('pages.clients'), path: '/clients', glyph: 'clients' },
  { label: t('pages.outbounds'), path: '/outbounds', glyph: 'outbounds' },
  { label: t('pages.endpoints'), path: '/endpoints', glyph: 'endpoints' },
  { label: t('pages.services'), path: '/services', glyph: 'services' },
  { label: t('pages.tls'), path: '/tls', glyph: 'tls' },
  { label: t('pages.basics'), path: '/basics', glyph: 'basics' },
  { label: t('pages.rules'), path: '/rules', glyph: 'rules' },
  { label: t('pages.dns'), path: '/dns', glyph: 'dns' },
  { label: t('pages.admins'), path: '/admins', glyph: 'admins' },
  { label: t('pages.settings'), path: '/settings', glyph: 'settings' },
])

const entities = computed(() => [
  ...data.clients.map((c: any) => ({ kind: 'client', label: c.name, subtitle: c.desc || c.group || 'Client', path: '/clients', glyph: 'clients' })),
  ...data.inbounds.map((i: any) => ({ kind: 'inbound', label: i.tag, subtitle: i.type || 'Inbound', path: '/inbounds', glyph: 'inbounds' })),
  ...data.outbounds.map((o: any) => ({ kind: 'outbound', label: o.tag, subtitle: o.type || 'Outbound', path: '/outbounds', glyph: 'outbounds' })),
  ...data.endpoints.map((e: any) => ({ kind: 'endpoint', label: e.tag, subtitle: e.type || 'Endpoint', path: '/endpoints', glyph: 'endpoints' })),
  ...data.services.map((s: any) => ({ kind: 'service', label: s.tag, subtitle: s.type || 'Service', path: '/services', glyph: 'services' })),
])

const q = computed(() => query.value.trim().toLowerCase())
const filteredPages = computed(() => !q.value ? pages.value : pages.value.filter(p => `${p.label} ${p.path}`.toLowerCase().includes(q.value)))
const filteredEntities = computed(() => !q.value ? entities.value.slice(0, 8) : entities.value.filter(e => `${e.label} ${e.subtitle}`.toLowerCase().includes(q.value)).slice(0, 8))
const filteredThemes = computed(() => !q.value ? themeOptions : themeOptions.filter(th => `${th.value} ${t(`theme.${th.value}`)}`.toLowerCase().includes(q.value)))
const filteredLanguages = computed(() => !q.value ? languageOptions : languageOptions.filter(l => `${l.title} ${l.value}`.toLowerCase().includes(q.value)))
const activeThemeName = computed(() => String(theme.global.name.value))
const currentLocale = computed(() => String(locale.value))

const go = async (path: string) => {
  open.value = false
  query.value = ''
  await router.push(path)
}

const applyTheme = (value: string) => {
  theme.global.name.value = value as never
  localStorage.setItem('theme', value)
  open.value = false
}

const applyLanguage = (value: string) => {
  locale.value = value as never
  vuetifyLocale.current.value = value
  localStorage.setItem('locale', value)
  window.location.reload()
}

const onKey = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value = !open.value
  }
  if (e.key === 'Escape' && open.value) {
    open.value = false
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

defineExpose({ show: () => { open.value = true } })
</script>

<style scoped>
.zui-command-card {
  background: rgba(var(--v-theme-surface), .92) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), .08);
  backdrop-filter: blur(20px);
}
.zui-command-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(var(--v-theme-surface-variant), .7);
}
.zui-command-label {
  font-size: .78rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  opacity: .7;
  margin: 0 0 6px 6px;
}
.zui-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
}
.zui-empty {
  background: rgba(var(--v-theme-surface-variant), .45);
  border: 1px dashed rgba(var(--v-theme-on-surface), .08);
}
</style>
