<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="zui-glyph"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="gid" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#7c6cff" />
        <stop offset="50%" stop-color="#19d3ff" />
        <stop offset="100%" stop-color="#ff5fd2" />
      </linearGradient>
    </defs>

    <template v-if="name === 'home'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M9.5 20v-5h5v5" />
    </template>

    <template v-else-if="name === 'inbounds'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M6 5h12v14H6z" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M12 8v8M8.5 11.5 12 8l3.5 3.5" />
    </template>

    <template v-else-if="name === 'outbounds'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M6 5h12v14H6z" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M12 16V8M8.5 12.5 12 16l3.5-3.5" />
    </template>

    <template v-else-if="name === 'clients'">
      <circle :stroke="stroke" stroke-width="1.8" cx="9" cy="9" r="3" />
      <circle :stroke="stroke" stroke-width="1.8" cx="16.5" cy="10.5" r="2.5" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M4.5 18c.8-2.2 2.9-3.5 5.5-3.5S14.7 15.8 15.5 18" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M14.5 17.5c.5-1.5 1.8-2.5 3.5-2.5 1.1 0 2 .3 2.8 1" />
    </template>

    <template v-else-if="name === 'endpoints'">
      <circle :stroke="stroke" stroke-width="1.8" cx="6.5" cy="12" r="2.5" />
      <circle :stroke="stroke" stroke-width="1.8" cx="17.5" cy="7" r="2.5" />
      <circle :stroke="stroke" stroke-width="1.8" cx="17.5" cy="17" r="2.5" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M8.7 10.8 15 8.1M8.7 13.2 15 15.9" />
    </template>

    <template v-else-if="name === 'services'">
      <rect :stroke="stroke" stroke-width="1.8" x="4" y="5" width="16" height="5" rx="1.8" />
      <rect :stroke="stroke" stroke-width="1.8" x="4" y="14" width="16" height="5" rx="1.8" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M8 7.5h.01M8 16.5h.01M11 7.5h5M11 16.5h5" />
    </template>

    <template v-else-if="name === 'tls'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 4 6 6.5V11c0 4 2.5 7.5 6 9 3.5-1.5 6-5 6-9V6.5L12 4Z" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M10.5 11.5a1.5 1.5 0 1 1 3 0c0 .9-.7 1.3-1.1 1.8-.2.2-.4.5-.4.9" />
      <circle :fill="stroke" cx="12" cy="16.8" r="0.9" />
    </template>

    <template v-else-if="name === 'basics'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M6 7h12M6 12h12M6 17h12" />
      <circle :fill="stroke" cx="9" cy="7" r="1.7" />
      <circle :fill="stroke" cx="15" cy="12" r="1.7" />
      <circle :fill="stroke" cx="11" cy="17" r="1.7" />
    </template>

    <template v-else-if="name === 'rules'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5 7h6l2 3h6M5 17h6l2-3h6" />
      <circle :fill="stroke" cx="5" cy="7" r="1.5" />
      <circle :fill="stroke" cx="19" cy="10" r="1.5" />
      <circle :fill="stroke" cx="5" cy="17" r="1.5" />
      <circle :fill="stroke" cx="19" cy="14" r="1.5" />
    </template>

    <template v-else-if="name === 'dns'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 4c4.4 0 8 1.8 8 4s-3.6 4-8 4-8-1.8-8-4 3.6-4 8-4Z" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 8v4c0 2.2 3.6 4 8 4s8-1.8 8-4V8" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 12v4c0 2.2 3.6 4 8 4s8-1.8 8-4v-4" />
    </template>

    <template v-else-if="name === 'admins'">
      <circle :stroke="stroke" stroke-width="1.8" cx="12" cy="8.5" r="3.2" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M6 18c1-2.6 3.1-4 6-4s5 1.4 6 4" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="m17.5 6.2 1 .9 1.5-.3-.6 1.4.8 1.2-1.6.1-.8 1.3-.6-1.4-1.5-.4 1.2-1-.1-1.6Z" />
    </template>

    <template v-else-if="name === 'settings'">
      <circle :stroke="stroke" stroke-width="1.8" cx="12" cy="12" r="3.2" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v2M12 17.5v2M19.5 12h-2M6.5 12h-2M17.3 6.7l-1.4 1.4M8.1 15.9l-1.4 1.4M17.3 17.3l-1.4-1.4M8.1 8.1 6.7 6.7" />
    </template>


    <template v-else-if="name === 'pulse'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 13h4l2-4 4 8 2-4h4" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M4 6.5h16M4 17.5h16" opacity=".35" />
    </template>

    <template v-else-if="name === 'alert'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 4 20 18H4L12 4Z" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M12 9.2v4.8" />
      <circle :fill="stroke" cx="12" cy="16.2" r="0.9" />
    </template>

    <template v-else-if="name === 'command'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="m7.5 10 2.5 2-2.5 2M12 14h4.5" />
    </template>

    <template v-else-if="name === 'spark'">
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="m12 3 2.1 5.4L19.5 10l-5.4 1.6L12 17l-2.1-5.4L4.5 10l5.4-1.6L12 3Z" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="m18.5 4 .5 1.3 1.5.5-1.5.5-.5 1.2-.5-1.2-1.5-.5 1.5-.5.5-1.3ZM5.5 16l.5 1.3 1.5.5-1.5.5-.5 1.2-.5-1.2-1.5-.5 1.5-.5.5-1.3Z" />
    </template>

    <template v-else>
      <circle :stroke="stroke" stroke-width="1.8" cx="12" cy="12" r="7" />
      <path :stroke="stroke" stroke-width="1.8" stroke-linecap="round" d="M12 8v4l2.5 2.5" />
    </template>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
}>(), {
  size: 20,
})

const gid = `zui-glyph-${Math.random().toString(36).slice(2, 10)}`
const stroke = computed(() => `url(#${gid})`)
</script>

<style scoped>
.zui-glyph {
  display: inline-block;
  vertical-align: middle;
  flex: 0 0 auto;
}
</style>
