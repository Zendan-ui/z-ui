<template>
  <div class="zui-layout-shell">
    <v-app class="zui-app">
      <Drawer :is-mobile="isMobile" :display-drawer="displayDrawer" @toggleDrawer="toggleDrawer" />
      <DefaultBar :is-mobile="isMobile" @toggleDrawer="toggleDrawer" />
      <DefaultView :is-mobile="isMobile" />
    </v-app>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import DefaultBar from './AppBar.vue'
import Drawer from './Drawer.vue'
import DefaultView from './View.vue'

const route = useRoute()
const { mdAndDown } = useDisplay()
const isMobile = mdAndDown
const displayDrawer = ref(!mdAndDown.value)

watch(mdAndDown, (mobile) => {
  displayDrawer.value = !mobile
}, { immediate: true })

watch(() => route.fullPath, () => {
  if (mdAndDown.value) displayDrawer.value = false
})

const toggleDrawer = () => {
  displayDrawer.value = !displayDrawer.value
}
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
