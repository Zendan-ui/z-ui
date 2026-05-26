<template>
  <v-container fluid class="zui-login-shell pa-4 pa-md-8 fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" xl="10" lg="11">
        <v-card class="zui-login-card overflow-hidden">
          <v-row no-gutters>
            <v-col cols="12" md="5" class="zui-login-hero d-none d-md-flex">
              <div class="zui-login-hero-content">
                <v-avatar size="72" class="mb-5 zui-login-logo">
                  <img src="@/assets/logo.svg" alt="Z-UI" />
                </v-avatar>
                <div class="text-h3 font-weight-black mb-2">Z-UI</div>
                <div class="text-subtitle-1 text-medium-emphasis mb-8">
                  Premium proxy orchestration with a cleaner visual identity, sharper workflows and a more modern control experience.
                </div>
                <div class="d-flex flex-wrap ga-2 mb-8">
                  <v-chip color="primary" variant="tonal">4 Themes</v-chip>
                  <v-chip color="secondary" variant="tonal">4 Languages</v-chip>
                  <v-chip color="success" variant="tonal">Sing-box Core</v-chip>
                </div>
                <v-sheet rounded="xl" class="zui-login-info pa-4">
                  <div class="text-overline mb-2">Z-UI Experience</div>
                  <div class="text-body-2 text-medium-emphasis">
                    Crafted for operators who want a faster, cleaner and more polished management panel without losing upstream power.
                  </div>
                </v-sheet>
              </div>
            </v-col>

            <v-col cols="12" md="7" class="zui-login-form">
              <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-3">
                <div class="d-flex align-center ga-2 flex-wrap">
                  <v-btn
                    v-for="lang in languages"
                    :key="lang.value"
                    size="small"
                    variant="tonal"
                    :color="currentLocale === lang.value ? 'primary' : undefined"
                    @click="changeLocale(lang.value)"
                  >
                    {{ lang.flag }} {{ lang.short }}
                  </v-btn>
                </div>

                <div class="d-flex align-center ga-2">
                  <button
                    v-for="th in themes"
                    :key="th.value"
                    class="zui-theme-swatch"
                    :class="{ active: activeTheme === th.value }"
                    :style="{ '--swatch': th.color }"
                    @click="changeTheme(th.value)"
                    :title="$t(`theme.${th.value}`)"
                  >
                    <span></span>
                  </button>
                </div>
              </div>

              <div class="d-flex align-center ga-3 mb-6 d-md-none">
                <v-avatar size="52">
                  <img src="@/assets/logo.svg" alt="Z-UI" />
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold">Z-UI</div>
                  <div class="text-caption text-medium-emphasis">Elegant Proxy Control</div>
                </div>
              </div>

              <div class="text-overline text-medium-emphasis mb-1">Secure Access</div>
              <div class="text-h4 font-weight-black mb-2">{{ $t('login.title') }}</div>
              <div class="text-body-2 text-medium-emphasis mb-8">
                Sign in to manage nodes, clients, routing rules and live traffic from a refined Z-UI dashboard.
              </div>

              <v-form @submit.prevent="login" ref="form" class="zui-login-fields">
                <v-text-field
                  v-model="username"
                  :label="$t('login.username')"
                  :rules="usernameRules"
                  prepend-inner-icon="mdi-account-circle-outline"
                  required
                />
                <v-text-field
                  v-model="password"
                  :label="$t('login.password')"
                  :rules="passwordRules"
                  type="password"
                  prepend-inner-icon="mdi-lock-outline"
                  required
                />
                <v-btn :loading="loading" type="submit" color="primary" size="large" block class="mt-4 zui-login-button">
                  {{ $t('actions.submit') }}
                </v-btn>
              </v-form>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useLocale, useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import HttpUtil from '@/plugins/httputil'
import { i18n, languages } from '@/locales'
import { themeOptions } from '@/config/ui'

const theme = useTheme()
const locale = useLocale()
const { locale: i18nLocale } = useI18n()
const router = useRouter()
const themes = themeOptions

const username = ref('')
const password = ref('')
const loading = ref(false)

const usernameRules = [
  (value: string) => (value?.length > 0 ? true : i18n.global.t('login.unRules')),
]
const passwordRules = [
  (value: string) => (value?.length > 0 ? true : i18n.global.t('login.pwRules')),
]

const activeTheme = computed(() => String(theme.global.name.value || localStorage.getItem('theme') || 'midnight'))
const currentLocale = computed(() => String(i18nLocale.value))

const login = async () => {
  if (!username.value || !password.value) return
  loading.value = true
  const response = await HttpUtil.post('api/login', { user: username.value, pass: password.value })
  if (response.success) {
    setTimeout(() => {
      loading.value = false
      router.push('/')
    }, 500)
  } else {
    loading.value = false
  }
}

const changeLocale = (l: string) => {
  i18nLocale.value = l
  locale.current.value = l
  localStorage.setItem('locale', l)
  window.location.reload()
}

const changeTheme = (th: string) => {
  theme.global.name.value = th as never
  localStorage.setItem('theme', th)
}
</script>

<style scoped>
.zui-login-shell {
  position: relative;
  z-index: 1;
}
.zui-login-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), .92), rgba(var(--v-theme-surface-variant), .76));
  border: 1px solid rgba(var(--v-theme-on-surface), .08);
  backdrop-filter: blur(20px);
}
.zui-login-hero {
  min-height: 720px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), .28), transparent 40%),
    radial-gradient(circle at bottom right, rgba(var(--v-theme-secondary), .18), transparent 44%),
    linear-gradient(180deg, rgba(var(--v-theme-background), .34), rgba(var(--v-theme-surface), .08));
}
.zui-login-hero-content {
  position: relative;
  z-index: 1;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.zui-login-form {
  padding: 34px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.zui-login-info {
  background: rgba(var(--v-theme-background), .24);
  border: 1px solid rgba(var(--v-theme-on-surface), .06);
}
.zui-login-logo {
  box-shadow: 0 18px 44px rgba(0,0,0,.22);
}
.zui-login-fields {
  display: grid;
  gap: 10px;
}
.zui-login-button {
  height: 52px;
  font-weight: 700;
  letter-spacing: .04em;
}
.zui-theme-swatch {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-theme-on-surface), .1);
  padding: 4px;
  background: transparent;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.zui-theme-swatch span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: var(--swatch);
}
.zui-theme-swatch.active {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(0,0,0,.18);
  border-color: rgba(var(--v-theme-primary), .8);
}
@media (max-width: 960px) {
  .zui-login-form {
    padding: 24px;
  }
}
</style>
