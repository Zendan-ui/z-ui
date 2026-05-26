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
                <v-btn v-bind="props" hide-details variant="tonal" elevation="0">
                  {{ $t('main.tiles') }} <v-icon icon="mdi-star-plus" class="ms-2" />
                </v-btn>
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
            <v-chip color="success" variant="tonal">{{ runtimeStatus }}</v-chip>
          </div>
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="12" xl="7">
          <v-card class="zui-performance-board rounded-xl" variant="outlined">
            <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
              <div>
                <div class="text-overline zui-section-kicker">Performance Board</div>
                <div class="text-h6 font-weight-bold">Live CPU · RAM · Disk · Network</div>
              </div>
              <v-btn size="small" variant="tonal" color="primary" @click="reloadSys()">
                {{ $t('actions.update') }}
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" v-for="card in perfCards" :key="card.key">
                  <v-sheet class="zui-perf-card pa-4" rounded="xl">
                    <div class="d-flex align-center justify-space-between mb-3 ga-3">
                      <div class="d-flex align-center ga-3 min-w-0">
                        <div class="zui-perf-icon">
                          <v-icon :icon="card.icon" size="20"></v-icon>
                        </div>
                        <div class="min-w-0">
                          <div class="text-caption text-medium-emphasis text-uppercase">{{ card.label }}</div>
                          <div class="text-h5 font-weight-black text-truncate">{{ card.value }}</div>
                        </div>
                      </div>
                      <v-chip :color="card.color" variant="tonal" size="small">{{ card.badge }}</v-chip>
                    </div>
                    <div class="text-body-2 text-medium-emphasis mb-3">{{ card.subtitle }}</div>
                    <v-progress-linear :model-value="card.percent" :color="card.color" rounded height="10"></v-progress-linear>
                    <div class="d-flex justify-space-between mt-2 text-caption text-medium-emphasis">
                      <span>{{ card.hintLeft }}</span>
                      <span>{{ card.hintRight }}</span>
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" xl="5">
          <v-card class="rounded-xl zui-runtime-card" variant="outlined">
            <v-card-title>
              <div class="text-overline zui-section-kicker">System Snapshot</div>
              <div class="text-h6 font-weight-bold">Professional runtime overview</div>
            </v-card-title>
            <v-card-text>
              <v-row density="compact">
                <v-col cols="12" sm="6" v-for="fact in quickFacts" :key="fact.label">
                  <div class="zui-quick-row">
                    <div class="zui-quick-label">{{ fact.label }}</div>
                    <div class="zui-quick-value">{{ fact.value }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
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
    Data().reloadItems = v
    v.length > 0 ? localStorage.setItem('reloadItems', v.join(',')) : localStorage.removeItem('reloadItems')
  },
})

const percent = (current?: number, total?: number) => {
  if (!current || !total || total <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((current / total) * 100)))
}

const perfCards = computed(() => {
  const sys = tilesData.value?.sys || {}
  const net = tilesData.value?.net || {}
  const cpuValue = Math.round(tilesData.value?.cpu || 0)
  const memPct = percent(tilesData.value?.mem?.current, tilesData.value?.mem?.total)
  const dskPct = percent(tilesData.value?.dsk?.current, tilesData.value?.dsk?.total)
  return [
    {
      key: 'cpu',
      label: 'CPU',
      value: `${cpuValue}%`,
      badge: `${sys.cpuCount || 0} core`,
      subtitle: sys.cpuType || 'Processor load and real-time headroom',
      percent: cpuValue,
      color: cpuValue > 90 ? 'error' : cpuValue > 75 ? 'warning' : 'info',
      icon: 'mdi-chip',
      hintLeft: sys.cpuMHz ? `${Math.round(sys.cpuMHz)} MHz` : '-',
      hintRight: sys.load1 ? `load ${sys.load1.toFixed(2)}` : 'live',
    },
    {
      key: 'memory',
      label: 'RAM',
      value: tilesData.value?.mem?.total ? `${HumanReadable.sizeFormat(tilesData.value.mem.current || 0)} / ${HumanReadable.sizeFormat(tilesData.value.mem.total)}` : '-',
      badge: `${memPct}%`,
      subtitle: sys.appMem ? `App memory ${HumanReadable.sizeFormat(sys.appMem)}` : 'System memory usage',
      percent: memPct,
      color: memPct > 90 ? 'error' : memPct > 75 ? 'warning' : 'success',
      icon: 'mdi-memory',
      hintLeft: sys.swapTotal ? `Swap ${HumanReadable.sizeFormat(sys.swapUsed || 0)}` : 'swap -',
      hintRight: sys.swapTotal ? `${Math.round(sys.swapUsedPercent || 0)}%` : '-',
    },
    {
      key: 'disk',
      label: 'Disk',
      value: tilesData.value?.dsk?.total ? `${HumanReadable.sizeFormat(tilesData.value.dsk.current || 0)} / ${HumanReadable.sizeFormat(tilesData.value.dsk.total)}` : '-',
      badge: `${dskPct}%`,
      subtitle: 'Primary filesystem occupancy and safety margin',
      percent: dskPct,
      color: dskPct > 90 ? 'error' : dskPct > 75 ? 'warning' : 'secondary',
      icon: 'mdi-harddisk',
      hintLeft: sys.diskTotal ? `Total ${HumanReadable.sizeFormat(sys.diskTotal)}` : '-',
      hintRight: dskPct > 0 ? `${dskPct}% used` : '-',
    },
    {
      key: 'network',
      label: 'Network',
      value: net.recv || net.sent ? `${HumanReadable.sizeFormat(net.recv || 0)} ↓ / ${HumanReadable.sizeFormat(net.sent || 0)} ↑` : '-',
      badge: `${Data().onlines.user?.length || 0} online`,
      subtitle: 'Traffic counters plus active user visibility',
      percent: Math.min(100, Math.max(Data().onlines.user?.length || 0, Data().onlines.inbound?.length || 0) * 8),
      color: 'primary',
      icon: 'mdi-access-point-network',
      hintLeft: `${Data().onlines.inbound?.length || 0} in`,
      hintRight: `${Data().onlines.outbound?.length || 0} out`,
    },
  ]
})

