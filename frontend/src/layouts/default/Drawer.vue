<template>
  <v-navigation-drawer
    :model-value="displayDrawer"
    :temporary="isMobile"
    :permanent="!isMobile"
    width="284"
    class="zui-drawer"
    @update:model-value="handleDrawerUpdate"
  >
    <div class="pa-3">
      <v-sheet rounded="xl" class="zui-drawer-brand pa-3">
        <div class="d-flex align-center ga-3">
          <v-avatar size="42" class="zui-drawer-avatar">
            <img src="@/assets/logo.svg" alt="Z-UI" />
          </v-avatar>
          <div>
            <div class="font-weight-bold">Z-UI</div>
            <div class="text-caption text-medium-emphasis">Exclusive Operator Interface</div>
          </div>
        </div>
      </v-sheet>
    </div>

    <v-list density="compact" nav class="px-2">
      <v-list-item
        link
        rounded="xl"
        class="mb-1"
        v-for="item in menu"
        :key="item.title"
        :to="item.path"
        :active="router.currentRoute.value.path == item.path"
        @click="isMobile ? emit('toggleDrawer') : null"
      >
        <template v-slot:prepend>
          <div class="zui-drawer-glyph"><ZuiGlyph :name="item.icon" :size="18" /></div>
        </template>
        <v-list-item-title v-text="$t(item.title)"></v-list-item-title>
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-3">
        <v-sheet rounded="xl" class="zui-drawer-footer pa-2">
          <v-list-item rounded="xl" @click="Logout">
            <template #prepend>
              <div class="zui-drawer-glyph"><ZuiGlyph name="spark" :size="18" /></div>
            </template>
            <v-list-item-title>{{ $t('menu.logout') }}</v-list-item-title>
          </v-list-item>
        </v-sheet>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import router from '@/router'
import { logout } from '@/plugins/httputil'
import ZuiGlyph from '@/components/ui/ZuiGlyph.vue'

const props = defineProps<{ isMobile: boolean; displayDrawer: boolean }>()
const emit = defineEmits(['toggleDrawer'])

const menu = [
  { title: 'pages.home', icon: 'home', path: '/' },
  { title: 'pages.inbounds', icon: 'inbounds', path: '/inbounds' },
  { title: 'pages.clients', icon: 'clients', path: '/clients' },
  { title: 'pages.outbounds', icon: 'outbounds', path: '/outbounds' },
  { title: 'pages.endpoints', icon: 'endpoints', path: '/endpoints' },
  { title: 'pages.services', icon: 'services', path: '/services' },
  { title: 'pages.tls', icon: 'tls', path: '/tls' },
  { title: 'pages.basics', icon: 'basics', path: '/basics' },
  { title: 'pages.rules', icon: 'rules', path: '/rules' },
  { title: 'pages.dns', icon: 'dns', path: '/dns' },
  { title: 'pages.admins', icon: 'admins', path: '/admins' },
  { title: 'pages.settings', icon: 'settings', path: '/settings' },
]

const handleDrawerUpdate = (value: boolean) => {
  if (props.isMobile && value !== props.displayDrawer) emit('toggleDrawer')
}

const Logout = async () => logout()
</script>

<style scoped>
.zui-drawer {
  margin: 14px;
  height: calc(100% - 28px) !important;
  border-radius: 24px !important;
  border: 1px solid rgba(var(--v-theme-on-surface), .08);
  background: rgba(var(--v-theme-surface), .82) !important;
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 40px rgba(0,0,0,.16);
}
.zui-drawer-brand,
.zui-drawer-footer {
  background: rgba(var(--v-theme-surface-variant), .55);
  border: 1px solid rgba(var(--v-theme-on-surface), .05);
}
.zui-drawer-avatar {
  box-shadow: 0 12px 40px rgba(0,0,0,.18);
}
.zui-drawer-glyph {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(var(--v-theme-surface-variant), .65);
}
</style>
