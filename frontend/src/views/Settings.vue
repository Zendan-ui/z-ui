<template>
  <PageHeroAuto />
  <v-card class="zui-settings-card" :loading="loading">
    <v-card-text>
      <v-row class="mb-2">
        <v-col cols="12" lg="8">
          <div class="text-overline zui-settings-kicker">Z-UI Control Center</div>
          <div class="text-h5 font-weight-black mb-2">Professional panel and subscription settings</div>
          <div class="text-body-2 text-medium-emphasis">Manage panel endpoints, subscription exposure, TLS paths, retention windows and advanced profile outputs from a single place.</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="d-flex flex-wrap justify-lg-end ga-2">
            <v-chip color="primary" variant="tonal">v{{ settings.version || '-' }}</v-chip>
            <v-chip :color="settings.webTLS === 'true' ? 'success' : 'warning'" variant="tonal">Panel TLS {{ settings.webTLS === 'true' ? 'On' : 'Off' }}</v-chip>
            <v-chip :color="settings.subTLS === 'true' ? 'success' : 'warning'" variant="tonal">Sub TLS {{ settings.subTLS === 'true' ? 'On' : 'Off' }}</v-chip>
          </div>
        </v-col>
      </v-row>

      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-sheet class="zui-preview-card pa-4" rounded="xl">
            <div class="text-caption text-medium-emphasis mb-1">Panel Preview URI</div>
            <div class="zui-preview-uri" dir="ltr">{{ panelPreview }}</div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="6">
          <v-sheet class="zui-preview-card pa-4" rounded="xl">
            <div class="text-caption text-medium-emphasis mb-1">Subscription Preview URI</div>
            <div class="zui-preview-uri" dir="ltr">{{ subPreview }}</div>
          </v-sheet>
        </v-col>
      </v-row>

      <v-row align="center" justify="center" class="mb-4 ga-2">
        <v-col cols="12" md="auto">
          <v-btn color="primary" size="large" @click="save" :loading="loading" :disabled="!stateChange">
            {{ $t('actions.save') }}
          </v-btn>
        </v-col>
        <v-col cols="12" md="auto">
          <v-btn variant="outlined" color="warning" size="large" @click="restartApp" :loading="loading" :disabled="stateChange">
            {{ $t('actions.restartApp') }}
          </v-btn>
        </v-col>
        <v-col cols="12" md="auto">
          <v-btn variant="tonal" color="error" size="large" @click="resetToDefault" :loading="loading">
            Reset To Default
          </v-btn>
        </v-col>
      </v-row>

      <v-tabs v-model="tab" color="primary" align-tabs="center" show-arrows class="mb-3">
        <v-tab value="panel">Panel</v-tab>
        <v-tab value="subscription">Subscription</v-tab>
        <v-tab value="advanced">Advanced</v-tab>
        <v-tab value="json">{{ $t('setting.jsonSub') }}</v-tab>
        <v-tab value="clash">{{ $t('setting.clashSub') }}</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="panel">
          <v-row>
            <v-col cols="12" xl="7">
              <v-card class="zui-settings-section" rounded="xl" variant="flat">
                <v-card-title>Panel Interface</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6" md="4"><v-text-field v-model="settings.webListen" :label="$t('setting.addr')" hide-details /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-text-field v-model.number="webPort" min="1" type="number" :label="$t('setting.port')" hide-details /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-text-field v-model="settings.webPath" :label="$t('setting.webPath')" hide-details /></v-col>
                    <v-col cols="12" sm="6" md="6"><v-text-field v-model="settings.webDomain" :label="$t('setting.domain')" hide-details /></v-col>
                    <v-col cols="12" sm="6" md="6"><v-text-field v-model="settings.webURI" :label="$t('setting.webUri')" hide-details /></v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" xl="5">
              <v-card class="zui-settings-section" rounded="xl" variant="flat">
                <v-card-title>TLS Paths</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12"><v-text-field v-model="settings.webKeyFile" :label="$t('setting.sslKey')" hide-details /></v-col>
                    <v-col cols="12"><v-text-field v-model="settings.webCertFile" :label="$t('setting.sslCert')" hide-details /></v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="subscription">
          <v-row>
            <v-col cols="12" xl="8">
              <v-card class="zui-settings-section" rounded="xl" variant="flat">
                <v-card-title>Subscription Exposure</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6" md="4"><v-switch color="primary" v-model="subEncode" :label="$t('setting.subEncode')" hide-details /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-switch color="primary" v-model="subShowInfo" :label="$t('setting.subInfo')" hide-details /></v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="6" md="4"><v-text-field v-model="settings.subListen" :label="$t('setting.addr')" hide-details /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-text-field type="number" v-model.number="subPort" min="1" :label="$t('setting.port')" hide-details /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-text-field v-model="settings.subPath" :label="$t('setting.path')" hide-details /></v-col>
                    <v-col cols="12" sm="6" md="6"><v-text-field v-model="settings.subDomain" :label="$t('setting.domain')" hide-details /></v-col>
                    <v-col cols="12" sm="6" md="6"><v-text-field v-model="settings.subURI" :label="$t('setting.subUri')" hide-details /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-text-field type="number" v-model.number="subUpdates" min="0" :label="$t('setting.update')" hide-details /></v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" xl="4">
              <v-card class="zui-settings-section" rounded="xl" variant="flat">
                <v-card-title>Subscription TLS</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12"><v-text-field v-model="settings.subKeyFile" :label="$t('setting.sslKey')" hide-details /></v-col>
                    <v-col cols="12"><v-text-field v-model="settings.subCertFile" :label="$t('setting.sslCert')" hide-details /></v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="advanced">
          <v-row>
            <v-col cols="12" xl="6">
              <v-card class="zui-settings-section" rounded="xl" variant="flat">
                <v-card-title>Retention And Session</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6"><v-text-field type="number" v-model.number="sessionMaxAge" min="0" :label="$t('setting.sessionAge')" :suffix="$t('date.m')" hide-details /></v-col>
                    <v-col cols="12" sm="6"><v-text-field type="number" v-model.number="trafficAge" min="0" :label="$t('setting.trafficAge')" :suffix="$t('date.d')" hide-details /></v-col>
                    <v-col cols="12"><v-text-field v-model="settings.timeLocation" :label="$t('setting.timeLoc')" hide-details /></v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" xl="6">
              <v-card class="zui-settings-section" rounded="xl" variant="flat">
                <v-card-title>Operational Summary</v-card-title>
                <v-card-text>
                  <v-row density="compact">
                    <v-col cols="12" sm="6" v-for="fact in advancedFacts" :key="fact.label">
                      <div class="zui-setting-fact">
                        <div class="zui-setting-fact-label">{{ fact.label }}</div>
                        <div class="zui-setting-fact-value">{{ fact.value }}</div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="json">
          <SubJsonExtVue :settings="settings" />
        </v-window-item>

        <v-window-item value="clash">
          <SubClashExtVue :settings="settings" />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { i18n } from '@/locales'
