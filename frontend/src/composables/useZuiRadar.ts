import { computed } from 'vue'
import Data from '@/store/modules/data'

export function useZuiRadar() {
  const data = Data()
  const now = () => Math.floor(Date.now() / 1000)

  const expiredClients = computed(() => data.clients.filter((c: any) => c.expiry > 0 && c.expiry <= now()))
  const expiringSoonClients = computed(() => data.clients.filter((c: any) => c.enable && c.expiry > now() && c.expiry <= now() + 3 * 86400))
  const quotaReachedClients = computed(() => data.clients.filter((c: any) => c.volume > 0 && (c.up + c.down) >= c.volume))
  const disabledClients = computed(() => data.clients.filter((c: any) => c.enable === false))
  const onlineUsers = computed(() => data.onlines?.user?.length ?? 0)
  const onlineInbounds = computed(() => data.onlines?.inbound?.length ?? 0)
  const onlineOutbounds = computed(() => data.onlines?.outbound?.length ?? 0)

  const alertCount = computed(() => expiredClients.value.length + expiringSoonClients.value.length + quotaReachedClients.value.length)
  const healthScore = computed(() => Math.max(12, 100 - expiredClients.value.length * 6 - quotaReachedClients.value.length * 4 - expiringSoonClients.value.length * 2))

  const alerts = computed(() => {
    const items: Array<{ type: string; title: string; subtitle: string; severity: 'error' | 'warning' | 'info'; path: string }> = []
    expiredClients.value.slice(0, 5).forEach((c: any) => items.push({
      type: 'expired',
      title: c.name,
      subtitle: 'Expired account requires attention',
      severity: 'error',
      path: '/clients',
    }))
    quotaReachedClients.value.slice(0, 5).forEach((c: any) => items.push({
      type: 'quota',
      title: c.name,
      subtitle: 'Traffic quota exhausted',
      severity: 'warning',
      path: '/clients',
    }))
    expiringSoonClients.value.slice(0, 5).forEach((c: any) => items.push({
      type: 'expiring',
      title: c.name,
      subtitle: 'Will expire in less than 3 days',
      severity: 'info',
      path: '/clients',
    }))
    return items.slice(0, 8)
  })

  return {
    expiredClients,
    expiringSoonClients,
    quotaReachedClients,
    disabledClients,
    onlineUsers,
    onlineInbounds,
    onlineOutbounds,
    alertCount,
    healthScore,
    alerts,
  }
}
