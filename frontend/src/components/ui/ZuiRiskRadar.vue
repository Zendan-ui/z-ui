<template>
  <v-card class="zui-radar-card" rounded="xl">
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-3">
        <div class="d-flex align-center ga-3">
          <div class="zui-radar-icon"><ZuiGlyph name="spark" :size="22" /></div>
          <div>
            <div class="font-weight-bold">Z-UI Mission Control</div>
            <div class="text-caption text-medium-emphasis">A tested operational radar for the most important risks across the panel.</div>
          </div>
        </div>
        <v-chip :color="healthColor" variant="tonal" size="small">Health Score {{ healthScore }}</v-chip>
      </div>

      <v-row>
        <v-col cols="6" md="3" v-for="item in summaryCards" :key="item.label">
          <v-sheet rounded="xl" class="zui-radar-stat pa-3 h-100">
            <div class="d-flex align-center justify-space-between mb-2">
              <ZuiGlyph :name="item.glyph" :size="18" />
              <v-chip size="x-small" :color="item.color" variant="tonal">{{ item.value }}</v-chip>
            </div>
            <div class="text-caption text-medium-emphasis">{{ item.label }}</div>
          </v-sheet>
        </v-col>
      </v-row>

      <div class="mt-5 mb-2 d-flex align-center justify-space-between">
        <div class="font-weight-bold">Priority Queue</div>
        <v-btn variant="text" color="primary" @click="router.push('/clients')">Open Clients</v-btn>
      </div>

      <v-list class="bg-transparent py-0" density="compact" v-if="alerts.length > 0">
        <v-list-item v-for="alert in alerts" :key="`${alert.type}-${alert.title}`" rounded="xl" class="mb-1" @click="router.push(alert.path)">
          <template #prepend>
            <div class="zui-alert-mark" :class="alert.severity"></div>
          </template>
          <v-list-item-title>{{ alert.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ alert.subtitle }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-sheet v-else rounded="xl" class="zui-radar-empty pa-4 text-center text-medium-emphasis">
        No urgent incidents detected. Your workspace looks clean.
      </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ZuiGlyph from './ZuiGlyph.vue'
import { useZuiRadar } from '@/composables/useZuiRadar'

const router = useRouter()
const {
  expiredClients,
  expiringSoonClients,
  quotaReachedClients,
  disabledClients,
  onlineUsers,
  onlineInbounds,
  onlineOutbounds,
  healthScore,
  alerts,
} = useZuiRadar()

const summaryCards = computed(() => [
  { label: 'Expired', value: expiredClients.value.length, glyph: 'clients', color: 'error' },
  { label: 'Expiring Soon', value: expiringSoonClients.value.length, glyph: 'pulse', color: 'warning' },
  { label: 'Quota Reached', value: quotaReachedClients.value.length, glyph: 'outbounds', color: 'secondary' },
  { label: 'Disabled', value: disabledClients.value.length, glyph: 'admins', color: 'info' },
  { label: 'Online Users', value: onlineUsers.value, glyph: 'clients', color: 'success' },
  { label: 'Live Inbounds', value: onlineInbounds.value, glyph: 'inbounds', color: 'success' },
  { label: 'Live Outbounds', value: onlineOutbounds.value, glyph: 'outbounds', color: 'success' },
  { label: 'Attention', value: alerts.value.length, glyph: 'alert', color: 'primary' },
])

const healthColor = computed(() => healthScore.value >= 80 ? 'success' : healthScore.value >= 50 ? 'warning' : 'error')
</script>

<style scoped>
.zui-radar-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), .92), rgba(var(--v-theme-surface-variant), .68));
  border: 1px solid rgba(var(--v-theme-on-surface), .08);
  backdrop-filter: blur(18px);
}
.zui-radar-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(var(--v-theme-surface-variant), .7);
}
.zui-radar-stat {
  background: rgba(var(--v-theme-surface-variant), .54);
  border: 1px solid rgba(var(--v-theme-on-surface), .05);
}
.zui-alert-mark {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}
.zui-alert-mark.error { background: #ff6b7a; }
.zui-alert-mark.warning { background: #f6c85f; }
.zui-alert-mark.info { background: #3abff8; }
.zui-radar-empty {
  background: rgba(var(--v-theme-surface-variant), .45);
}
</style>