import { Ref, computed, inject, onMounted, ref } from 'vue'
import HttpUtils from '@/plugins/httputil'
import { FindDiff } from '@/plugins/utils'
import SubJsonExtVue from '@/components/SubJsonExt.vue'
import SubClashExtVue from '@/components/SubClashExt.vue'
import { push } from 'notivue'

const tab = ref('panel')
const loading: Ref<boolean> = inject('loading') ?? ref(false)
const oldSettings = ref<any>({})

const defaultSettings = {
  webListen: '', webDomain: '', webPort: '2095', webCertFile: '', webKeyFile: '', webPath: '/app/', webURI: '',
  sessionMaxAge: '0', trafficAge: '30', timeLocation: 'Asia/Tehran',
  subListen: '', subPort: '2096', subPath: '/sub/', subDomain: '', subCertFile: '', subKeyFile: '',
  subUpdates: '12', subEncode: 'true', subShowInfo: 'false', subURI: '', subJsonExt: '', subClashExt: '',
  version: '', webTLS: 'false', subTLS: 'false', panelPreviewURI: '', subPreviewURI: '',
}

const settings = ref<any>({ ...defaultSettings })

onMounted(async () => {
  loading.value = true
  await loadData()
  loading.value = false
})

const loadData = async () => {
  const msg = await HttpUtils.get('api/settings')
  if (msg.success) setData({ ...defaultSettings, ...msg.obj })
}

const setData = (data: any) => {
  settings.value = { ...defaultSettings, ...data }
  oldSettings.value = JSON.parse(JSON.stringify(settings.value))
}

const savePayload = computed(() => {
  const clone = JSON.parse(JSON.stringify(settings.value))
  delete clone.version
  delete clone.webTLS
  delete clone.subTLS
  delete clone.panelPreviewURI
  delete clone.subPreviewURI
  return clone
})

const save = async () => {
  loading.value = true
  const msg = await HttpUtils.post('api/save', { object: 'settings', action: 'set', data: JSON.stringify(savePayload.value) })
  if (msg.success) {
    push.success({
      title: i18n.global.t('success'),
      duration: 5000,
      message: i18n.global.t('actions.set') + ' ' + i18n.global.t('pages.settings'),
    })
    await loadData()
  }
  loading.value = false
}

