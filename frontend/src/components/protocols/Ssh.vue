<template>
  <v-card class="zui-ssh-card" rounded="xl">
    <v-card-text>
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
        <div>
          <div class="text-overline zui-ssh-kicker">SSH Transport</div>
          <div class="text-h6 font-weight-bold">Professional SSH outbound</div>
        </div>
        <v-chip color="primary" variant="tonal">Port {{ data.server_port || 22 }}</v-chip>
      </div>

      <div class="d-flex flex-wrap ga-2 mb-4">
        <v-btn :variant="!optionKey ? 'flat' : 'tonal'" :color="!optionKey ? 'primary' : undefined" @click="switchToPassword">Password Auth</v-btn>
        <v-btn :variant="optionKey ? 'flat' : 'tonal'" :color="optionKey ? 'primary' : undefined" @click="switchToKey">Private Key Auth</v-btn>
      </div>

      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-text-field v-model="data.server" :label="$t('out.addr')" hide-details></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field v-model.number="data.server_port" type="number" min="1" max="65535" :label="$t('out.port')" hide-details></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field v-model="data.user" :label="$t('types.un')" hide-details></v-text-field>
        </v-col>
      </v-row>

      <template v-if="!optionKey">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="data.password" :label="$t('types.pw')" type="password" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="data.client_version" :label="$t('types.ssh.clientVer')" hide-details></v-text-field>
          </v-col>
        </v-row>
      </template>

      <template v-else>
        <v-row>
          <v-col cols="12">
            <v-btn-toggle v-model="usePath" class="rounded-xl mb-2" density="compact" variant="outlined" mandatory>
              <v-btn @click="data.private_key = undefined; data.private_key_path = ''">{{ $t('tls.usePath') }}</v-btn>
              <v-btn @click="data.private_key_path = undefined; data.private_key = ''">{{ $t('tls.useText') }}</v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="12" md="6" v-if="usePath === 0">
            <v-text-field :label="$t('tls.keyPath')" hide-details v-model="data.private_key_path"></v-text-field>
          </v-col>
          <v-col cols="12" v-else>
            <v-textarea :label="$t('tls.key')" auto-grow rows="4" hide-details v-model="data.private_key"></v-textarea>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field :label="$t('types.ssh.passphrase')" hide-details v-model="data.private_key_passphrase"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="data.client_version" :label="$t('types.ssh.clientVer')" hide-details></v-text-field>
          </v-col>
        </v-row>
      </template>

      <v-expansion-panels class="mt-4" variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title>{{ $t('types.ssh.options') }}</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-switch v-model="optionHostKey" color="primary" :label="$t('types.ssh.hostKey')" hide-details></v-switch>
                <v-textarea v-if="optionHostKey" :label="$t('types.ssh.hostKey')" auto-grow rows="4" hide-details v-model="host_key"></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="optionAlgorithms" color="primary" :label="$t('types.ssh.algorithm')" hide-details></v-switch>
                <v-combobox
                  v-if="optionAlgorithms"
                  v-model="algorithmItems"
                  :label="$t('types.ssh.algorithm')"
                  chips
                  closable-chips
                  multiple
                  clearable
                  hide-details
                ></v-combobox>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
export default {
  props: ['data'],
  data() {
    return {
      usePath: 0,
    }
  },
  mounted() {
    if (!this.data.server_port) this.data.server_port = 22
    if (!this.data.client_version) this.data.client_version = 'SSH-2.0-OpenSSH_9.7'
    if (this.data.private_key && !this.data.private_key_path) this.usePath = 1
  },
  computed: {
    optionKey: {
      get(): boolean { return this.data.private_key != undefined || this.data.private_key_path != undefined },
      set(v: boolean) {
        this.usePath = 0
        if (v) {
          this.$props.data.private_key_path = this.$props.data.private_key_path ?? ''
          delete this.$props.data.password
        } else {
          delete this.$props.data.private_key_path
          delete this.$props.data.private_key
          delete this.$props.data.private_key_passphrase
        }
      },
    },
    optionHostKey: {
      get(): boolean { return this.data.host_key != undefined },
      set(v: boolean) { this.data.host_key = v ? [] : undefined },
    },
    optionAlgorithms: {
      get(): boolean { return this.data.host_key_algorithms != undefined },
      set(v: boolean) { this.data.host_key_algorithms = v ? [] : undefined },
    },
    host_key: {
      get(): string { return this.$props.data.host_key ? this.$props.data.host_key.join('\n') : '' },
      set(v: string) { this.$props.data.host_key = v.split('\n').map((i: string) => i.trim()).filter((i: string) => i.length > 0) },
    },
    algorithmItems: {
      get(): string[] { return this.$props.data.host_key_algorithms ? [...this.$props.data.host_key_algorithms] : [] },
      set(v: string[]) { this.$props.data.host_key_algorithms = v.filter((i: string) => i && i.trim().length > 0) },
    },
  },
  methods: {
    switchToPassword() {
      this.optionKey = false
      this.$props.data.password = this.$props.data.password ?? ''
    },
    switchToKey() {
      this.optionKey = true
      this.$props.data.private_key_path = this.$props.data.private_key_path ?? ''
    },
  },
}
</script>

<style scoped>
.zui-ssh-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), .92), rgba(var(--v-theme-surface-variant), .62));
  border: 1px solid rgba(var(--v-theme-on-surface), .08);
}
.zui-ssh-kicker {
  letter-spacing: .12em;
  opacity: .68;
}
</style>
