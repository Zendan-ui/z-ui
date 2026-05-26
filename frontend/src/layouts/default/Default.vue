<template>
  <div class="zui-layout-shell">
    <v-app class="zui-app" style="overflow: auto;">
      <Drawer :isMobile="isMobile" :displayDrawer="displayDrawer" @toggleDrawer="toggleDrawer" />
      <DefaultBar :isMobile="isMobile" @toggleDrawer="toggleDrawer" />
      <DefaultView />
    </v-app>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import DefaultBar from './AppBar.vue'
import Drawer from './Drawer.vue'
import DefaultView from './View.vue'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()
const isMobile = smAndDown
const displayDrawer = ref(!smAndDown.value)

watch(smAndDown, (mobile) => {
  displayDrawer.value = !mobile
}, { immediate: true })

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