const resetToDefault = async () => {
  loading.value = true
  const msg = await HttpUtils.post('api/save', { object: 'settings', action: 'reset', data: '{}' })
  if (msg.success) {
    push.success({ title: i18n.global.t('success'), message: 'Settings reset to default', duration: 5000 })
    await loadData()
  }
  loading.value = false
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const restartApp = async () => {
  loading.value = true
  const msg = await HttpUtils.post('api/restartApp', {})
  if (msg.success) {
    await sleep(3000)
    window.location.replace(panelPreview.value + 'settings')
  }
  loading.value = false
}

const subEncode = computed({ get: () => settings.value.subEncode === 'true', set: (v: boolean) => { settings.value.subEncode = v ? 'true' : 'false' } })
const subShowInfo = computed({ get: () => settings.value.subShowInfo === 'true', set: (v: boolean) => { settings.value.subShowInfo = v ? 'true' : 'false' } })
const webPort = computed({ get: () => Number(settings.value.webPort || 2095), set: (v: number) => { settings.value.webPort = v > 0 ? String(v) : '2095' } })
const sessionMaxAge = computed({ get: () => Number(settings.value.sessionMaxAge || 0), set: (v: number) => { settings.value.sessionMaxAge = v > 0 ? String(v) : '0' } })
const trafficAge = computed({ get: () => Number(settings.value.trafficAge || 0), set: (v: number) => { settings.value.trafficAge = v > 0 ? String(v) : '0' } })
const subPort = computed({ get: () => Number(settings.value.subPort || 2096), set: (v: number) => { settings.value.subPort = v > 0 ? String(v) : '2096' } })
const subUpdates = computed({ get: () => Number(settings.value.subUpdates || 12), set: (v: number) => { settings.value.subUpdates = v > 0 ? String(v) : '12' } })
const panelPreview = computed(() => settings.value.panelPreviewURI || buildURL(settings.value.webDomain, settings.value.webPort, settings.value.webTLS === 'true', settings.value.webPath))
const subPreview = computed(() => settings.value.subPreviewURI || buildURL(settings.value.subDomain, settings.value.subPort, settings.value.subTLS === 'true', settings.value.subPath))

const buildURL = (host: string, port: string, isTLS: boolean, path: string) => {
  if (!host) host = window.location.hostname
  if (!port) port = window.location.port
  const protocol = isTLS ? 'https:' : 'http:'
  const fixedPath = path.startsWith('/') ? path : '/' + path
  const finalPath = fixedPath.endsWith('/') ? fixedPath : fixedPath + '/'
  const finalPort = (!port || (isTLS && port === '443') || (!isTLS && port === '80')) ? '' : `:${port}`
  return `${protocol}//${host}${finalPort}${finalPath}`
}

const advancedFacts = computed(() => [
  { label: 'Panel URI', value: panelPreview.value },
  { label: 'Subscription URI', value: subPreview.value },
  { label: 'Panel Port', value: settings.value.webPort },
  { label: 'Sub Port', value: settings.value.subPort },
  { label: 'Session Max Age', value: `${settings.value.sessionMaxAge} ${i18n.global.t('date.m')}` },
  { label: 'Traffic Retention', value: `${settings.value.trafficAge} ${i18n.global.t('date.d')}` },
  { label: 'Panel TLS', value: settings.value.webTLS === 'true' ? 'Enabled' : 'Disabled' },
  { label: 'Sub TLS', value: settings.value.subTLS === 'true' ? 'Enabled' : 'Disabled' },
])

const stateChange = computed(() => !FindDiff.deepCompare(savePayload.value, {
  ...oldSettings.value,
  version: undefined,
  webTLS: undefined,
  subTLS: undefined,
  panelPreviewURI: undefined,
  subPreviewURI: undefined,
}))
</script>

<style scoped>
.zui-settings-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), .92), rgba(var(--v-theme-surface-variant), .64));
}
.zui-settings-kicker {
  letter-spacing: .14em;
  opacity: .66;
}
.zui-preview-card,
.zui-settings-section {
  background: rgba(var(--v-theme-surface-variant), .45);
  border: 1px solid rgba(var(--v-theme-on-surface), .05);
}
.zui-preview-uri {
  font-weight: 700;
  word-break: break-all;
}
.zui-setting-fact {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(var(--v-theme-background), .25);
  border: 1px solid rgba(var(--v-theme-on-surface), .05);
  margin-bottom: 10px;
}
.zui-setting-fact-label {
  font-size: .76rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  opacity: .64;
}
.zui-setting-fact-value {
  font-weight: 600;
  line-height: 1.5;
  word-break: break-word;
}
</style>
