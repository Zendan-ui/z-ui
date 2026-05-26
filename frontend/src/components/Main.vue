<template>
  <LogVue v-model="logModal.visible" :control="logModal" :visible="logModal.visible" />
  <Backup v-model="backupModal.visible" :control="backupModal" :visible="backupModal.visible" />
  <UsageStats v-model:visible="usageStatsModal.visible" />

  <v-container class="fill-height px-0" :loading="loading">
    <v-responsive>
      <v-row class="align-center justify-space-between mb-3 ga-3 zui-dashboard-actions">
        <v-col cols="12" md="auto">
          <div class="d-flex flex-wrap align-center ga-2">
            <v-dialog v-model="menu" :close-on-content-click="false" transition="scale-transition" max-width="880">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" hide-details variant="tonal" elevation="0">{{ $t('main.tiles') }} <v-icon icon="mdi-star-plus" class="ms-2" /></v-btn>
              </template>
              <v-card rounded="xl">
                <v-card-title>
                  <v-row>
                    <v-col>{{ $t('main.tiles') }}</v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="auto"><v-icon icon="mdi-close" @click="menu = false"></v-icon></v-col>
                  </v-row>
                </v-card-title>
                <v-divider></v-divider>
                <v-row v-for="items in menuItems" :key="items.title" density="compact">
                  <v-col cols="12">
                    <v-card :subtitle="items.title" variant="flat">
                      <v-card-text>
                        <v-row density="compact">
                          <v-col cols="12" md="6" lg="3" v-for="item in items.value" :key="item.value">
                            <v-switch density="compact" v-model="reloadItems" :value="item.value" color="primary" :label="item.title" hide-details></v-switch>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-dialog>

            <v-btn variant="tonal" elevation="0" @click="backupModal.visible = true">{{ $t('main.backup.title') }}<v-icon icon="mdi-backup-restore" class="ms-2" /></v-btn>
            <v-btn variant="tonal" elevation="0" @click="logModal.visible = true">{{ $t('basic.log.title') }} <v-icon icon="mdi-list-box-outline" class="ms-2" /></v-btn>
            <v-btn variant="tonal" elevation="0" @click="usageStatsModal.visible = true">{{ $t('main.stats.title') }} <v-icon icon="mdi-chart-box-outline" class="ms-2" /></v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="auto">
          <div class="d-flex flex-wrap ga-2 justify-md-end">
            <v-chip color="primary" variant="tonal">{{ systemHealth }}</v-chip>
            <v-chip color="secondary" variant="tonal">{{ sysFacts.length }} Specs</v-chip>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col :cols="12" :md="specCardSpan(i)" :lg="specCardSpan(i)" v-for="i in reloadItems" :key="i">
          <v-card class="rounded-xl zui-dashboard-card" variant="outlined" :class="{ 'zui-dashboard-card--detail': isDetailCard(i) }" :min-height="cardMinHeight(i)">
            <v-card-title class="d-flex align-center justify-space-between ga-2 flex-wrap">
              <div>{{ menuItems.flatMap(cat => cat.value).find(m => m.value == i)?.title }}</div>
              <div class="d-flex align-center ga-2">
                <v-icon v-if="i == 'i-sys'" icon="mdi-update" color="primary" @click="reloadSys()" size="small" v-tooltip:top="$t('actions.update')"></v-icon>
                <v-icon v-if="i == 'h-net'" icon="mdi-information" color="primary" size="small" :title="'↓' + HumanReadable.sizeFormat(tilesData.net?.recv) + ' - ' + HumanReadable.sizeFormat(tilesData.net?.sent) + '↑'"></v-icon>
              </div>
            </v-card-title>
            <v-card-text class="px-4 pb-4">
              <Gauge :tilesData="tilesData" :type="i" v-if="i.charAt(0) == 'g'" />
              <History :tilesData="tilesData" :type="i" v-if="i.charAt(0) == 'h'" />

              <template v-if="i == 'i-sys'">
                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-chip density="compact" color="primary" variant="tonal">{{ tilesData.sys?.platform || tilesData.sys?.os || '-' }}</v-chip>
                  <v-chip density="compact" color="secondary" variant="tonal">{{ tilesData.sys?.arch || '-' }}</v-chip>
                  <v-chip density="compact" color="info" variant="tonal">{{ tilesData.sys?.cpuCount || 0 }} {{ $t('main.info.core') }}</v-chip>
                  <v-chip density="compact" color="success" variant="tonal">v{{ tilesData.sys?.appVersion || '-' }}</v-chip>
                </div>
                <v-row density="compact">
                  <v-col cols="12" md="6" v-for="fact in sysFacts" :key="fact.label">
                    <div class="zui-spec-row">
                      <div class="zui-spec-label">{{ fact.label }}</div>
                      <div class="zui-spec-value" :class="fact.multiline ? 'multiline' : ''">
                        <template v-if="Array.isArray(fact.value)">
                          <div v-for="line in fact.value" :key="line">{{ line }}</div>
                        </template>
                        <template v-else>{{ fact.value }}</template>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </template>

              <template v-if="i == 'i-sbd'">
                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-chip density="compact" :color="tilesData.sbd?.running ? 'success' : 'error'" variant="tonal">{{ tilesData.sbd?.running ? $t('yes') : $t('no') }}</v-chip>
                  <v-chip density="compact" color="primary" variant="tonal">{{ Data().onlines.user?.length || 0 }} {{ $t('pages.clients') }}</v-chip>
                  <v-chip density="compact" color="secondary" variant="tonal">{{ Data().onlines.inbound?.length || 0 }} {{ $t('pages.inbounds') }}</v-chip>
                  <v-chip density="compact" color="info" variant="tonal">{{ Data().onlines.outbound?.length || 0 }} {{ $t('pages.outbounds') }}</v-chip>
                  <v-btn v-if="tilesData.sbd?.running && !loading" size="small" variant="tonal" color="warning" @click="restartSingbox()">{{ $t('actions.restartSb') }}</v-btn>
                </div>
                <v-row density="compact">
                  <v-col cols="12" md="6" v-for="fact in sbdFacts" :key="fact.label">
                    <div class="zui-spec-row">
                      <div class="zui-spec-label">{{ fact.label }}</div>
                      <div class="zui-spec-value">{{ fact.value }}</div>
                    </div>
                  </v-col>
                </v-row>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
