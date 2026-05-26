<template>
  <div class="zui-layout-shell">
    <v-app class="zui-app" style="overflow: auto;">
      <drawer :isMobile="isMobile" :displayDrawer="displayDrawer" @toggleDrawer="toggleDrawer" />
      <default-bar :isMobile="isMobile" @toggleDrawer="toggleDrawer" @openCommand="openCommand" />
      <default-view />
    </v-app>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import DefaultBar from './AppBar.vue'
import Drawer from './Drawer.vue'
import DefaultView from './View.vue'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()
const displayDrawer = ref(false)

const toggleDrawer = () => {
  displayDrawer.value = !displayDrawer.value
}

const openCommand = () => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
}

const isMobile = computed((): boolean => {
  displayDrawer.value = !smAndDown.value
  return smAndDown.value
})
</script>

<style scoped>
.zui-layout-shell {
  position: relative;
  min-height: 100vh;
}
.zui-app {
  background: transparent !important;
}
</style>
