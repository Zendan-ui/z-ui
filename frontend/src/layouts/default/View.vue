<template>
  <v-main class="zui-main" :class="{ mobile: isMobile }">
    <div class="zui-main-wrap">
      <router-view />
    </div>
  </v-main>
</template>

<script lang="ts" setup>
defineProps<{ isMobile: boolean }>()
</script>

<style scoped>
.zui-main {
  margin-top: 96px;
  margin-inline: 14px;
  margin-inline-start: 312px;
}
.zui-main.mobile {
  margin-top: 84px;
  margin-inline-start: 14px;
  margin-bottom: 96px;
}
.zui-main-wrap {
  min-height: calc(100vh - 124px);
}
@media (max-width: 960px) {
  .zui-main {
    margin-top: 84px;
    margin-inline-start: 14px;
    margin-bottom: 96px;
  }
}
</style>