import HttpUtils from '@/plugins/httputil'
import { HumanReadable } from '@/plugins/utils'
import Data from '@/store/modules/data'
import Gauge from '@/components/tiles/Gauge.vue'
import History from '@/components/tiles/History.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { i18n, locale } from '@/locales'
import LogVue from '@/layouts/modals/Logs.vue'
import Backup from '@/layouts/modals/Backup.vue'
import UsageStats from '@/layouts/modals/UsageStats.vue'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()
const loading = ref(false)
const menu = ref(false)
const menuItems = [
  { title: i18n.global.t('main.gauges'), value: [
    { title: i18n.global.t('main.gauge.cpu'), value: 'g-cpu' },
    { title: i18n.global.t('main.gauge.mem'), value: 'g-mem' },
    { title: i18n.global.t('main.gauge.dsk'), value: 'g-dsk' },
    { title: i18n.global.t('main.gauge.swp'), value: 'g-swp' },
  ]},
  { title: i18n.global.t('main.charts'), value: [
    { title: i18n.global.t('main.chart.cpu'), value: 'h-cpu' },
    { title: i18n.global.t('main.chart.mem'), value: 'h-mem' },
    { title: i18n.global.t('main.chart.net'), value: 'h-net' },
    { title: i18n.global.t('main.chart.pnet'), value: 'hp-net' },
    { title: i18n.global.t('main.chart.dio'), value: 'h-dio' },
  ]},
  { title: i18n.global.t('main.infos'), value: [
    { title: i18n.global.t('main.info.sys'), value: 'i-sys' },
    { title: i18n.global.t('main.info.sbd'), value: 'i-sbd' },
  ]},
]

const tilesData = ref<any>({})

const reloadItems = computed({
  get() { return Data().reloadItems },
  set(v: string[]) {
    if (Data().reloadItems.length === 0 && v.length > 0) startTimer()
    if (Data().reloadItems.length > 0 && v.length === 0) stopTimer()
    Data().reloadItems = v
    v.length > 0 ? localStorage.setItem('reloadItems', v.join(',')) : localStorage.removeItem('reloadItems')
  },
})

const isDetailCard = (type: string) => type === 'i-sys' || type === 'i-sbd'
const specCardSpan = (type: string) => isDetailCard(type) ? 12 : 6
const cardMinHeight = (type: string) => isDetailCard(type) ? undefined : (smAndDown.value ? 220 : 250)

