<template>
  <v-main class="zui-main">
    <div class="zui-main-wrap">
      <router-view />
    </div>
  </v-main>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.zui-main {
  margin: 96px 14px 14px 14px;
}
.zui-main-wrap {
  min-height: calc(100vh - 124px);
}
@media (max-width: 960px) {
  .zui-main {
    margin-top: 88px;
    margin-inline-start: 14px;
  }
}
</style>