const quickFacts = computed(() => {
  const sys = tilesData.value?.sys || {}
  return [
    { label: 'CPU Model', value: sys.cpuType || '-' },
    { label: 'Hostname', value: sys.hostName || '-' },
    { label: 'Go Runtime', value: sys.goVersion || '-' },
    { label: 'Kernel', value: sys.kernelVersion || '-' },
    { label: 'Boot Time', value: sys.bootTime ? new Date(sys.bootTime * 1000).toLocaleString(locale) : '-' },
    { label: 'Uptime', value: sys.uptime ? HumanReadable.formatSecond(sys.uptime) : '-' },
    { label: 'IPv4', value: sys.ipv4?.length ? sys.ipv4[0] : '-' },
    { label: 'Load Avg', value: sys.load1 ? `${sys.load1.toFixed(2)} / ${Number(sys.load5 || 0).toFixed(2)} / ${Number(sys.load15 || 0).toFixed(2)}` : '-' },
  ]
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
    { label: 'Load Average', value: sys.load1 ? `${sys.load1.toFixed(2)} / ${Number(sys.load5 || 0).toFixed(2)} / ${Number(sys.load15 || 0).toFixed(2)}` : '-' },
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
  const cpuPct = Number(tilesData.value?.cpu || 0)
  if (cpuPct > 92 || memPct > 92 || diskPct > 92) return 'Attention Required'
  if (cpuPct > 80 || memPct > 80 || diskPct > 80) return 'Watch State'
  return 'Healthy'
})

const runtimeStatus = computed(() => tilesData.value?.sbd?.running ? 'Sing-box Online' : 'Sing-box Offline')

const reloadData = async () => {
  const request = [...new Set(['cpu', 'mem', 'dsk', 'dio', 'net', 'sys', 'sbd', ...reloadItems.value.map(r => r.split('-')[1])])]
  const data = await HttpUtils.get('api/status', { r: request.join(',') })
  if (data.success) tilesData.value = data.obj
}

const reloadSys = async () => {
  const data = await HttpUtils.get('api/status', { r: 'cpu,mem,dsk,net,sys,sbd' })
  if (data.success) {
    tilesData.value = { ...tilesData.value, ...data.obj }
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null
const startTimer = () => { intervalId = setInterval(() => reloadData(), 3000) }
const stopTimer = () => { if (intervalId) { clearInterval(intervalId); intervalId = null } }

onMounted(async () => {
  loading.value = true
  await reloadData()
  startTimer()
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
.zui-section-kicker {
  letter-spacing: .14em;
  opacity: .66;
}
.zui-performance-board,
.zui-runtime-card,
.zui-dashboard-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), .9), rgba(var(--v-theme-surface-variant), .62));
  border-color: rgba(var(--v-theme-on-surface), .08) !important;
}
.zui-perf-card {
  background: rgba(var(--v-theme-surface-variant), .42);
  border: 1px solid rgba(var(--v-theme-on-surface), .05);
}
.zui-perf-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(var(--v-theme-background), .45);
}
.zui-quick-row,
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
.zui-quick-label,
.zui-spec-label {
  font-size: .76rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  opacity: .64;
}
.zui-quick-value,
.zui-spec-value {
  font-weight: 600;
  line-height: 1.6;
  word-break: break-word;
}
.zui-spec-value.multiline {
  font-size: .92rem;
}
.zui-dashboard-card--detail {
  min-height: unset;
}
</style>