const sysFacts = computed(() => {
  const sys = tilesData.value?.sys || {}
  return [
    { label: 'Hostname', value: sys.hostName || '-' },
    { label: 'Operating System', value: [sys.platform, sys.platformVersion].filter(Boolean).join(' ') || sys.os || '-' },
    { label: 'Kernel', value: [sys.kernelVersion, sys.kernelArch].filter(Boolean).join(' · ') || '-' },
    { label: 'Architecture', value: sys.arch || '-' },
    { label: 'CPU Model', value: sys.cpuType || '-' },
    { label: 'CPU Frequency', value: sys.cpuMHz ? `${Math.round(sys.cpuMHz)} MHz` : '-' },
    { label: 'CPU Threads', value: sys.cpuCount ? `${sys.cpuCount}` : '-' },
    { label: 'RAM', value: sys.memTotal ? `${HumanReadable.sizeFormat(sys.memUsed || 0)} / ${HumanReadable.sizeFormat(sys.memTotal)}` : '-' },
    { label: 'Swap', value: sys.swapTotal ? `${HumanReadable.sizeFormat(sys.swapUsed || 0)} / ${HumanReadable.sizeFormat(sys.swapTotal)}` : '-' },
    { label: 'Disk /', value: sys.diskTotal ? `${HumanReadable.sizeFormat(sys.diskUsed || 0)} / ${HumanReadable.sizeFormat(sys.diskTotal)}` : '-' },
    { label: 'Application Memory', value: sys.appMem ? HumanReadable.sizeFormat(sys.appMem) : '-' },
    { label: 'Application Threads', value: sys.appThreads || '-' },
    { label: 'Go Runtime', value: sys.goVersion || '-' },
    { label: 'Boot Time', value: sys.bootTime ? new Date(sys.bootTime * 1000).toLocaleString(locale) : '-' },
    { label: 'Uptime', value: sys.uptime ? HumanReadable.formatSecond(sys.uptime) : '-' },
    { label: 'Virtualization', value: [sys.virtualizationSystem, sys.virtualizationRole].filter(Boolean).join(' · ') || '-' },
    { label: 'IPv4', value: sys.ipv4?.length ? sys.ipv4 : ['-'], multiline: true },
    { label: 'IPv6', value: sys.ipv6?.length ? sys.ipv6 : ['-'], multiline: true },
  ]
})

const sbdFacts = computed(() => {
  const sbd = tilesData.value?.sbd || {}
  return [
    { label: 'Running', value: sbd.running ? 'Yes' : 'No' },
    { label: 'Runtime Memory', value: sbd.stats?.Alloc ? HumanReadable.sizeFormat(sbd.stats.Alloc) : '-' },
    { label: 'Goroutines', value: sbd.stats?.NumGoroutine || '-' },
    { label: 'Runtime Uptime', value: sbd.stats?.Uptime ? HumanReadable.formatSecond(sbd.stats.Uptime) : '-' },
    { label: 'Online Users', value: Data().onlines.user?.length || 0 },
    { label: 'Online Inbounds', value: Data().onlines.inbound?.length || 0 },
    { label: 'Online Outbounds', value: Data().onlines.outbound?.length || 0 },
  ]
})

const systemHealth = computed(() => {
  const sys = tilesData.value?.sys || {}
  if (!sys.memTotal || !sys.diskTotal) return 'Live Monitor'
  const memPct = sys.memTotal ? ((sys.memUsed || 0) / sys.memTotal) * 100 : 0
  const diskPct = sys.diskTotal ? ((sys.diskUsed || 0) / sys.diskTotal) * 100 : 0
  if (memPct > 92 || diskPct > 92) return 'Attention Required'
  if (memPct > 80 || diskPct > 80) return 'Watch State'
  return 'Healthy'
})

const reloadData = async () => {
  const request = [...new Set(reloadItems.value.map(r => r.split('-')[1]))]
  const data = await HttpUtils.get('api/status', { r: request.join(',') })
  if (data.success) tilesData.value = data.obj
}

const reloadSys = async () => {
  const data = await HttpUtils.get('api/status', { r: 'sys,sbd' })
  if (data.success) {
    tilesData.value.sys = data.obj.sys
    tilesData.value.sbd = data.obj.sbd
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null
const startTimer = () => { intervalId = setInterval(() => reloadData(), 3000) }
const stopTimer = () => { if (intervalId) { clearInterval(intervalId); intervalId = null } }

onMounted(async () => {
  loading.value = true
  if (Data().reloadItems.length !== 0) {
    await reloadData()
    startTimer()
  }
  loading.value = false
})

onBeforeUnmount(() => stopTimer())

const logModal = ref({ visible: false })
const backupModal = ref({ visible: false })
const usageStatsModal = ref({ visible: false })
const restartSingbox = async () => {
  loading.value = true
  await HttpUtils.post('api/restartSb', {})
  loading.value = false
}
</script>

<style scoped>
.zui-dashboard-actions {
  margin-inline: 0;
}
.zui-dashboard-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), .9), rgba(var(--v-theme-surface-variant), .62));
  border-color: rgba(var(--v-theme-on-surface), .08) !important;
}
.zui-dashboard-card--detail {
  min-height: unset;
}
.zui-spec-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(var(--v-theme-surface-variant), .42);
  border: 1px solid rgba(var(--v-theme-on-surface), .05);
  margin-bottom: 10px;
}
.zui-spec-label {
  font-size: .76rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  opacity: .64;
}
.zui-spec-value {
  font-weight: 600;
  line-height: 1.6;
  word-break: break-word;
}
.zui-spec-value.multiline {
  font-size: .92rem;
}
</style>
